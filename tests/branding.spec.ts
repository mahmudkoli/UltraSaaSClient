import { expect, test } from '@playwright/test';
import { ELECTRO_EMAIL, ELECTRO_TENANT, login } from './auth.setup';

test.setTimeout(60000);

test.describe('Branding profile pages', () => {

    test('/branding-profiles list renders + Add', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/branding-profiles');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('body')).toContainText(/Branding|Profile/i);
    });
});

test.describe('Sales-detail / find-sale page', () => {

    test('/sales detail list renders', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/sales');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('body')).toContainText(/Sale|Invoice/i);
    });
});

// /warranties has no dedicated route today — warranty data is surfaced inline on
// the sale detail. Skip a separate page test until that ships.
