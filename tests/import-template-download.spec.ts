import { expect, test } from '@playwright/test';
import { ELECTRO_EMAIL, ELECTRO_TENANT, login } from './auth.setup';

/**
 * Regression: clicking "Download template" in the stock-adjustment import dialog
 * used to hit `/api/stockadjustments/import/template` as a plain anchor
 * navigation — the browser sent no JWT and the backend 401'd. Fix routes the
 * download through HttpClient (auth interceptor adds the token + tenant
 * header) and triggers a client-side blob download.
 */

test.setTimeout(60000);

test('Stock adjustments: Download template responds 200 with xlsx', async ({ page }) => {
    await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
    await page.goto('/stock-adjustments');
    await page.waitForLoadState('networkidle');

    // Open the import dialog
    await page.locator('button:has-text("Import")').first().click();
    await expect(page.locator('mat-dialog-container')).toBeVisible({ timeout: 5000 });

    // Intercept the template request and confirm it returns 200 with auth header
    const respPromise = page.waitForResponse((r) =>
        r.url().includes('/api/stockadjustments/import/template'));
    await page.locator('mat-dialog-container button:has-text("Download template")').click();
    const resp = await respPromise;
    expect(resp.status()).toBe(200);
    expect(resp.headers()['content-type']).toContain('spreadsheet');
    // Confirm Authorization header was on the request
    expect(resp.request().headers()['authorization']).toMatch(/^Bearer /);
});
