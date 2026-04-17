import { test, expect } from '@playwright/test';
import { login } from './auth.setup';

test.setTimeout(60000);

test.describe('Dashboard UX E2E', () => {

    test('01 - Dashboard renders the metric cards (skeleton flashed or data loaded)', async ({ page }) => {
        await login(page);
        await page.goto('/analytics');
        // Wait for the post-load state: drill-students card must appear within 20s
        await expect(page.locator('[data-testid="drill-students"]')).toBeVisible({ timeout: 20000 });
    });

    test('02 - Students card drill-down navigates to /students', async ({ page }) => {
        await login(page);
        await page.goto('/analytics');
        await page.waitForLoadState('networkidle');
        await page.locator('[data-testid="drill-students"]').click();
        await expect(page).toHaveURL(/.*\/students$/);
    });

    test('03 - Teachers card drill-down navigates to /teachers', async ({ page }) => {
        await login(page);
        await page.goto('/analytics');
        await page.waitForLoadState('networkidle');
        await page.locator('[data-testid="drill-teachers"]').click();
        await expect(page).toHaveURL(/.*\/teachers$/);
    });

});
