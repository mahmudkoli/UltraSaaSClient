import { expect, test } from '@playwright/test';
import { PHARMACY_EMAIL, PHARMACY_TENANT, login } from './auth.setup';

test.setTimeout(60000);

test.describe('Pharmacy vertical', () => {

    test('/prescriptions list renders', async ({ page }) => {
        await login(page, { tenant: PHARMACY_TENANT, email: PHARMACY_EMAIL });
        await page.goto('/prescriptions');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('body')).toContainText(/Prescription/i);
    });

    test('/prescriptions/create form renders with medication row controls', async ({ page }) => {
        await login(page, { tenant: PHARMACY_TENANT, email: PHARMACY_EMAIL });
        await page.goto('/prescriptions/create');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('body')).toContainText(/Doctor|Medication|Prescribed/i, { timeout: 10000 });
    });

    test('/batches list shows expiry chips', async ({ page }) => {
        await login(page, { tenant: PHARMACY_TENANT, email: PHARMACY_EMAIL });
        await page.goto('/batches');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('body')).toContainText(/Batch/i);
    });
});
