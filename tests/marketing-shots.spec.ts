import { expect, test, type Page } from '@playwright/test';
import * as path from 'path';
import {
    ELECTRO_TENANT, ELECTRO_EMAIL,
    PHARMACY_TENANT, PHARMACY_EMAIL,
    SUPERMARKET_TENANT, SUPERMARKET_EMAIL,
    login,
} from './auth.setup';

/**
 * Marketing-asset capture. Not a real test — assertions are just "page loaded".
 * Output: ../UltraSaaS/docs/marketing-assets/*.png on the running localhost demo.
 * Run with: npx playwright test marketing-shots
 */

const OUT_DIR = path.resolve(__dirname, '../../UltraSaaS/docs/marketing-assets');

test.use({ viewport: { width: 1440, height: 900 } });
test.setTimeout(60000);

async function shot(page: Page, name: string) {
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(900); // animations + Material icon font
    await page.screenshot({
        path: path.join(OUT_DIR, name + '.png'),
        fullPage: false,
    });
}

test.describe.serial('marketing screenshots', () => {

    test('11 — sign-in page', async ({ page }) => {
        await page.goto('/sign-in');
        await page.waitForSelector('#email');
        await shot(page, '11-signin');
    });

    test('02 — POS empty (electronics)', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/pos');
        await shot(page, '02-pos-electroplus');
    });

    test('07 — POS (pharmacy)', async ({ page }) => {
        await login(page, { tenant: PHARMACY_TENANT, email: PHARMACY_EMAIL });
        await page.goto('/pos');
        await shot(page, '07-pos-pharmacy');
    });

    test('08 — POS (supermarket)', async ({ page }) => {
        await login(page, { tenant: SUPERMARKET_TENANT, email: SUPERMARKET_EMAIL });
        await page.goto('/pos');
        await shot(page, '08-pos-supermarket');
    });

    test('12 — catalog (electronics)', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/catalog');
        await shot(page, '12-catalog-electronics');
    });

    test('13 — catalog (pharmacy)', async ({ page }) => {
        await login(page, { tenant: PHARMACY_TENANT, email: PHARMACY_EMAIL });
        await page.goto('/catalog');
        await shot(page, '13-catalog-pharmacy');
    });

    test('14 — catalog (supermarket)', async ({ page }) => {
        await login(page, { tenant: SUPERMARKET_TENANT, email: SUPERMARKET_EMAIL });
        await page.goto('/catalog');
        await shot(page, '14-catalog-supermarket');
    });

    test('09 — outlets list', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/outlet');
        await shot(page, '09-outlets');
    });

    test('15 — branding profiles', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/branding-profiles');
        await shot(page, '15-branding-profiles');
    });

    test('16 — sales list', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/sales');
        await shot(page, '16-sales-list');
    });

    test('17 — inventory stock on hand', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/inventory');
        await shot(page, '17-inventory');
    });

    test('18 — reports', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/reports');
        await shot(page, '18-reports');
    });

    // ────────────────────────────────────────────────────────────────
    // Interactive shots — open menus / fill cart / open the help drawer.
    // These are the action moments the 30-second storyboard depends on.
    // ────────────────────────────────────────────────────────────────

    test('03 — POS with cart populated', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/pos');
        await page.waitForLoadState('networkidle');
        // Click the first product tile in the grid — the (click)="addToCart(p)"
        // buttons in pos.component.ts are .border.rounded.p-2 inside .grid.
        await page.locator('.grid button.border.rounded').first().click();
        await page.waitForTimeout(500);
        await shot(page, '03-pos-cart-populated');
    });

    test('04 — POS payment method dropdown open', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/pos');
        await page.waitForLoadState('networkidle');
        // Need an item in cart to make the payment section visible / interactive.
        await page.locator('.grid button.border.rounded').first().click();
        await page.waitForTimeout(400);
        // Open the Method mat-select — the second mat-select on the page after Outlet.
        await page.locator('mat-form-field:has(mat-label:text-is("Method")) mat-select').click();
        await page.waitForTimeout(700); // overlay animation
        await shot(page, '04-pos-payment-method-open');
    });

    test('20 — outlet switcher dropdown open', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/pos');
        await page.waitForLoadState('networkidle');
        await page.locator('mat-form-field:has(mat-label:text-is("Outlet")) mat-select').click();
        await page.waitForTimeout(700);
        await shot(page, '20-outlet-switcher-open');
    });

    test('10 — help drawer in Bangla with search', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/pos');
        await page.waitForLoadState('networkidle');
        await page.getByRole('button', { name: 'Open help' }).click();
        await page.waitForTimeout(400);
        // Switch to Bangla.
        await page.locator('button.lang-pill:has-text("বাংলা")').click();
        await page.waitForTimeout(300);
        // Type a Bangla query that exists in help-content.ts (POS section).
        await page.locator('input.help-search-input').fill('স্টক');
        await page.waitForTimeout(600); // give the computed signal + highlight a moment
        await shot(page, '10-help-drawer-bangla-search');
    });
});
