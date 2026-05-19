import { expect, test } from '@playwright/test';
import { ELECTRO_EMAIL, ELECTRO_TENANT, login } from './auth.setup';

test.setTimeout(60000);

test.describe('Purchasing pages', () => {

    test('/purchase-orders list renders', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/purchase-orders');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('body')).toContainText(/Purchase\s*Order/i);
    });

    test('/goods-receipts list renders', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/goods-receipts');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('body')).toContainText(/Goods\s*Receipt/i);
    });

    test('/purchase-returns list renders', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/purchase-returns');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('body')).toContainText(/Purchase\s*Return|Return/i);
    });

    test('/suppliers list + Add', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/suppliers');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('body')).toContainText(/Supplier/i);
    });
});
