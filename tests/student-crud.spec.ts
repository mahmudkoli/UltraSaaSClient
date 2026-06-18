import { test, expect } from '@playwright/test';
import { login } from './auth.setup';

test.setTimeout(90000);

test.describe('Students CRUD', () => {
    test('create (user-backed) → search → delete', async ({ page }) => {
        await login(page);
        await page.goto('/students');
        await page.waitForLoadState('networkidle');

        const ts = Date.now().toString().slice(-6);
        const last = `E2EStudent${ts}`;

        await page.getByTestId('student-add-btn').click();
        await expect(page).toHaveURL(/\/students\/create/);
        await page.waitForLoadState('networkidle');

        await page.locator('input[formControlName="firstName"]').fill('E2E');
        await page.locator('input[formControlName="lastName"]').fill(last);
        await page.locator('input[formControlName="userName"]').fill(`std${ts}`);
        await page.locator('input[formControlName="phoneNumber"]').fill(`017${ts}88`);
        await page.locator('input[formControlName="password"]').fill('123Pa$$word!');
        await page.locator('input[formControlName="confirmPassword"]').fill('123Pa$$word!');
        // fathersName/mothersName live on the "Family Information" tab.
        await page.getByRole('tab', { name: /Family Information/ }).click();
        await page.locator('input[formControlName="fathersName"]').fill('E2E Father');
        await page.locator('input[formControlName="mothersName"]').fill('E2E Mother');
        await page.getByTestId('student-save-btn').click();

        await expect(page).toHaveURL(/\/students$/, { timeout: 20000 });
        await page.locator('input[matInput]').first().fill(last);
        const row = page.locator('tr', { hasText: last });
        await expect(row).toBeVisible({ timeout: 20000 });

        await row.getByTestId('student-delete').click();
        await page.getByTestId('confirm-dialog-confirm').click();
        await expect(page.locator('tr', { hasText: last })).toHaveCount(0, { timeout: 20000 });
    });
});
