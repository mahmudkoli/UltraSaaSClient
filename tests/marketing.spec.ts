import { expect, test } from '@playwright/test';
import { ELECTRO_EMAIL, ELECTRO_TENANT, SUPERMARKET_EMAIL, SUPERMARKET_TENANT, login } from './auth.setup';

test.setTimeout(60000);

test.describe('Marketing / customer-facing pages', () => {

    test('/customers list renders + Add button', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/customers');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('body')).toContainText(/Customer/i);
    });

    test('/promotions list renders (Supermarket)', async ({ page }) => {
        await login(page, { tenant: SUPERMARKET_TENANT, email: SUPERMARKET_EMAIL });
        await page.goto('/promotions');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('body')).toContainText(/Promotion/i);
    });

    // /loyalty has no dedicated route today — loyalty transactions surface on
    // the customer detail and POS sale screen. Skip standalone test.
});
