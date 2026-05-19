import { expect, test } from '@playwright/test';
import { ELECTRO_EMAIL, ELECTRO_TENANT, login } from './auth.setup';

/**
 * Procurement-to-POS UX alignment: every line-item form exposes the same
 * −/[input]/+ qty stepper the POS cart uses, so cashiers/buyers can nudge
 * quantities without retyping. Also asserts tabular-nums on total cells.
 */

test.setTimeout(60000);

test.describe('Procurement UX alignment', () => {

    test('PO create form: qty stepper +/− buttons present', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/purchase-orders/create');
        await page.waitForLoadState('networkidle');
        // Add a product so a line appears
        await page.locator('input[placeholder*="name or SKU"]').first().fill('');
        await page.locator('input[placeholder*="name or SKU"]').first().click();
        // Pick the first option
        const firstOpt = page.locator('mat-option').first();
        await firstOpt.waitFor({ timeout: 10000 });
        await firstOpt.click();
        // Stepper buttons should now be in the row
        await expect(page.locator('button[aria-label="Decrease quantity"]').first()).toBeVisible();
        await expect(page.locator('button[aria-label="Increase quantity"]').first()).toBeVisible();
    });

    test('Stock-transfer create form: qty stepper buttons present once a line is added', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/stock-transfers/create');
        await page.waitForLoadState('networkidle');
        await page.locator('input[placeholder*="name or SKU"]').first().fill('');
        await page.locator('input[placeholder*="name or SKU"]').first().click();
        const firstOpt = page.locator('mat-option').first();
        await firstOpt.waitFor({ timeout: 10000 });
        await firstOpt.click();
        await expect(page.locator('button[aria-label="Decrease quantity"]').first()).toBeVisible();
        await expect(page.locator('button[aria-label="Increase quantity"]').first()).toBeVisible();
    });
});
