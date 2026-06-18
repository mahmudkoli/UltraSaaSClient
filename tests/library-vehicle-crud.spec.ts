import { test, expect } from '@playwright/test';
import { login } from './auth.setup';

test.setTimeout(90000);

// Server-paginated lists: after saving (routes back to the list) we filter via the
// Search box (the only matInput on the list toolbar) to locate the new row.

test.describe('Library Books CRUD', () => {
    test('create → search → delete', async ({ page }) => {
        page.on('dialog', d => d.accept()); // native confirm on delete
        await login(page);
        await page.goto('/library/books');
        await page.waitForLoadState('networkidle');

        const ts = Date.now().toString().slice(-6);
        const title = `E2E Book ${ts}`;

        await page.getByTestId('book-add-btn').click();
        await expect(page).toHaveURL(/\/library\/books\/create/);
        await page.locator('input[formControlName="title"]').fill(title);
        await page.locator('input[formControlName="author"]').fill('E2E Author');
        await page.locator('input[formControlName="isbn"]').fill(`ISBN-${ts}`);
        await page.locator('input[formControlName="totalCopies"]').fill('4');
        await page.getByTestId('book-save-btn').click();

        await expect(page).toHaveURL(/\/library\/books$/, { timeout: 20000 });
        await page.locator('input[matInput]').first().fill(title);
        const row = page.locator('tr', { hasText: title });
        await expect(row).toBeVisible({ timeout: 20000 });

        await row.getByTestId('book-delete').click();
        await expect(page.locator('tr', { hasText: title })).toHaveCount(0, { timeout: 20000 });
    });
});

test.describe('Transport Vehicles CRUD', () => {
    test('create → search → delete', async ({ page }) => {
        page.on('dialog', d => d.accept());
        await login(page);
        await page.goto('/transport/vehicles');
        await page.waitForLoadState('networkidle');

        const ts = Date.now().toString().slice(-6);
        const num = `E2E-${ts}`;

        await page.getByTestId('vehicle-add-btn').click();
        await expect(page).toHaveURL(/\/transport\/vehicles\/create/);
        await page.locator('input[formControlName="vehicleNumber"]').fill(num);
        await page.locator('input[formControlName="make"]').fill('Tata');
        await page.locator('input[formControlName="model"]').fill('Starbus');
        await page.getByTestId('vehicle-save-btn').click();

        await expect(page).toHaveURL(/\/transport\/vehicles$/, { timeout: 20000 });
        await page.locator('input[matInput]').first().fill(num);
        const row = page.locator('tr', { hasText: num });
        await expect(row).toBeVisible({ timeout: 20000 });

        await row.getByTestId('vehicle-delete').click();
        await expect(page.locator('tr', { hasText: num })).toHaveCount(0, { timeout: 20000 });
    });
});
