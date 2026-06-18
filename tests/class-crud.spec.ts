import { test, expect } from '@playwright/test';
import { loginAsGreenwoodAdmin } from './auth.setup';

test.setTimeout(90000);

// Greenwood admin: the academicYearId dropdown is populated from seeded data.
test.describe('Classes CRUD', () => {
    test('create (FK + selects) → search → delete', async ({ page }) => {
        await loginAsGreenwoodAdmin(page);
        await page.goto('/classes');
        await page.waitForLoadState('networkidle');

        const ts = Date.now().toString().slice(-6);
        const name = `E2E Class ${ts}`;

        await page.getByTestId('class-add-btn').click();
        await expect(page).toHaveURL(/\/classes\/create/);
        await page.waitForLoadState('networkidle'); // academic-year options load

        await page.locator('input[formControlName="name"]').fill(name);
        await page.locator('input[formControlName="code"]').fill(`CLS${ts}`);
        await page.locator('input[formControlName="capacity"]').fill('30');
        await page.locator('mat-select[formControlName="academicYearId"]').click();
        await page.locator('mat-option').first().click();
        await page.locator('mat-select[formControlName="grade"]').click();
        await page.locator('mat-option').first().click();
        await page.getByTestId('class-save-btn').click();

        await expect(page).toHaveURL(/\/classes$/, { timeout: 20000 });
        await page.locator('input[matInput]').first().fill(name);
        const row = page.locator('tr', { hasText: name });
        await expect(row).toBeVisible({ timeout: 20000 });

        await row.getByTestId('class-delete').click();
        await page.getByTestId('confirm-dialog-confirm').click();
        await expect(page.locator('tr', { hasText: name })).toHaveCount(0, { timeout: 20000 });
    });
});
