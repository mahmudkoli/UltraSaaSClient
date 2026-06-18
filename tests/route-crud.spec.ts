import { test, expect } from '@playwright/test';
import { login } from './auth.setup';

test.setTimeout(90000);

test.describe('Transport Routes CRUD', () => {
    test('create → search → delete', async ({ page }) => {
        page.on('dialog', d => d.accept()); // native confirm on delete
        await login(page);
        await page.goto('/transport/routes');
        await page.waitForLoadState('networkidle');

        const ts = Date.now().toString().slice(-6);
        const name = `E2E Route ${ts}`;

        await page.getByTestId('route-add-btn').click();
        await expect(page).toHaveURL(/\/transport\/routes\/create/);
        await page.locator('input[formControlName="name"]').fill(name);
        await page.locator('input[formControlName="code"]').fill(`RTE${ts}`);
        await page.locator('input[formControlName="startLocation"]').fill('Campus');
        await page.locator('input[formControlName="endLocation"]').fill('Downtown');
        await page.locator('input[formControlName="distance"]').fill('12');
        await page.locator('input[formControlName="estimatedTime"]').fill('00:30:00');
        await page.locator('input[formControlName="fare"]').fill('50');
        await page.getByTestId('route-save-btn').click();

        await expect(page).toHaveURL(/\/transport\/routes$/, { timeout: 20000 });
        await page.locator('input[matInput]').first().fill(name);
        const row = page.locator('tr', { hasText: name });
        await expect(row).toBeVisible({ timeout: 20000 });

        await row.getByTestId('route-delete').click();
        await expect(page.locator('tr', { hasText: name })).toHaveCount(0, { timeout: 20000 });
    });
});
