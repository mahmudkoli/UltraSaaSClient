import { expect, test } from '@playwright/test';
import { ELECTRO_EMAIL, ELECTRO_TENANT, login } from './auth.setup';

// Login + nav clicks can be slow under headed mode; keep timeouts generous.
test.setTimeout(60000);

test.describe('MK Corex POS — admin happy paths', () => {

    // ════════════════════════════════════════════════════════════
    // 01 — Auth
    // ════════════════════════════════════════════════════════════

    test('01 — login lands on /pos', async ({ page }) => {
        await login(page);
        await expect(page).toHaveURL(/\/pos$/);
    });

    test('02 — bad password is rejected', async ({ page }) => {
        await page.goto('/sign-in');
        await page.waitForSelector('#email');
        await page.locator('#tenant').fill('root');
        await page.locator('#email').fill('admin@root.com');
        await page.locator('#password').fill('wrong-password');
        await page.locator('button:has-text("Sign in")').click();
        // We should remain on the sign-in page after a failure.
        await page.waitForTimeout(2000);
        await expect(page).toHaveURL(/sign-in/);
    });

    // ════════════════════════════════════════════════════════════
    // 02 — Core admin pages render
    // ════════════════════════════════════════════════════════════

    const corePages: Array<{ path: string; expectInPage: RegExp }> = [
        { path: '/pos', expectInPage: /POS|Outlet|Cart/i },
        { path: '/sales', expectInPage: /Sales/i },
        { path: '/shifts', expectInPage: /Shifts/i },
        { path: '/returns', expectInPage: /Returns/i },
        { path: '/customers', expectInPage: /Customers/i },
        { path: '/suppliers', expectInPage: /Suppliers/i },
        { path: '/promotions', expectInPage: /Promotions/i },
        { path: '/purchase-orders', expectInPage: /Purchase\s*Orders/i },
        { path: '/goods-receipts', expectInPage: /Goods\s*Receipts/i },
        { path: '/stock-transfers', expectInPage: /Stock\s*Transfers/i },
        { path: '/reports', expectInPage: /Reports/i },
        { path: '/users', expectInPage: /Users/i },
        { path: '/users/roles', expectInPage: /Roles/i },
        { path: '/outlet', expectInPage: /Outlet/i },
        { path: '/tenant', expectInPage: /Tenant/i },
        { path: '/profile', expectInPage: /Profile/i },
    ];

    for (const { path, expectInPage } of corePages) {
        test(`03 — ${path} loads cleanly`, async ({ page }) => {
            await login(page);
            await page.goto(path);
            await page.waitForLoadState('networkidle');
            await expect(page).toHaveURL(new RegExp(path.replace(/\//g, '\\/')));
            await expect(page.locator('body')).toContainText(expectInPage);
        });
    }

    // ════════════════════════════════════════════════════════════
    // 04 — Catalog: Products list shows the seeded products
    // ════════════════════════════════════════════════════════════

    test('04 — catalog/products list loads with seeded rows', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/catalog/products');
        await page.waitForLoadState('networkidle');
        // The DemoDataSeeder seeds at least a handful of products per tenant.
        await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 10000 });
    });

    // ════════════════════════════════════════════════════════════
    // 05 — Outlet switcher in the toolbar (multi-outlet UX)
    // ════════════════════════════════════════════════════════════

    test('05 — outlet picker is reachable from POS', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/pos');
        await page.waitForLoadState('networkidle');
        // The POS card has its own outlet mat-select; the toolbar switcher is
        // a layout-dependent extra. Either path proves the user can pick an
        // outlet — we check the POS card form-field label.
        await expect(page.locator('mat-label:has-text("Outlet")').first()).toBeVisible({ timeout: 10000 });
    });

    // ════════════════════════════════════════════════════════════
    // 06 — Manage Roles dialog opens for a user row
    // ════════════════════════════════════════════════════════════

    test('06 — manage-roles dialog opens with role checkboxes', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/users');
        await page.waitForLoadState('networkidle');
        // Wait for at least one user row.
        await page.waitForSelector('table tbody tr', { timeout: 10000 });
        // Click the manage_accounts icon button on the first row.
        await page.locator('button[mattooltip="Manage Roles"]').first().click();
        await expect(page.locator('mat-dialog-container')).toContainText(/Manage Roles/i);
        await expect(page.locator('mat-dialog-container mat-checkbox').first()).toBeVisible({ timeout: 5000 });
        // Close.
        await page.locator('mat-dialog-container button:has-text("Cancel")').click();
    });

    // ════════════════════════════════════════════════════════════
    // 07 — Shifts: open dialog form renders
    // ════════════════════════════════════════════════════════════

    test('07 — shifts page lists existing shifts', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/shifts');
        await page.waitForLoadState('networkidle');
        // Either we see the table, or the empty state. Both are valid.
        const hasTable = await page.locator('table mat-row, table tbody tr').first().isVisible().catch(() => false);
        const hasEmptyState = await page.locator('text=/No shifts yet/i').isVisible().catch(() => false);
        expect(hasTable || hasEmptyState).toBeTruthy();
    });

    // ════════════════════════════════════════════════════════════
    // 08 — POS shows a shift status chip (open or "no shift open")
    // ════════════════════════════════════════════════════════════

    test('08 — POS surfaces shift status', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/pos');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('body')).toContainText(/Shift open since|No shift open/i, { timeout: 10000 });
    });
});
