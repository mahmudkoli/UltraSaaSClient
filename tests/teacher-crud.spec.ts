import { test, expect } from '@playwright/test';
import { login } from './auth.setup';

test.setTimeout(90000);

test.describe('Teachers CRUD', () => {
    test('create (user-backed) → search → delete', async ({ page }) => {
        await login(page);
        await page.goto('/teachers');
        await page.waitForLoadState('networkidle');

        const ts = Date.now().toString().slice(-6);
        const last = `E2ETeacher${ts}`;

        await page.getByTestId('teacher-add-btn').click();
        await expect(page).toHaveURL(/\/teachers\/create/);
        await page.waitForLoadState('networkidle');

        await page.locator('input[formControlName="firstName"]').fill('E2E');
        await page.locator('input[formControlName="lastName"]').fill(last);
        await page.locator('input[formControlName="userName"]').fill(`tch${ts}`);
        await page.locator('input[formControlName="phoneNumber"]').fill(`017${ts}77`);
        await page.locator('input[formControlName="password"]').fill('123Pa$$word!');
        await page.locator('input[formControlName="confirmPassword"]').fill('123Pa$$word!');
        await page.getByTestId('teacher-save-btn').click();

        await expect(page).toHaveURL(/\/teachers$/, { timeout: 20000 });
        await page.locator('input[matInput]').first().fill(last);
        const row = page.locator('tr', { hasText: last });
        await expect(row).toBeVisible({ timeout: 20000 });

        await row.getByTestId('teacher-delete').click();
        await page.getByTestId('confirm-dialog-confirm').click();
        await expect(page.locator('tr', { hasText: last })).toHaveCount(0, { timeout: 20000 });
    });
});
