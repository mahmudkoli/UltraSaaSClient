import { APIRequestContext, expect, test } from '@playwright/test';
import { ADMIN_PASSWORD, ELECTRO_EMAIL, ELECTRO_TENANT, login } from './auth.setup';

/**
 * Phase 2.3 — Sale returns / refunds flow E2E.
 *
 * Hybrid pattern: API drives sale + return creation (the contract that matters);
 * UI assertions cover the chrome the cashier interacts with (returns list,
 * return-form load with a real saleId in the URL).
 */

test.setTimeout(60000);

const API = 'http://localhost:5000';
const TENANT = ELECTRO_TENANT;
const EMAIL = ELECTRO_EMAIL;

async function authToken(req: APIRequestContext): Promise<string> {
    const res = await req.post(`${API}/api/tokens`, {
        headers: { 'Content-Type': 'application/json', tenant: TENANT },
        data: { email: EMAIL, password: ADMIN_PASSWORD },
    });
    expect(res.ok()).toBeTruthy();
    return (await res.json()).token;
}

function authHeaders(token: string) {
    return {
        'Content-Type': 'application/json',
        tenant: TENANT,
        Authorization: `Bearer ${token}`,
    };
}

async function postId(req: APIRequestContext, token: string, url: string, data: unknown): Promise<string> {
    const res = await req.post(`${API}${url}`, { headers: authHeaders(token), data: data as object });
    expect(res.ok(), `POST ${url} failed: ${await res.text()}`).toBeTruthy();
    return await res.json();
}

async function getJson(req: APIRequestContext, token: string, url: string) {
    const res = await req.get(`${API}${url}`, { headers: authHeaders(token) });
    expect(res.ok(), `GET ${url} failed: ${await res.text()}`).toBeTruthy();
    return await res.json();
}

async function seedSaleableProduct(req: APIRequestContext, token: string, outletId: string, suffix: string) {
    const brandId = await postId(req, token, '/api/brands', { name: `Brand-${suffix}` });
    const unitId = await postId(req, token, '/api/units',
        { name: `Each-${suffix}`, code: `EA${suffix}`.slice(0, 8), isWeight: false, decimalPlaces: 0 });
    const categoryId = await postId(req, token, '/api/categories', { name: `Cat-${suffix}` });
    const productId = await postId(req, token, '/api/products', {
        name: `Product ${suffix}`, sku: `SKU-${suffix}`,
        categoryId, brandId, unitId,
        costPrice: 50, sellingPrice: 100, taxRate: 0,
        reorderLevel: 0, isActive: true,
    });
    await postId(req, token, '/api/stockadjustments', {
        productId,
        outletId,
        newQuantity: 5,
        reason: 'OpeningBalance',
        notes: null,
    });
    return productId;
}

async function getStockOnHand(req: APIRequestContext, token: string, outletId: string, productId: string): Promise<number> {
    const list = await getJson(req, token, `/api/stocks/by-outlet/${outletId}?productId=${productId}`);
    if (!Array.isArray(list) || list.length === 0) return 0;
    return typeof list[0]?.quantity === 'number' ? list[0].quantity : 0;
}

