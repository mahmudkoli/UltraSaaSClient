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

    // ────────────────────────────────────────────────────────────────
    // Full-demo coverage (Phase 2.46+): everything the 5-minute walkthrough
    // script in UltraSaaS/docs/MARKETING.md references. Plain page-load
    // shots unless a specific dialog/state is what the scene calls for.
    // ────────────────────────────────────────────────────────────────

    test('21 — customers list', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/customers');
        await shot(page, '21-customers');
    });

    test('22 — suppliers list', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/suppliers');
        await shot(page, '22-suppliers');
    });

    test('23 — purchase orders list', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/purchase-orders');
        await shot(page, '23-purchase-orders');
    });

    test('24 — goods receipts list', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/goods-receipts');
        await shot(page, '24-goods-receipts');
    });

    test('25 — purchase returns list', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/purchase-returns');
        await shot(page, '25-purchase-returns');
    });

    test('26 — stock transfers list', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/stock-transfers');
        await shot(page, '26-stock-transfers');
    });

    test('27 — stock adjustments list', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/stock-adjustments');
        await shot(page, '27-stock-adjustments');
    });

    test('28 — stock counts list', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/stock-counts');
        await shot(page, '28-stock-counts');
    });

    test('29 — stock serials (electronics)', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/inventory/serials');
        await shot(page, '29-stock-serials');
    });

    test('30 — batches (pharmacy)', async ({ page }) => {
        await login(page, { tenant: PHARMACY_TENANT, email: PHARMACY_EMAIL });
        await page.goto('/batches');
        await shot(page, '30-batches-pharmacy');
    });

    test('31 — prescriptions (pharmacy)', async ({ page }) => {
        await login(page, { tenant: PHARMACY_TENANT, email: PHARMACY_EMAIL });
        await page.goto('/prescriptions');
        await shot(page, '31-prescriptions-pharmacy');
    });

    test('32 — promotions (supermarket)', async ({ page }) => {
        await login(page, { tenant: SUPERMARKET_TENANT, email: SUPERMARKET_EMAIL });
        await page.goto('/promotions');
        await shot(page, '32-promotions-supermarket');
    });

    test('33 — shifts list', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/shifts');
        await shot(page, '33-shifts');
    });

    test('34 — users list', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/users');
        await shot(page, '34-users');
    });

    test('35 — roles list', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/users/roles');
        await shot(page, '35-roles');
    });

    test('36 — audit trail', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/audit');
        await shot(page, '36-audit');
    });

    test('37 — returns list', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/returns');
        await shot(page, '37-returns');
    });

    test('38 — catalog: categories', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/catalog/categories');
        await shot(page, '38-catalog-categories');
    });

    test('39 — catalog: brands', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/catalog/brands');
        await shot(page, '39-catalog-brands');
    });

    test('40 — catalog: units', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/catalog/units');
        await shot(page, '40-catalog-units');
    });

    test('41 — POS Find Sale dialog open', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/pos');
        await page.waitForLoadState('networkidle');
        await page.getByRole('button', { name: /Find sale/i }).click();
        await page.waitForTimeout(700); // dialog animation
        await shot(page, '41-pos-find-sale-dialog');
    });

    // ────────────────────────────────────────────────────────────────
    // Setup-side dialogs — informative for the "how do I configure this?"
    // half of the demo. Vertical-specific product extension dialogs answer
    // "where do I tell the system this phone needs a serial?".
    // ────────────────────────────────────────────────────────────────

    test('43 — product form (create)', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/catalog/products/create');
        await shot(page, '43-product-form-create');
    });

    test('44 — product Electronics dialog (RequiresSerial / warranty)', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/catalog/products');
        await page.waitForLoadState('networkidle');
        // Per-row icon button with the Electronics extension dialog.
        // matTooltip → renders as lowercase attribute on the button.
        await page.locator('button[mattooltip="Electronics details"]').first().click();
        await page.waitForTimeout(800); // dialog animation
        await shot(page, '44-product-electronics-dialog');
    });

    test('45 — product Pharmacy dialog (RequiresBatch / Prescription / Controlled)', async ({ page }) => {
        await login(page, { tenant: PHARMACY_TENANT, email: PHARMACY_EMAIL });
        await page.goto('/catalog/products');
        await page.waitForLoadState('networkidle');
        await page.locator('button[mattooltip="Pharmacy details"]').first().click();
        await page.waitForTimeout(800);
        await shot(page, '45-product-pharmacy-dialog');
    });

    test('46 — bulk import dialog', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/catalog/products');
        await page.waitForLoadState('networkidle');
        // Toolbar Import button — has a "Import" label inside the span.
        await page.getByRole('button', { name: /Import/ }).first().click();
        await page.waitForTimeout(800);
        await shot(page, '46-bulk-import-dialog');
    });

    test('47 — print labels dialog', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/catalog/products');
        await page.waitForLoadState('networkidle');
        await page.locator('button[mattooltip="Print barcode labels"]').first().click();
        await page.waitForTimeout(800);
        await shot(page, '47-print-labels-dialog');
    });

    // ────────────────────────────────────────────────────────────────
    // Branding deep-dive — the receipt-format story is one of the biggest
    // wow-moments. Capture the form fields, not just the list.
    // ────────────────────────────────────────────────────────────────

    test('48 — outlet form with logo + brand color + tax ID', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/outlet/create');
        await shot(page, '48-outlet-form-branding');
    });

    test('49 — branding profile form (Thermal 80mm default)', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/branding-profiles/create');
        await shot(page, '49-branding-profile-form-thermal');
    });

    test('52 — sale detail page (items + payments + re-print menu)', async ({ page }) => {
        // Closes the receipt-reprint loop visually — the sale-detail screen is
        // where customers' "I want an A4 copy" requests are served from.
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/sales');
        await page.waitForLoadState('networkidle');
        // First data row — open the detail.
        await page.locator('table tbody tr').first().click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(800);
        await shot(page, '52-sale-detail');
    });

    test('53 — share invoice dialog (WhatsApp / Copy / Native share)', async ({ page }) => {
        // Phase 2.47 — Bangladesh-market killer feature. Demo clip: cashier taps
        // Share, picks বাংলা, hits WhatsApp. Captured open with the bn preset.
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/sales');
        await page.waitForLoadState('networkidle');
        await page.locator('table tbody tr').first().click();
        await page.waitForLoadState('networkidle');
        await page.getByRole('button', { name: /^Share$/ }).click();
        // Wait for token round-trip + the dialog to settle into its loaded state.
        await page.waitForSelector('mat-form-field input[readonly]', { state: 'visible' });
        await page.waitForTimeout(900);
        await shot(page, '53-share-invoice-dialog');
    });

    // Phase 2.48 surfaces (platform admin dashboard, My Subscription, Record
    // Payment dialog) are intentionally NOT captured for marketing reels.
    // They're internal billing chrome — showing them in cold ads would confuse
    // the shop-owner narrative and leak MK Corex pricing. Keep them out of
    // every screenshot / video destined for outreach.

    test('51 — branded thermal receipt popup (re-print from Find Sale)', async ({ page, context }) => {
        // Visual payoff of the whole branding story: the printed receipt with
        // logo + invoice barcode. Triggered via the Find Sale dialog so we hit
        // a real seeded sale without having to ring one up live.
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/pos');
        await page.waitForLoadState('networkidle');
        await page.getByRole('button', { name: /Find sale/i }).click();
        await page.waitForTimeout(700);

        // receipt-print.service.print() opens a popup via window.open('', '_blank').
        const popupPromise = context.waitForEvent('page');
        await page.locator('button[mattooltip="Re-print receipt"]').first().click();
        const popup = await popupPromise;
        await popup.waitForLoadState('domcontentloaded');
        // bwip-js paints the barcode after onload — give it a beat.
        await popup.waitForTimeout(1200);
        await popup.screenshot({
            path: path.join(OUT_DIR, '51-receipt-popup-thermal.png'),
            fullPage: true,
        });
        await popup.close();
    });

    test('50 — branding profile form (A4 paper format selected)', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/branding-profiles/create');
        await page.waitForLoadState('networkidle');
        // Open the Paper Format select, pick A4.
        await page.locator('mat-select[formcontrolname="paperFormat"]').click();
        await page.waitForTimeout(500);
        await page.locator('mat-option:has-text("A4")').click();
        await page.waitForTimeout(400);
        await shot(page, '50-branding-profile-form-a4');
    });

    test('42 — POS Recall button with parked-count badge', async ({ page }) => {
        // Park a cart so the Recall button shows the amber badge.
        // Supermarket tenant — products don't require serials, so canFinalize() is
        // true after a single click-to-add (Electronics would disable Park until a
        // serial is filled in on every InStock line).
        await login(page, { tenant: SUPERMARKET_TENANT, email: SUPERMARKET_EMAIL });
        await page.goto('/pos');
        await page.waitForLoadState('networkidle');

        await page.locator('.grid button.border.rounded').first().click();
        await page.waitForTimeout(400);

        // park() in pos.component.ts uses window.prompt() — auto-accept.
        page.once('dialog', async (d) => {
            await d.accept('Marketing capture');
        });
        await page.getByRole('button', { name: /^Park$/ }).click();
        // Wait for the snackbar + badge refresh.
        await page.waitForTimeout(2000);
        await shot(page, '42-pos-park-badge');
    });
});
