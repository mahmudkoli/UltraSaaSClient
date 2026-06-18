import { Page } from '@playwright/test';

// Seeded Greenwood demo student (Ishaan Verma). Same dev password as all demo users.
export const STUDENT_EMAIL = 'ishaan.verma@student.greenwood.edu';
export const STUDENT_PASSWORD = '123Pa$$word!';
export const STUDENT_TENANT = 'greenwood';

/**
 * Log in as a student on the Greenwood tenant. A student has zero permissions,
 * so the permission-aware landing guard sends them to /my-profile.
 */
export async function loginAsStudent(page: Page) {
    await page.goto('/sign-in');
    await page.waitForSelector('#email', { timeout: 15000 });

    await page.locator('#tenant').fill(STUDENT_TENANT);
    await page.locator('#email').fill(STUDENT_EMAIL);
    await page.locator('#password').fill(STUDENT_PASSWORD);
    await page.locator('button:has-text("Sign in")').click();

    await page.waitForURL('**/my-profile', { timeout: 30000 });
}
