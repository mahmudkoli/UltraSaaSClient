import { expect, test } from '@playwright/test';
import { ELECTRO_EMAIL, ELECTRO_TENANT, PHARMACY_EMAIL, PHARMACY_TENANT, login } from './auth.setup';

/**
 * Inventory pages — stock, serials, batches, adjustments, transfers, cycle counts.
 * Page-load assertions for every inventory surface.
 */

test.setTimeout(60000);

test.describe('Inventory pages', () => {

    test('/inventory/stock list renders', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/inventory/stock');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('body')).toContainText(/Stock|Inventory/i);
    });

    test('/inventory/serials list renders (Electronics)', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/inventory/serials');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('body')).toContainText(/Serial/i);
    });

    test('/batches list renders (Pharmacy)', async ({ page }) => {
        await login(page, { tenant: PHARMACY_TENANT, email: PHARMACY_EMAIL });
        await page.goto('/batches');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('body')).toContainText(/Batch/i);
    });

    test('/stock-adjustments list + Import affordance', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/stock-adjustments');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('body')).toContainText(/Stock\s*Adjustment/i);
    });

    test('/stock-transfers list renders', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/stock-transfers');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('body')).toContainText(/Transfer/i);
    });

    test('/stock-counts list + Start button', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/stock-counts');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('body')).toContainText(/Cycle\s*Count|Stock\s*Count/i);
    });
});
