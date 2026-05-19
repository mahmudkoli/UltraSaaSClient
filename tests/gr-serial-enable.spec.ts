import { APIRequestContext, expect, test } from '@playwright/test';
import { ADMIN_PASSWORD, ELECTRO_EMAIL, ELECTRO_TENANT, login } from './auth.setup';

/**
 * Regression: the GR form's `Receive Goods` button used to stay disabled
 * forever on a serial-tracked product even after the cashier typed the right
 * number of serials. Root cause: `canSubmit` was a `computed()` reading the
 * `lines` signal, but typing in a textarea mutates `l.serialsText` directly
 * without invalidating the signal — so the computed memoized "false" and
 * never refreshed. Fix: convert validation/totals from `computed()` to plain
 * methods so they re-run on every change-detection tick (which `ngModel`
 * triggers).
 */

const API = 'http://localhost:5000';
test.setTimeout(60000);

async function authToken(req: APIRequestContext): Promise<string> {
    const res = await req.post(`${API}/api/tokens`, {
        headers: { 'Content-Type': 'application/json', tenant: ELECTRO_TENANT },
        data: { email: ELECTRO_EMAIL, password: ADMIN_PASSWORD },
    });
    expect(res.ok()).toBeTruthy();
    return (await res.json()).token;
}

function authHeaders(token: string) {
    return { 'Content-Type': 'application/json', tenant: ELECTRO_TENANT, Authorization: `Bearer ${token}` };
}

async function postId(req: APIRequestContext, token: string, url: string, data: unknown): Promise<string> {
    const res = await req.post(`${API}${url}`, { headers: authHeaders(token), data: data as object });
    expect(res.ok(), `POST ${url} failed: ${await res.text()}`).toBeTruthy();
    return await res.json();
}

test('GR: Receive Goods enables when serials match qty on a serial-tracked line', async ({ page, request }) => {
    const token = await authToken(request);
    const suffix = `S${Date.now().toString().slice(-6)}`;

    // Seed: outlet + supplier + serial-tracked product + draft PO + submit
    const outlets = await (await request.get(`${API}/api/outlets`, { headers: authHeaders(token) })).json();
    const outletId = outlets[0].id;

    const supplierId = await postId(request, token, '/api/suppliers', {
        name: `Sup ${suffix}`, phone: '+880170', isActive: true,
    });
    const brandId = await postId(request, token, '/api/brands', { name: `B-${suffix}` });
    const unitId = await postId(request, token, '/api/units',
        { name: `E-${suffix}`, code: `EA${suffix}`, isWeight: false, decimalPlaces: 0 });
    const categoryId = await postId(request, token, '/api/categories', { name: `C-${suffix}` });
    const productId = await postId(request, token, '/api/products', {
        name: `Phone ${suffix}`, sku: `SKU-${suffix}`,
        categoryId, brandId, unitId,
        costPrice: 100, sellingPrice: 200, taxRate: 0,
        reorderLevel: 0, isActive: true,
    });
    // Mark as serial-tracked
    const peRes = await request.put(`${API}/api/product-electronics/${productId}`, {
        headers: authHeaders(token),
        data: { productId, requiresSerial: true, warrantyMonths: 12, warrantyTerms: 'Standard' },
    });
    expect(peRes.ok()).toBeTruthy();

    const poId = await postId(request, token, '/api/purchaseorders', {
        outletId, supplierId,
        expectedDate: new Date().toISOString(),
        lines: [{ productId, quantity: 2, unitCost: 100 }],
    });
    const submitRes = await request.post(`${API}/api/purchaseorders/${poId}/submit`, { headers: authHeaders(token) });
    expect(submitRes.ok()).toBeTruthy();

    // Drive the UI
    await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
    await page.goto(`/goods-receipts/new/${poId}`);
    await page.waitForLoadState('networkidle');

    // Phase 2.57 layout: for qty <= 5 the GR form renders N inline mini-inputs
    // (one per unit) instead of a single textarea, keeping the field compact
    // and same-height as the qty stepper. By design the user can't overshoot
    // because there are exactly N slots.
    const slotInputs = page.locator('input[placeholder^="SN"]');
    await expect(slotInputs).toHaveCount(2, { timeout: 10000 });

    const receiveBtn = page.locator('button:has-text("Receive Goods")');

    // Initially disabled — no serials yet
    await expect(receiveBtn).toBeDisabled();

    // One serial filled — still disabled (qty=2)
    await slotInputs.nth(0).fill('SN-A-' + suffix);
    await expect(receiveBtn).toBeDisabled();

    // Both filled — enables
    await slotInputs.nth(1).fill('SN-B-' + suffix);
    await expect(receiveBtn).toBeEnabled({ timeout: 5000 });

    // Clear one — disabled again
    await slotInputs.nth(1).fill('');
    await expect(receiveBtn).toBeDisabled();
});
