import { test, expect } from '@playwright/test';
import { login } from './auth.setup';

test.setTimeout(60000);

test.describe('Create-form required-field hint', () => {

    test('01 - Student create shows required-hint banner', async ({ page }) => {
        await login(page);
        await page.goto('/students/create');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('[data-testid="required-hint-banner"]')).toBeVisible();
    });

    test('02 - Teacher create shows required-hint banner', async ({ page }) => {
        await login(page);
        await page.goto('/teachers/create');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('[data-testid="required-hint-banner"]')).toBeVisible();
    });

});