test.describe('Returns — refund + stock-restore flow', () => {

    // ════════════════════════════════════════════════════════════
    // UI smoke: /returns list page renders
    // ════════════════════════════════════════════════════════════

    test('/returns list page loads', async ({ page }) => {
        await login(page, { tenant: TENANT, email: EMAIL });
        await page.goto('/returns');
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveURL(/\/returns/);
        await expect(page.locator('body')).toContainText(/Return/i);
    });

    // ════════════════════════════════════════════════════════════
    // Full lifecycle: sale → return one line → assert refund + stock restored
    // ════════════════════════════════════════════════════════════

    test('full sale-then-return cycle: stock restored + refund posted', async ({ request }) => {
        const token = await authToken(request);
        const headers = authHeaders(token);
        const suffix = `RET${Date.now().toString().slice(-6)}`;

        const outlets = await getJson(request, token, '/api/outlets');
        const outletId = outlets[0].id;

        const productId = await seedSaleableProduct(request, token, outletId, suffix);

        // Stock-on-hand baseline (after seed: 5)
        const stockBeforeSale = await getStockOnHand(request, token, outletId, productId);

        // Finalize sale of 2 units
        const saleId = await postId(request, token, '/api/sales', {
            outletId,
            customerName: `Walk-in ${suffix}`,
            lines: [{ productId, quantity: 2, unitPrice: 100, discountAmount: 0 }],
            payments: [{ amount: 200, method: 'Cash', reference: null }],
        });

        const sale = await getJson(request, token, `/api/sales/${saleId}`);
        expect(sale.status).toBe('Finalized');
        expect(sale.items.length).toBe(1);
        const saleItemId = sale.items[0].id;
        const lineTotal = sale.items[0].lineTotal;

        // Stock should now be down by 2
        const stockAfterSale = await getStockOnHand(request, token, outletId, productId);
        expect(stockAfterSale).toBe(stockBeforeSale - 2);

        // Return 1 unit, resellable → stock should recover by 1
        const returnRes = await request.post(`${API}/api/salereturns`, {
            headers,
            data: {
                saleId,
                reason: 'DefectiveProduct',
                lines: [{ saleItemId, quantity: 1, condition: 'Resellable' }],
                refunds: [{ amount: lineTotal / 2, method: 'Cash', reference: null }],
                notes: 'e2e — partial return resellable',
            },
        });
        expect(returnRes.ok(), `POST /api/salereturns failed: ${await returnRes.text()}`).toBeTruthy();
        const returnId = await returnRes.json();

        const ret = await getJson(request, token, `/api/salereturns/${returnId}`);
        expect(ret.status).toBe('Completed');
        expect(ret.items.length).toBe(1);
        expect(ret.items[0].condition).toBe('Resellable');

        // Stock restored: down 2 (sale) + up 1 (return) = -1 net
        const stockAfterReturn = await getStockOnHand(request, token, outletId, productId);
        expect(stockAfterReturn).toBe(stockBeforeSale - 1);

        // Damaged-condition return must NOT restock
        const returnRes2 = await request.post(`${API}/api/salereturns`, {
            headers,
            data: {
                saleId,
                reason: 'DefectiveProduct',
                lines: [{ saleItemId, quantity: 1, condition: 'Damaged' }],
                refunds: [{ amount: lineTotal / 2, method: 'Cash', reference: null }],
                notes: 'e2e — damaged-condition write-off',
            },
        });
        expect(returnRes2.ok(), `POST /api/salereturns failed: ${await returnRes2.text()}`).toBeTruthy();

        // Net change: sale -2, resellable +1, damaged 0 (off-shelf). Final = start - 1.
        const stockFinal = await getStockOnHand(request, token, outletId, productId);
        expect(stockFinal).toBe(stockBeforeSale - 1);
    });

    // ════════════════════════════════════════════════════════════
    // Return form UI loads when navigated with a real saleId
    // ════════════════════════════════════════════════════════════

    test('return-form page loads for a finalized sale', async ({ page, request }) => {
        const token = await authToken(request);
        const suffix = `UI${Date.now().toString().slice(-6)}`;

        const outlets = await getJson(request, token, '/api/outlets');
        const outletId = outlets[0].id;
        const productId = await seedSaleableProduct(request, token, outletId, suffix);

        const saleId = await postId(request, token, '/api/sales', {
            outletId,
            customerName: 'Walk-in UI',
            lines: [{ productId, quantity: 1, unitPrice: 100, discountAmount: 0 }],
            payments: [{ amount: 100, method: 'Cash', reference: null }],
        });

        await login(page, { tenant: TENANT, email: EMAIL });
        await page.goto(`/returns/new/${saleId}`);
        await page.waitForLoadState('networkidle');
        await expect(page.locator('body')).toContainText(/Process Return|Refund items from invoice/i, { timeout: 10000 });
    });
});
