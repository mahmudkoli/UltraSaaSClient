import { Route, expect, test } from '@playwright/test';
import { ADMIN_PASSWORD, ELECTRO_EMAIL, ELECTRO_TENANT, login } from './auth.setup';

/**
 * Phase 2.52 — Subscription-expired lockout E2E.
 *
 * Strategy: rather than flipping real tenant state (which would corrupt
 * seeded fixtures used by other tests when cleanup fails), we mock the
 * `/api/mysubscription` endpoint that drives `SubscriptionGuard`. This gives
 * us deterministic coverage of the redirect logic + lockout-page rendering
 * without any blast radius.
 *
 * Trade-off: the guard's *integration* with the backend isn't tested here;
 * that lives in SubscriptionBillingFlowTests on the backend side. What's
 * tested here is the UI-side contract: given a suspended-subscription
 * response, the guard MUST redirect and the lockout page MUST render.
 */

test.setTimeout(60000);

const API = 'http://localhost:5000';

const ACTIVE_SUB = {
    tenantId: 'electroplus',
    tenantName: 'ElectroPlus',
    validUpto: '2099-12-31T00:00:00Z',
    daysUntilExpiry: 9999,
    paymentStatus: 'Active',
    isSystemActive: true,
    severity: 'none',
};

const SUSPENDED_SUB = {
    tenantId: 'electroplus',
    tenantName: 'ElectroPlus',
    validUpto: '2026-01-01T00:00:00Z',
    daysUntilExpiry: -30,
    paymentStatus: 'Suspended',
    isSystemActive: false,
    severity: 'urgent',
    technicalAdminEmail: 'admin@electroplus.com',
    suspensionReason: 'Payment overdue (e2e mock)',
    plan: { name: 'Starter', monthlyFeeBDT: 2000 },
};

/** Intercept the mysubscription endpoint and return a fixed payload. */
async function mockMySubscription(page: import('@playwright/test').Page, payload: object) {
    await page.route(`${API}/api/mysubscription`, async (route: Route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(payload),
        });
    });
}

test.describe('Subscription lockout — SubscriptionGuard + /subscription-expired', () => {

    // ════════════════════════════════════════════════════════════
    // Active tenant: navigation proceeds normally
    // ════════════════════════════════════════════════════════════

    test('active subscription: admin route loads without redirect', async ({ page }) => {
        await mockMySubscription(page, ACTIVE_SUB);
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });

        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');
        await expect(page).not.toHaveURL(/subscription-expired/);
    });

    test('active subscription: /subscription-expired bounces back to return URL', async ({ page }) => {
        await mockMySubscription(page, ACTIVE_SUB);
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });

        // Component-level: when the page loads for an active sub, it redirects
        // to the `return` query param (default /dashboard).
        await page.goto('/subscription-expired?return=%2Fpos');
        await page.waitForLoadState('networkidle');
        await expect(page).not.toHaveURL(/subscription-expired/);
    });

    // ════════════════════════════════════════════════════════════
    // Suspended tenant: guard redirects, lockout page renders the expected chrome
    // ════════════════════════════════════════════════════════════

    test('suspended subscription: admin route is redirected to /subscription-expired', async ({ page }) => {
        await mockMySubscription(page, SUSPENDED_SUB);
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });

        await page.goto('/sales');
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveURL(/subscription-expired/);
    });

    test('lockout page surfaces tenant + suspension reason + support contact', async ({ page }) => {
        await mockMySubscription(page, SUSPENDED_SUB);
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });

        await page.goto('/subscription-expired');
        await page.waitForLoadState('networkidle');

        await expect(page.locator('body')).toContainText(/Subscription is currently inactive/i);
        await expect(page.locator('body')).toContainText(SUSPENDED_SUB.tenantName);
        await expect(page.locator('body')).toContainText(SUSPENDED_SUB.suspensionReason);
        // Support contact link
        await expect(page.locator('a[href^="mailto:support@"]').first()).toBeVisible();
        // Sign-out is always available (cashier must be able to leave)
        await expect(page.locator('a[routerlink="/sign-out"], button:has-text("Sign out")').first()).toBeVisible();
    });

    test('lockout page exposes "I\'ve paid — check again" refresh affordance', async ({ page }) => {
        await mockMySubscription(page, SUSPENDED_SUB);
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });

        await page.goto('/subscription-expired');
        await page.waitForLoadState('networkidle');

        await expect(page.locator('button:has-text("I\'ve paid")')).toBeVisible();
    });

    // ════════════════════════════════════════════════════════════
    // Backend contract sanity: real /api/mysubscription returns the shape
    // SubscriptionGuard expects (this DOES hit the live backend — no mock).
    // ════════════════════════════════════════════════════════════

    test('/api/mysubscription returns the expected shape for an active tenant', async ({ request }) => {
        const auth = await request.post(`${API}/api/tokens`, {
            headers: { 'Content-Type': 'application/json', tenant: ELECTRO_TENANT },
            data: { email: ELECTRO_EMAIL, password: ADMIN_PASSWORD },
        });
        expect(auth.ok()).toBeTruthy();
        const { token } = await auth.json();

        const res = await request.get(`${API}/api/mysubscription`, {
            headers: { tenant: ELECTRO_TENANT, Authorization: `Bearer ${token}` },
        });
        expect(res.ok()).toBeTruthy();
        const sub = await res.json();
        // Required guard inputs
        expect(sub).toHaveProperty('isSystemActive');
        expect(sub).toHaveProperty('paymentStatus');
        expect(sub).toHaveProperty('tenantName');
        expect(sub).toHaveProperty('validUpto');
        // For a seeded demo tenant, system must be active
        expect(sub.isSystemActive).toBe(true);
    });
});
