import { test, expect } from '@playwright/test';
import { login } from './auth.setup';

test.setTimeout(90000);

test.describe('Subjects CRUD', () => {
    test('create → appears in list → delete', async ({ page }) => {
        await login(page);
        await page.goto('/subjects');
        await page.waitForLoadState('networkidle');

        const ts = Date.now().toString().slice(-6);
        const name = `E2E Subject ${ts}`;

        // Create
        await page.getByTestId('subject-add-btn').click();
        await page.waitForLoadState('networkidle');
        await page.locator('input[formControlName="name"]').fill(name);
        await page.locator('input[formControlName="code"]').fill(`SUBE${ts}`);
        await page.locator('input[formControlName="creditHours"]').fill('3');
        await page.getByTestId('subject-save-btn').click();

        // Back on the list, the new subject is present
        await expect(page.locator('table')).toContainText(name, { timeout: 20000 });

        // Delete via the row action + shared confirm dialog
        const row = page.locator('tr', { hasText: name });
        await row.getByTestId('subject-delete').click();
        await page.getByTestId('confirm-dialog-confirm').click();
        await expect(page.locator('table')).not.toContainText(name, { timeout: 20000 });
    });
});
