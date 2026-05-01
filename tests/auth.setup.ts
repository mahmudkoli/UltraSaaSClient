import { Page, expect } from '@playwright/test';

export const ROOT_TENANT = 'root';
export const ROOT_EMAIL = 'admin@root.com';

export const ELECTRO_TENANT = 'electroplus';
export const ELECTRO_EMAIL = 'admin@electroplus.com';

// Phase 2.7z demo tenants — one per BusinessType.
export const GENERIC_TENANT = 'compumart';
export const GENERIC_EMAIL = 'admin@compumart.com';

export const PHARMACY_TENANT = 'mediplus';
export const PHARMACY_EMAIL = 'admin@mediplus.com';

export const SUPERMARKET_TENANT = 'freshmart';
export const SUPERMARKET_EMAIL = 'admin@freshmart.com';

export const ADMIN_PASSWORD = '123Pa$$word!';

// Backward-compat constants for the original e2e.spec.ts.
export const ADMIN_EMAIL = ROOT_EMAIL;
export const TENANT = ROOT_TENANT;

/**
 * Logs into the SPA with the given tenant credentials. Falls through to
 * whatever post-login route the app navigates to (Phase 2.7d default is
 * /pos). Callers should wait for whatever screen they need next.
 */
export async function login(
    page: Page,
    opts: { tenant?: string; email?: string; password?: string } = {},
) {
    const tenant = opts.tenant ?? ROOT_TENANT;
    const email = opts.email ?? ROOT_EMAIL;
    const password = opts.password ?? ADMIN_PASSWORD;

    await page.goto('/sign-in');
    await page.waitForSelector('#email', { timeout: 15000 });

    await page.locator('#tenant').fill(tenant);
    await page.locator('#email').fill(email);
    await page.locator('#password').fill(password);
    await page.locator('button:has-text("Sign in")').click();

    // The auth flow is done once the URL leaves /sign-in.
    await expect(page).not.toHaveURL(/sign-in/, { timeout: 30000 });
}
