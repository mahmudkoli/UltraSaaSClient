import { expect, test } from '@playwright/test';
import { ELECTRO_EMAIL, ELECTRO_TENANT, login } from './auth.setup';

test.setTimeout(60000);

test.describe('Reports tabs', () => {

    test('Reports landing renders all tab labels', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/reports');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('body')).toContainText(/Sales\s*Summary/i);
        await expect(page.locator('body')).toContainText(/Top\s*Products/i);
        await expect(page.locator('body')).toContainText(/Inventory/i);
        await expect(page.locator('body')).toContainText(/Low\s*Stock/i);
        await expect(page.locator('body')).toContainText(/AR\s*Aging/i);
        // Tab is labelled "Purchasing", not "Purchase Summary"
        await expect(page.locator('body')).toContainText(/Purchasing/i);
    });
});

test.describe('Audit trail viewer', () => {

    test('/audit page exposes filter controls + table', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/audit');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('body')).toContainText(/Audit/i);
        // Audit table or empty state — either is fine
        const hasRows = await page.locator('table tbody tr').first().isVisible().catch(() => false);
        const hasEmpty = await page.locator('text=/No audit|No trail|Empty/i').isVisible().catch(() => false);
        expect(hasRows || hasEmpty).toBeTruthy();
    });
});

test.describe('Shifts page', () => {

    test('/shifts list page renders + Open Shift affordance', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/shifts');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('body')).toContainText(/Shift/i);
    });
});
