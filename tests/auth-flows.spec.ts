import { test, expect } from '@playwright/test';
import { login, TENANT } from './auth.setup';

test.setTimeout(60000);

// Auth surface that isn't exercised by the main login helper. These are smoke /
// validation checks — they don't mutate accounts.
test.describe('Auth flows', () => {
    test('sign-in page renders the tenant/email/password form', async ({ page }) => {
        await page.goto('/sign-in');
        await expect(page.locator('#tenant')).toBeVisible({ timeout: 15000 });
        await expect(page.locator('#email')).toBeVisible();
        await expect(page.locator('#password')).toBeVisible();
        await expect(page.locator('button:has-text("Sign in")')).toBeVisible();
    });

    test('sign-up page renders', async ({ page }) => {
        await page.goto('/sign-up');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('form, input').first()).toBeVisible({ timeout: 15000 });
    });

    test('forgot-password page renders an email field', async ({ page }) => {
        await page.goto('/forgot-password');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('input').first()).toBeVisible({ timeout: 15000 });
    });

    test('invalid credentials do not authenticate', async ({ page }) => {
        await page.goto('/sign-in');
        await page.waitForSelector('#email', { timeout: 15000 });
        await page.locator('#tenant').fill(TENANT);
        await page.locator('#email').fill('admin@root.com');
        await page.locator('#password').fill('definitely-wrong-password');
        await page.locator('button:has-text("Sign in")').click();
        await page.waitForTimeout(2500);
        await expect(page).toHaveURL(/.*sign-in/); // stays on sign-in
    });

    test('sign-out returns to sign-in', async ({ page }) => {
        await login(page);
        await page.goto('/sign-out');
        await expect(page).toHaveURL(/.*sign-in/, { timeout: 20000 });
    });
});
