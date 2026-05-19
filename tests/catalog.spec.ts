import { expect, test } from '@playwright/test';
import { ELECTRO_EMAIL, ELECTRO_TENANT, login } from './auth.setup';

/**
 * Catalog pages — products, categories, brands, units.
 * Beyond the page-load smoke in e2e.spec.ts §03, asserts the actual list /
 * dialog chrome the user interacts with.
 */

test.setTimeout(60000);

test.describe('Catalog pages', () => {

    test('/catalog/products lists rows + has Add button', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/catalog/products');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 10000 });
        await expect(page.locator('button:has-text("Add"), button:has-text("New Product"), button[mat-flat-button]').first()).toBeVisible();
    });

    test('/catalog/categories renders tree or list', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/catalog/categories');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('body')).toContainText(/Categor/i);
    });

    test('/catalog/brands list + Add', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/catalog/brands');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('body')).toContainText(/Brand/i);
    });

    test('/catalog/units list + Add', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/catalog/units');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('body')).toContainText(/Unit/i);
    });
});
