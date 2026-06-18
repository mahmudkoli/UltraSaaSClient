import { test, expect } from '@playwright/test';
import { login } from './auth.setup';

test.setTimeout(90000);

test.describe('Academic Years CRUD', () => {
    test('create (with datepickers) → search → delete', async ({ page }) => {
        await login(page);
        await page.goto('/academic-years');
        await page.waitForLoadState('networkidle');

        const ts = Date.now().toString().slice(-6);
        const name = `E2E AY ${ts}`;

        await page.getByTestId('academic-year-add-btn').click();
        await expect(page).toHaveURL(/\/academic-years\/create/);
        await page.locator('input[formControlName="name"]').fill(name);
        await page.locator('input[formControlName="code"]').fill(`AY${ts}`);
        // matDatepicker inputs accept typed dates (en-US M/D/YYYY); blur to parse.
        await page.locator('input[formControlName="startDate"]').fill('1/1/2032');
        await page.locator('input[formControlName="startDate"]').press('Tab');
        await page.locator('input[formControlName="endDate"]').fill('12/31/2032');
        await page.locator('input[formControlName="endDate"]').press('Tab');
        await page.getByTestId('academic-year-save-btn').click();

        await expect(page).toHaveURL(/\/academic-years$/, { timeout: 20000 });
        await page.locator('input[matInput]').first().fill(name);
        const row = page.locator('tr', { hasText: name });
        await expect(row).toBeVisible({ timeout: 20000 });

        await row.getByTestId('academic-year-delete').click();
        await page.getByTestId('confirm-dialog-confirm').click();
        await expect(page.locator('tr', { hasText: name })).toHaveCount(0, { timeout: 20000 });
    });
});
