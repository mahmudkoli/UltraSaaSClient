import { expect, test } from '@playwright/test';
import { ELECTRO_EMAIL, ELECTRO_TENANT, login } from './auth.setup';

/**
 * /purchase-orders/create UX:
 *   - Required fields carry a red asterisk so the operator knows why "Save
 *     Draft" is disabled before they have to read the hint text.
 *   - After picking a product from the autocomplete, the search field clears
 *     and re-focuses so the buyer can immediately search for the next product
 *     (mirrors the POS pattern). Previously mat-autocomplete kept the picked
 *     product rendered in the input.
 */

test.setTimeout(60000);

test.describe('PO create form UX', () => {

    test('Required labels show * on Outlet, Supplier, and Line Items', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/purchase-orders/create');
        await page.waitForLoadState('networkidle');

        // mat-label renders the asterisk
        await expect(page.locator('mat-label:has-text("Outlet")').locator('span.text-rose-600')).toBeVisible();
        await expect(page.locator('mat-label:has-text("Supplier")').locator('span.text-rose-600')).toBeVisible();
        await expect(page.locator('h3:has-text("Line Items")').locator('span.text-rose-600')).toBeVisible();
        // Optional labels are explicitly tagged
        await expect(page.locator('mat-label:has-text("Expected delivery")')).toContainText('optional');
        await expect(page.locator('mat-label:has-text("Notes")')).toContainText('optional');
        // Legend
        await expect(page.locator('body')).toContainText(/\* Required/);
    });

    test('Product search clears after add — ready for next product', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/purchase-orders/create');
        await page.waitForLoadState('networkidle');

        const search = page.locator('input[placeholder*="name or SKU"]').first();
        await search.click();
        // Pick the first dropdown option
        const opt = page.locator('mat-option').first();
        await opt.waitFor({ timeout: 10000 });
        await opt.click();

        // The line should now appear in the table
        await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 5000 });
        // And the search field must be empty + focused (ready for next pick)
        await expect(search).toHaveValue('');
        await expect(search).toBeFocused();
    });

    test('No double asterisk: required fields use hideRequiredMarker so only the explicit colored * shows', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/purchase-orders/create');
        await page.waitForLoadState('networkidle');

        // The mat-form-field for Outlet should have hideRequiredMarker (no internal asterisk
        // rendered by Angular Material) — our colored span is the only "*" in the label area.
        const outletField = page.locator('mat-form-field:has(mat-label:has-text("Outlet"))').first();
        await expect(outletField).toBeVisible();
        const asterisks = outletField.locator('mat-label .text-rose-600');
        await expect(asterisks).toHaveCount(1);
        // Confirm Angular Material's own .mat-mdc-form-field-required-marker isn't visible
        const matMarker = outletField.locator('.mat-mdc-form-field-required-marker');
        await expect(matMarker).toHaveCount(0);
    });

    test('Supplier field is type-to-search (autocomplete) — not a fixed dropdown', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/purchase-orders/create');
        await page.waitForLoadState('networkidle');

        const supplierInput = page.locator('input[placeholder*="Type to search by name"]').first();
        await expect(supplierInput).toBeVisible({ timeout: 10000 });

        // Open the dropdown and confirm options render
        await supplierInput.click();
        const firstOpt = page.locator('mat-option').first();
        await firstOpt.waitFor({ timeout: 10000 });
        const firstName = (await firstOpt.locator('span.truncate').first().innerText()).trim();

        // Typing a non-matching string filters everything out and shows the "no match" hint
        await supplierInput.fill('zzz-not-a-real-supplier');
        await expect(page.locator('mat-option').filter({ hasText: /No supplier matches/ })).toBeVisible({ timeout: 5000 });

        // Backspace + type a prefix of the first supplier — they should reappear
        await supplierInput.fill(firstName.slice(0, Math.min(3, firstName.length)));
        await page.locator('mat-option').filter({ hasText: firstName }).first().waitFor({ timeout: 5000 });
        await page.locator('mat-option').filter({ hasText: firstName }).first().click();

        // After picking, the input shows the supplier name and a clear (X) suffix appears
        await expect(supplierInput).toHaveValue(firstName);
        await expect(page.locator('button[aria-label="Clear supplier"]')).toBeVisible();
    });

    test('Already-added products are filtered out of the dropdown — count badge replaces inline tick', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/purchase-orders/create');
        await page.waitForLoadState('networkidle');

        const search = page.locator('input[placeholder*="name or SKU"]').first();
        await search.click();
        const firstOpt = page.locator('mat-option').first();
        await firstOpt.waitFor({ timeout: 10000 });
        const productName = (await firstOpt.locator('span.truncate').first().innerText()).trim();
        await firstOpt.click();

        // The Line Items header now carries a count badge for what's been added
        await expect(page.locator('h3:has-text("Line Items")')).toContainText(/1 added/);

        // Re-open the dropdown and search the same product — it should NOT appear
        // (filtered out). No mat-option means no mdc-list-item--selected double-tick.
        await search.click();
        await search.fill(productName);
        // Either we get "All matching products are already in this PO" or nothing matches
        const matchingOpts = page.locator('mat-option').filter({ hasText: productName });
        // Filter out the "already in this PO" notice option from the count
        const realMatches = matchingOpts.filter({ hasNotText: 'already in this PO' });
        await page.waitForTimeout(400);
        await expect(realMatches).toHaveCount(0);
    });
});
