import { test, expect } from '@playwright/test';
import { login } from './auth.setup';

test.setTimeout(90000);

test.describe('Fee Types CRUD', () => {
    test('create (with selects) → search → delete', async ({ page }) => {
        await login(page);
        await page.goto('/fee-types');
        await page.waitForLoadState('networkidle');

        const ts = Date.now().toString().slice(-6);
        const name = `E2E FeeType ${ts}`;

        await page.getByTestId('fee-type-add-btn').click();
        await expect(page).toHaveURL(/\/fee-types\/create/);
        await page.locator('input[formControlName="name"]').fill(name);
        await page.locator('input[formControlName="code"]').fill(`FT${ts}`);
        await page.locator('input[formControlName="defaultAmount"]').fill('500');
        // required mat-selects
        await page.locator('mat-select[formControlName="category"]').click();
        await page.locator('mat-option').first().click();
        await page.locator('mat-select[formControlName="frequency"]').click();
        await page.locator('mat-option').first().click();
        await page.getByTestId('fee-type-save-btn').click();

        await expect(page).toHaveURL(/\/fee-types$/, { timeout: 20000 });
        await page.locator('input[matInput]').first().fill(name);
        const row = page.locator('tr', { hasText: name });
        await expect(row).toBeVisible({ timeout: 20000 });

        // Fee Type delete uses the Fuse confirmation dialog.
        await row.getByTestId('fee-type-delete').click();
        await page.getByTestId('confirm-dialog-confirm').click();
        await expect(page.locator('tr', { hasText: name })).toHaveCount(0, { timeout: 20000 });
    });
});
