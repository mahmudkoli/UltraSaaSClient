import { Page } from '@playwright/test';

export const ADMIN_EMAIL = 'admin@root.com';
export const ADMIN_PASSWORD = '123Pa$$word!';
export const TENANT = 'root';

export async function login(page: Page) {
    await page.goto('/sign-in');
    await page.waitForSelector('#email', { timeout: 15000 });

    // Fill login form
    await page.locator('#tenant').fill(TENANT);
    await page.locator('#email').fill(ADMIN_EMAIL);
    await page.locator('#password').fill(ADMIN_PASSWORD);

    // Click the Sign in button (no type="submit", uses (click) handler)
    await page.locator('button:has-text("Sign in")').click();

    // Wait for redirect after login (goes to /users)
    await page.waitForURL('**/users', { timeout: 30000 });
}
