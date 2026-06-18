import { test, expect } from '@playwright/test';
import { login } from './auth.setup';

test.setTimeout(90000);

test.describe('Hostels CRUD', () => {
    test('create → appears in list → delete', async ({ page }) => {
        await login(page);
        await page.goto('/hostels');
        await page.waitForLoadState('networkidle');

        const ts = Date.now().toString().slice(-6);
        const name = `E2E Hostel ${ts}`;

        await page.getByTestId('hostel-add-btn').click();
        await page.waitForLoadState('networkidle');
        await page.locator('input[formControlName="name"]').fill(name);
        await page.locator('input[formControlName="code"]').fill(`HE${ts}`);
        await page.locator('input[formControlName="address"]').fill('123 E2E Street');
        await page.locator('input[formControlName="totalRooms"]').fill('10');
        await page.locator('input[formControlName="monthlyFee"]').fill('3000');
        await page.getByTestId('hostel-save-btn').click();

        await expect(page.locator('table')).toContainText(name, { timeout: 20000 });

        // Hostel delete uses a native window.confirm() — auto-accept it.
        page.on('dialog', dialog => dialog.accept());
        const row = page.locator('tr', { hasText: name });
        await row.getByTestId('hostel-delete').click();
        await expect(page.locator('table')).not.toContainText(name, { timeout: 20000 });
    });
});
