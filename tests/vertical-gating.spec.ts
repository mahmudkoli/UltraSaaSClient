import { expect, Page, test } from '@playwright/test';
import {
    ELECTRO_EMAIL,
    ELECTRO_TENANT,
    GENERIC_EMAIL,
    GENERIC_TENANT,
    login,
    PHARMACY_EMAIL,
    PHARMACY_TENANT,
    ROOT_EMAIL,
    ROOT_TENANT,
    SUPERMARKET_EMAIL,
    SUPERMARKET_TENANT,
} from './auth.setup';

test.setTimeout(60000);

async function loginAndWaitForNav(page: Page, tenant: string, email: string) {
    await login(page, { tenant, email });
    // Force the 'classy' Fuse layout — only this layout uses the full posNav
    // (which is what carries the gated Pharmacy / Procurement / Inventory
    // groups). The 'compact' layout uses a hand-curated short list. The query
    // param writes back to FuseConfigService so it sticks for follow-up navs.
    await page.goto('/pos?layout=classy');
    await page.waitForSelector('fuse-vertical-navigation', { timeout: 15000 });
    await page.waitForLoadState('networkidle');
}

test.describe('UltraPOS — vertical gating ([RequireBusinessType] + nav meta)', () => {

    // ════════════════════════════════════════════════════════════
    // Pharmacy nav group is the canary for vertical gating.
    // It carries meta.businessType: 'Pharmacy' in navigation/data.ts,
    // so it should appear only for Pharmacy + Generic tenants.
    // ════════════════════════════════════════════════════════════

    test('01 — Pharmacy nav HIDDEN for Electronics tenant', async ({ page }) => {
        await loginAndWaitForNav(page, ELECTRO_TENANT, ELECTRO_EMAIL);
        const nav = page.locator('fuse-vertical-navigation');
        await expect(nav).not.toContainText(/Pharmacy/);
        // Sanity: a non-vertical group is still visible.
        await expect(nav).toContainText(/Procurement/);
    });

    test('02 — Pharmacy nav HIDDEN for Supermarket tenant', async ({ page }) => {
        await loginAndWaitForNav(page, SUPERMARKET_TENANT, SUPERMARKET_EMAIL);
        const nav = page.locator('fuse-vertical-navigation');
        await expect(nav).not.toContainText(/Pharmacy/);
        await expect(nav).toContainText(/Procurement/);
    });

    test('03 — Pharmacy nav VISIBLE for Pharmacy tenant', async ({ page }) => {
        await loginAndWaitForNav(page, PHARMACY_TENANT, PHARMACY_EMAIL);
        const nav = page.locator('fuse-vertical-navigation');
        await expect(nav).toContainText(/Pharmacy/);
    });

    test('04 — Pharmacy nav VISIBLE for Generic tenant (wildcard)', async ({ page }) => {
        await loginAndWaitForNav(page, GENERIC_TENANT, GENERIC_EMAIL);
        const nav = page.locator('fuse-vertical-navigation');
        await expect(nav).toContainText(/Pharmacy/);
    });

    // ════════════════════════════════════════════════════════════
    // Server-side gate (RequireBusinessType): a Pharmacy tenant can
    // reach the /batches API and render the page; a non-Pharmacy
    // tenant hitting the same route would 403 from the API.
    // ════════════════════════════════════════════════════════════

    test('05 — /batches loads for Pharmacy tenant', async ({ page }) => {
        await loginAndWaitForNav(page, PHARMACY_TENANT, PHARMACY_EMAIL);
        await page.goto('/batches');
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveURL(/\/batches/);
        // Page header / table / empty state — any of these proves the page rendered.
        await expect(page.locator('body')).toContainText(/Batch/i, { timeout: 10000 });
    });
});

test.describe('UltraPOS — Change Vertical (root admin)', () => {

    test('06 — Tenant create form shows Business Type and Outlet Label fields', async ({ page }) => {
        await loginAndWaitForNav(page, ROOT_TENANT, ROOT_EMAIL);
        await page.goto('/tenant/create');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('mat-label:has-text("Business Type")')).toBeVisible({ timeout: 10000 });
        await expect(page.locator('mat-label:has-text("Outlet Label")')).toBeVisible();
    });

    test('07 — Tenant edit form has the Change Vertical button', async ({ page }) => {
        await loginAndWaitForNav(page, ROOT_TENANT, ROOT_EMAIL);
        await page.goto(`/tenant/${ELECTRO_TENANT}/edit`);
        await page.waitForLoadState('networkidle');
        await expect(page.locator('button:has-text("Change Vertical")')).toBeVisible({ timeout: 10000 });
    });

    test('08 — Change Vertical with no edits shows the "No changes" dialog', async ({ page }) => {
        await loginAndWaitForNav(page, ROOT_TENANT, ROOT_EMAIL);
        await page.goto(`/tenant/${ELECTRO_TENANT}/edit`);
        await page.waitForLoadState('networkidle');

        await page.locator('button:has-text("Change Vertical")').click();
        const dialog = page.locator('fuse-confirmation-dialog');
        await expect(dialog).toContainText(/No changes/i, { timeout: 5000 });
        await dialog.locator('button:has-text("OK")').click();
    });

    test('09 — Change Vertical with edited fields warns about pivot; Cancel reverts', async ({ page }) => {
        await loginAndWaitForNav(page, ROOT_TENANT, ROOT_EMAIL);
        await page.goto(`/tenant/${ELECTRO_TENANT}/edit`);
        await page.waitForLoadState('networkidle');

        // Snapshot the rendered BusinessType so we can verify it's restored on Cancel.
        const select = page.locator('mat-select[formcontrolname="businessType"]');
        await expect(select).toBeVisible({ timeout: 10000 });
        const originalText = (await select.textContent())?.trim() ?? '';

        // Open the dropdown and pick a different value (electroplus is seeded as
        // Electronics; flip to Pharmacy, falling back to Supermarket if already Pharmacy).
        await select.click();
        const target = originalText.includes('Pharmacy') ? 'Supermarket' : 'Pharmacy';
        await page.locator(`mat-option:has-text("${target}")`).first().click();
        await page.waitForTimeout(200);

        // Click Change Vertical — the pivot confirmation should fire.
        await page.locator('button:has-text("Change Vertical")').click();

        const dialog = page.locator('fuse-confirmation-dialog');
        await expect(dialog).toContainText(/Pivot this tenant/i, { timeout: 5000 });
        await expect(dialog).toContainText(/won't be reachable from the new vertical/i);

        // Cancel — the form must revert (we do NOT want to actually pivot the
        // demo tenant from this test).
        await dialog.locator('button:has-text("Cancel")').click();
        await page.waitForTimeout(300);

        const reverted = (await select.textContent())?.trim() ?? '';
        expect(reverted).toBe(originalText);
    });
});
