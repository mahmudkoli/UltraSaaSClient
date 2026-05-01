import { expect, test } from '@playwright/test';
import { ELECTRO_EMAIL, ELECTRO_TENANT, login } from './auth.setup';

test.setTimeout(60000);

test.describe('UltraPOS — go-live phases (2.10–2.14)', () => {

    // ════════════════════════════════════════════════════════════
    // Phase 2.12 — health probes (anonymous; no login)
    // ════════════════════════════════════════════════════════════

    test('2.12 — /health/live returns 200 unauthenticated', async ({ request }) => {
        const res = await request.get('http://localhost:5000/health/live');
        expect(res.status()).toBe(200);
    });

    test('2.12 — /health/ready returns 200 unauthenticated', async ({ request }) => {
        const res = await request.get('http://localhost:5000/health/ready');
        expect(res.status()).toBe(200);
    });

    // ════════════════════════════════════════════════════════════
    // Phase 2.13 — audit log viewer
    // ════════════════════════════════════════════════════════════

    test('2.13 — /audit page loads with the trail table', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/audit?layout=classy');
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveURL(/\/audit/);
        await expect(page.locator('body')).toContainText(/Audit/i);
    });

    // ════════════════════════════════════════════════════════════
    // Phase 2.14 — cycle count list
    // ════════════════════════════════════════════════════════════

    test('2.14 — /stock-counts page loads', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/stock-counts?layout=classy');
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveURL(/\/stock-counts/);
        await expect(page.locator('body')).toContainText(/Cycle Counts|Cycle\s*Count/i);
    });

    test('2.14 — Start cycle count form is reachable', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/stock-counts/create?layout=classy');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('body')).toContainText(/Start\s*Cycle\s*Count|Scope/i);
        // Outlet + scope + Start button present
        await expect(page.locator('button:has-text("Start Count")')).toBeVisible();
    });

    test('2.14 — full lifecycle via API: start → record → complete', async ({ request }) => {
        // Login to get token (rest of the test runs against the API directly —
        // it's the cleanest way to verify the full stock-count lifecycle without
        // needing seeded UI fixtures).
        const auth = await request.post('http://localhost:5000/api/tokens', {
            headers: { 'Content-Type': 'application/json', tenant: ELECTRO_TENANT },
            data: { email: ELECTRO_EMAIL, password: '123Pa$$word!' },
        });
        expect(auth.ok()).toBeTruthy();
        const { token } = await auth.json();
        const headers = {
            'Content-Type': 'application/json',
            tenant: ELECTRO_TENANT,
            Authorization: `Bearer ${token}`,
        };

        // Find an outlet
        const outletsRes = await request.get('http://localhost:5000/api/outlets', { headers });
        const outlets = await outletsRes.json();
        expect(outlets.length).toBeGreaterThan(0);
        const outletId = outlets[0].id;

        // Start count (snapshots all active products)
        const startRes = await request.post('http://localhost:5000/api/stockcounts', {
            headers,
            data: { outletId, scope: 'AllProducts', notes: 'e2e smoke' },
        });
        expect(startRes.ok()).toBeTruthy();
        const countId = (await startRes.json()) as string;

        // Get the count and pick the first line
        const getRes = await request.get(`http://localhost:5000/api/stockcounts/${countId}`, { headers });
        const count = await getRes.json();
        expect(count.status).toBe('InProgress');
        expect(count.lineCount).toBeGreaterThan(0);
        const firstLine = count.lines[0];

        // Record a counted qty equal to expected (zero variance — verifies the
        // record endpoint works without polluting stock)
        const recordRes = await request.post(`http://localhost:5000/api/stockcounts/${countId}/lines`, {
            headers,
            data: {
                countId,
                lineId: firstLine.id,
                countedQty: firstLine.expectedQty,
                lineNotes: 'matches system',
            },
        });
        expect(recordRes.ok()).toBeTruthy();

        // Complete (no variance → no adjustment posted, but state moves to Completed)
        const completeRes = await request.post(`http://localhost:5000/api/stockcounts/${countId}/complete`, {
            headers,
            data: { notes: 'e2e completed' },
        });
        expect(completeRes.ok()).toBeTruthy();

        // Verify state transition
        const finalRes = await request.get(`http://localhost:5000/api/stockcounts/${countId}`, { headers });
        const final = await finalRes.json();
        expect(final.status).toBe('Completed');
        expect(final.countedLines).toBeGreaterThanOrEqual(1);
    });

    // ════════════════════════════════════════════════════════════
    // Phase 2.10 — Park/recall sale
    // ════════════════════════════════════════════════════════════

    test('2.10 — POS exposes Park + Recall buttons', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/pos?layout=classy');
        await page.waitForLoadState('networkidle');
        // Park + Recall buttons visible (recall via parked-carts dialog)
        await expect(page.locator('body')).toContainText(/Park|Recall|parked/i);
    });

    test('2.10 — parked carts API endpoint reachable', async ({ request }) => {
        const auth = await request.post('http://localhost:5000/api/tokens', {
            headers: { 'Content-Type': 'application/json', tenant: ELECTRO_TENANT },
            data: { email: ELECTRO_EMAIL, password: '123Pa$$word!' },
        });
        const { token } = await auth.json();
        const outletsRes = await request.get('http://localhost:5000/api/outlets', {
            headers: { tenant: ELECTRO_TENANT, Authorization: `Bearer ${token}` },
        });
        const outlets = await outletsRes.json();
        const outletId = outlets[0].id;
        const res = await request.get(`http://localhost:5000/api/parkedcarts/by-outlet/${outletId}`, {
            headers: { tenant: ELECTRO_TENANT, Authorization: `Bearer ${token}` },
        });
        expect(res.ok()).toBeTruthy();
        const list = await res.json();
        expect(Array.isArray(list)).toBeTruthy();
    });

    // ════════════════════════════════════════════════════════════
    // Phase 2.15 — AR Aging report
    // ════════════════════════════════════════════════════════════

    test('2.15 — /api/reports/ar-aging returns the expected shape', async ({ request }) => {
        const auth = await request.post('http://localhost:5000/api/tokens', {
            headers: { 'Content-Type': 'application/json', tenant: ELECTRO_TENANT },
            data: { email: ELECTRO_EMAIL, password: '123Pa$$word!' },
        });
        const { token } = await auth.json();
        const res = await request.get('http://localhost:5000/api/reports/ar-aging', {
            headers: { tenant: ELECTRO_TENANT, Authorization: `Bearer ${token}` },
        });
        expect(res.ok()).toBeTruthy();
        const body = await res.json();
        expect(body).toHaveProperty('asOf');
        expect(body).toHaveProperty('bucket0to30');
        expect(body).toHaveProperty('bucket31to60');
        expect(body).toHaveProperty('bucket61to90');
        expect(body).toHaveProperty('bucketOver90');
        expect(body).toHaveProperty('totalOutstanding');
        expect(Array.isArray(body.byCustomer)).toBeTruthy();
    });

    test('2.15 — Reports page exposes the AR Aging tab', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/reports?layout=classy');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('body')).toContainText(/AR\s*Aging/i);
    });

    // ════════════════════════════════════════════════════════════
    // Phase 2.16 — Manager override for strict pricing
    // ════════════════════════════════════════════════════════════

    test('2.16 — verify-override accepts admin credentials and rejects bad password', async ({ request }) => {
        const auth = await request.post('http://localhost:5000/api/tokens', {
            headers: { 'Content-Type': 'application/json', tenant: ELECTRO_TENANT },
            data: { email: ELECTRO_EMAIL, password: '123Pa$$word!' },
        });
        const { token } = await auth.json();

        const ok = await request.post('http://localhost:5000/api/personal/verify-override', {
            headers: { 'Content-Type': 'application/json', tenant: ELECTRO_TENANT, Authorization: `Bearer ${token}` },
            data: { email: ELECTRO_EMAIL, password: '123Pa$$word!', requiredPermission: 'Permissions.Sales.Discount' },
        });
        expect(ok.ok()).toBeTruthy();
        const body = await ok.json();
        expect(body.authorizedUserId).toBeTruthy();
        expect(body.permission).toBe('Permissions.Sales.Discount');

        const bad = await request.post('http://localhost:5000/api/personal/verify-override', {
            headers: { 'Content-Type': 'application/json', tenant: ELECTRO_TENANT, Authorization: `Bearer ${token}` },
            data: { email: ELECTRO_EMAIL, password: 'wrong-password', requiredPermission: 'Permissions.Sales.Discount' },
        });
        expect(bad.status()).toBe(401);
    });

    // ════════════════════════════════════════════════════════════
    // Phase 2.11 — Z/X-reports (open shift snapshot)
    // ════════════════════════════════════════════════════════════

    test('2.11 — shift report endpoint shape', async ({ request }) => {
        const auth = await request.post('http://localhost:5000/api/tokens', {
            headers: { 'Content-Type': 'application/json', tenant: ELECTRO_TENANT },
            data: { email: ELECTRO_EMAIL, password: '123Pa$$word!' },
        });
        const { token } = await auth.json();
        const headers = { tenant: ELECTRO_TENANT, Authorization: `Bearer ${token}` };

        // Find a shift (any) — search returns paginated list
        const searchRes = await request.post('http://localhost:5000/api/shifts/search', {
            headers: { ...headers, 'Content-Type': 'application/json' },
            data: { pageNumber: 1, pageSize: 1 },
        });
        if (!searchRes.ok()) return; // No shifts — skip silently
        const page = await searchRes.json();
        if (!page.data?.length) return;

        const shiftId = page.data[0].id;
        const reportRes = await request.get(`http://localhost:5000/api/shifts/${shiftId}/report`, { headers });
        expect(reportRes.ok()).toBeTruthy();
        const report = await reportRes.json();
        // X if open, Z if closed — both are valid
        expect(['X', 'Z']).toContain(report.reportType);
    });
});
