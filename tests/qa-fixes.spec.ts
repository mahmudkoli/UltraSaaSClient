import { test, expect } from '@playwright/test';
import { login, loginAsGreenwoodAdmin } from './auth.setup';

test.setTimeout(60000);

/**
 * Phase v1 QA remediation — UI verification of the fixes.
 *   C1 — admin fallback card on /my-profile
 *   C2 — global 404 page on unknown routes
 *   C3 — billing/usage placeholder pages
 *   C4 — subdomain hint sourced from environment (no hardcoded brand domain)
 *   H1 — student/teacher list bind real IDs (no literal "Student ID" text)
 *   H8 — fee-reports disambiguated "Overdue" headers
 */

test.describe('QA fixes — sign-in (unauthenticated)', () => {
    test('BUG-R5 — failed login shows a friendly message, not raw HTTP text', async ({ page }) => {
        await page.goto('/sign-in');
        await page.waitForSelector('#email', { timeout: 15000 });
        // Bogus, non-existent account — cannot lock out any real user.
        await page.locator('#tenant').fill('root');
        await page.locator('#email').fill('nobody-xyz@nowhere.test');
        await page.locator('#password').fill('definitely-wrong-pw');
        await page.locator('button:has-text("Sign in")').click();

        const alert = page.locator('fuse-alert');
        await expect(alert).toBeVisible({ timeout: 15000 });
        await expect(alert).not.toContainText('Http failure');
        await expect(alert).toContainText(/invalid|locked|failed/i);
    });
});

test.describe('QA fixes (root admin)', () => {
    test('C2 — unknown route shows the 404 page (no infinite spinner)', async ({ page }) => {
        await login(page);
        await page.goto('/this-route-truly-does-not-exist-xyz');
        await expect(page.getByText('Page not found')).toBeVisible({ timeout: 15000 });
        await expect(page.getByText('404')).toBeVisible();
        await expect(page.getByRole('link', { name: /Back to Home/i })).toBeVisible();
    });

    test('C1 — /my-profile shows an admin card for a non-student account', async ({ page }) => {
        await login(page);
        await page.goto('/my-profile');
        // Admin has no linked student record → identity card with their email.
        // Scope to the page body (app-list-page); the email also appears in the nav.
        const card = page.locator('app-list-page');
        await expect(card.getByText('admin@root.com')).toBeVisible({ timeout: 15000 });
        await expect(card.getByText(/isn.t linked to a student record/i)).toBeVisible();
    });

    test('C3 — tenant billing route renders a placeholder, not a dead end', async ({ page }) => {
        await login(page);
        await page.goto('/tenant/00000000-0000-0000-0000-000000000000/billing');
        await expect(page.getByRole('heading', { name: 'Billing' })).toBeVisible({ timeout: 15000 });
        await expect(page.getByRole('link', { name: /Back to Tenant Management/i })).toBeVisible();
    });

    test('C4 — subdomain hint is env-driven (no mkcorex.com)', async ({ page }) => {
        await login(page);
        await page.goto('/tenant/create');
        const hint = page.locator('mat-hint', { hasText: 'Used in' });
        await expect(hint).toBeVisible({ timeout: 15000 });
        await expect(hint).not.toContainText('mkcorex.com');
        await expect(hint).toContainText('localhost'); // environment.baseDomain in dev
    });

    test('BUG-11 — edit-tenant form does not expose the DB password', async ({ page }) => {
        await login(page);
        await page.goto('/tenant/root/edit');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('body')).not.toContainText('Password=postgres');
    });

    test('ENH-1 — editing a user shows a Roles assignment section', async ({ page }) => {
        await login(page);
        await page.goto('/users');
        await page.waitForLoadState('networkidle');
        await page.locator('table tr[mat-row]').first().waitFor({ timeout: 20000 });
        // Edit is a mat-icon-button (routerLink, no href) — target it by its icon.
        await page.locator('button:has(mat-icon:text-is("edit"))').first().click();
        await expect(page.getByRole('heading', { name: 'Roles' })).toBeVisible({ timeout: 15000 });
        await expect(page.locator('mat-checkbox').first()).toBeVisible();
    });

    test('BUG-13 — wrong route slugs redirect to their canonical routes', async ({ page }) => {
        await login(page);
        await page.goto('/student-class');
        await expect(page).toHaveURL(/\/student-classes/, { timeout: 15000 });
        await page.goto('/health-records');
        await expect(page).toHaveURL(/\/student-health/);
        await page.goto('/announcements');
        await expect(page).toHaveURL(/\/announcement-archive/);
        await page.goto('/library-books');
        await expect(page).toHaveURL(/\/library\/books/);
    });
});

test.describe('QA fixes (greenwood admin)', () => {
    test('H1 — students list has no literal "Student ID" placeholder text', async ({ page }) => {
        await loginAsGreenwoodAdmin(page);
        await page.goto('/students');
        await page.waitForLoadState('networkidle');
        // The literal placeholder should be gone (real studentId or "—" instead).
        await expect(page.getByText('Student ID', { exact: true })).toHaveCount(0);
    });

    test('H8 — fee-reports has distinct Overdue Count / Overdue Amount headers', async ({ page }) => {
        await loginAsGreenwoodAdmin(page);
        await page.goto('/fee-reports');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('th', { hasText: 'Overdue Count' })).toBeVisible({ timeout: 15000 });
        await expect(page.locator('th', { hasText: 'Overdue Amount' })).toBeVisible();
    });

    test('BUG-3 — class form uses a teacher dropdown, not free text', async ({ page }) => {
        await loginAsGreenwoodAdmin(page);
        await page.goto('/classes/create');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('mat-select[formcontrolname="classTeacherId"]')).toBeVisible({ timeout: 15000 });
        await expect(page.locator('input[formcontrolname="classTeacherName"]')).toHaveCount(0);
    });
});

test.describe('QA fixes — empty-state CTAs (BUG-8/9, ENH-20)', () => {
    // Root tenant has no library/transport demo data, so these render empty states.
    test('empty states expose an "Add" CTA button', async ({ page }) => {
        await login(page);
        await page.goto('/library/books');
        await page.waitForLoadState('networkidle');
        await expect(page.getByRole('button', { name: /Add Book/i })).toBeVisible({ timeout: 15000 });

        await page.goto('/transport/routes');
        await page.waitForLoadState('networkidle');
        await expect(page.getByRole('button', { name: /Add Route/i })).toBeVisible({ timeout: 15000 });
    });
});
