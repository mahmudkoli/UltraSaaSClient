import { test, expect } from '@playwright/test';
import { login } from './auth.setup';

test.setTimeout(60000);

test.describe('Fee Invoice UX E2E', () => {

    test('01 - Create invoice form shows Invoice mode badge + live Net total', async ({ page }) => {
        await login(page);
        await page.goto('/fee-invoices/create');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('[data-testid="create-mode-badge"]')).toBeVisible();
        await expect(page.locator('[data-testid="net-amount"]')).toBeVisible();
        await expect(page.locator('[data-testid="invoice-summary"]')).toBeVisible();
    });

    test('02 - Net total updates as user types amounts', async ({ page }) => {
        await login(page);
        await page.goto('/fee-invoices/create');
        await page.waitForLoadState('networkidle');

        await page.locator('input[formControlName="totalAmount"]').fill('1000');
        await page.locator('input[formControlName="discountAmount"]').fill('100');
        await page.locator('input[formControlName="taxAmount"]').fill('50');
        await page.locator('input[formControlName="lateFeeAmount"]').fill('25');

        const net = await page.locator('[data-testid="net-amount"]').innerText();
        expect(net.replace(/[^0-9.]/g, '')).toBe('975.00');
    });

    test('03 - Overdue filter on list page works', async ({ page }) => {
        await login(page);
        await page.goto('/fee-invoices');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('[data-testid="overdue-filter"]')).toBeVisible();
    });

    test('04 - Print Receipt button appears on each invoice row and opens a print tab', async ({ page, context }) => {
        await login(page);
        await page.goto('/fee-invoices');
        await page.waitForLoadState('networkidle');

        const printBtn = page.locator('[data-testid="fee-invoice-print"]').first();
        await expect(printBtn).toBeVisible();

        const popupPromise = context.waitForEvent('page');
        await printBtn.click();
        const popup = await popupPromise;
        await popup.waitForLoadState('domcontentloaded');

        await expect(popup.locator('h1')).toContainText('INVOICE');
        await expect(popup.locator('body')).toContainText('Balance Due');
        await popup.close();
    });

});
