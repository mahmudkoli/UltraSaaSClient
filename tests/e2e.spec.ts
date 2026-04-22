import { test, expect } from '@playwright/test';
import { login } from './auth.setup';

// Increase timeout for tests that need login
test.setTimeout(60000);

test.describe('UltraPOS E2E Tests', () => {

    // ════════════════════════════════════════════════════════════
    // AUTH
    // ════════════════════════════════════════════════════════════

    test('01 - Login redirects to users list', async ({ page }) => {
        await login(page);
        await expect(page).toHaveURL(/.*users/);
    });

    // ════════════════════════════════════════════════════════════
    // NAVIGATION — core routes load without error
    // ════════════════════════════════════════════════════════════

    const moduleRoutes = ['/users', '/tenant', '/institute', '/profile'];

    test('02 - All core routes load', async ({ page }) => {
        await login(page);
        for (const route of moduleRoutes) {
            await page.goto(route);
            await page.waitForLoadState('networkidle');
            await expect(page).toHaveURL(new RegExp(route));
            await expect(
                page.locator('fuse-vertical-navigation, fuse-horizontal-navigation, mat-toolbar, [class*="header"], h2, table, mat-card').first()
            ).toBeVisible({ timeout: 5000 });
        }
    });

    // ════════════════════════════════════════════════════════════
    // TENANT & INSTITUTE (→ Outlet)
    // ════════════════════════════════════════════════════════════

    test('03 - Tenant: list shows root', async ({ page }) => {
        await login(page);
        await page.goto('/tenant');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('text=root').first()).toBeVisible({ timeout: 10000 });
    });

    test('04 - Institute: page loads', async ({ page }) => {
        await login(page);
        await page.goto('/institute');
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveURL(/.*institute/);
    });

    test('05 - Profile: page loads', async ({ page }) => {
        await login(page);
        await page.goto('/profile');
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveURL(/.*profile/);
    });
});
