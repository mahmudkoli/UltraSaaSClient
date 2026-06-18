import { test, expect } from '@playwright/test';
import { loginAsGreenwoodAdmin } from './auth.setup';

test.setTimeout(90000);

// Greenwood admin: academicYearId + classId selects are seeded there.
test.describe('Fee Structures CRUD', () => {
    test('create (FK selects + datepicker) → search → delete', async ({ page }) => {
        await loginAsGreenwoodAdmin(page);
        await page.goto('/fee-structures');
        await page.waitForLoadState('networkidle');

        const ts = Date.now().toString().slice(-6);
        const name = `E2E FeeStruct ${ts}`;

        await page.getByTestId('fee-structure-add-btn').click();
        await expect(page).toHaveURL(/\/fee-structures\/create/);
        await page.waitForLoadState('networkidle');

        await page.locator('input[formControlName="name"]').fill(name);
        await page.locator('input[formControlName="code"]').fill(`FS${ts}`);
        await page.locator('mat-select[formControlName="academicYearId"]').click();
        await page.locator('mat-option').first().click();
        await page.locator('mat-select[formControlName="classId"]').click();
        await page.locator('mat-option').first().click();
        await page.locator('mat-select[formControlName="feeFrequency"]').click();
        await page.locator('mat-option').first().click();
        await page.locator('input[formControlName="effectiveFrom"]').fill('1/1/2032');
        await page.locator('input[formControlName="effectiveFrom"]').press('Tab');
        await page.getByTestId('fee-structure-save-btn').click();

        await expect(page).toHaveURL(/\/fee-structures$/, { timeout: 20000 });
        await page.locator('input[matInput]').first().fill(name);
        const row = page.locator('tr', { hasText: name });
        await expect(row).toBeVisible({ timeout: 20000 });

        await row.getByTestId('fee-structure-delete').click();
        await page.getByTestId('confirm-dialog-confirm').click();
        await expect(page.locator('tr', { hasText: name })).toHaveCount(0, { timeout: 20000 });
    });
});
