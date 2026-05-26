import { expect, test } from '@playwright/test';
import { ADMIN_PASSWORD, ELECTRO_EMAIL, ELECTRO_TENANT, login } from './auth.setup';

/**
 * Phase 2.58 — multilingual (EN + BN) toggle E2E.
 *
 * Asserts the resolution chain (user.preferredLanguage > tenant.defaultLanguage
 * > 'en'), the localStorage cache for boot, and the PATCH-via-PUT that
 * survives a wipe of localStorage.
 */

test.setTimeout(60_000);

const NAV_POS_EN = 'POS Sale';
const NAV_POS_BN = 'পিওএস বিক্রয়';

test.describe('Language toggle — Phase 2.58', () => {

    // ════════════════════════════════════════════════════════════
    // 1. Default lang resolves to 'en' (tenant default; no user pref)
    test('boots in English by default for a tenant with DefaultLanguage="en"', async ({ page, context }) => {
        await context.clearCookies();
        await page.addInitScript(() => localStorage.removeItem('lang'));

        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL, password: ADMIN_PASSWORD });

        await expect(page.locator('fuse-vertical-navigation')).toContainText(NAV_POS_EN);
        await expect(page.locator('fuse-vertical-navigation')).not.toContainText(NAV_POS_BN);
    });

    // ════════════════════════════════════════════════════════════
    // 2. Toggling to BN flips nav titles in place
    test('top-right picker flips nav titles to Bangla', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL, password: ADMIN_PASSWORD });

        await page.locator('languages button[mat-icon-button]').click();
        await page.locator('button[mat-menu-item]:has-text("বাংলা")').click();

        await expect(page.locator('fuse-vertical-navigation')).toContainText(NAV_POS_BN);
        await expect(page.locator('fuse-vertical-navigation')).not.toContainText(NAV_POS_EN);
    });

    // ════════════════════════════════════════════════════════════
    // 3. Choice survives a hard refresh (localStorage cache)
    test('language choice persists across hard refresh', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL, password: ADMIN_PASSWORD });

        await page.locator('languages button[mat-icon-button]').click();
        await page.locator('button[mat-menu-item]:has-text("বাংলা")').click();
        await expect(page.locator('fuse-vertical-navigation')).toContainText(NAV_POS_BN);

        await page.reload();
        await expect(page.locator('fuse-vertical-navigation')).toContainText(NAV_POS_BN, { timeout: 15_000 });
    });

    // ════════════════════════════════════════════════════════════
    // 4. Server-side pref wins on a fresh device (localStorage cleared)
    test('preference survives a localStorage wipe via server-side persistence', async ({ page, context }) => {
        // First session: pick BN, server-persist via the picker.
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL, password: ADMIN_PASSWORD });
        await page.locator('languages button[mat-icon-button]').click();
        await page.locator('button[mat-menu-item]:has-text("বাংলা")').click();
        await expect(page.locator('fuse-vertical-navigation')).toContainText(NAV_POS_BN);

        // Give the fire-and-forget PUT a chance to land before we sign out.
        await page.waitForTimeout(800);

        // Simulate a fresh device: drop cookies + localStorage.
        await context.clearCookies();
        await page.addInitScript(() => localStorage.clear());

        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL, password: ADMIN_PASSWORD });

        // Boot reads 'en' from localStorage default; initialDataResolver then
        // applies the user.preferredLanguage from /api/personal/profile and
        // swaps the active lang to bn before the nav paints.
        await expect(page.locator('fuse-vertical-navigation')).toContainText(NAV_POS_BN, { timeout: 15_000 });

        // Clean up — reset to 'en' so other specs run against the default.
        await page.locator('languages button[mat-icon-button]').click();
        await page.locator('button[mat-menu-item]:has-text("English")').click();
        await expect(page.locator('fuse-vertical-navigation')).toContainText(NAV_POS_EN);
        await page.waitForTimeout(800);
    });
});
