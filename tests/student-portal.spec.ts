import { test, expect } from '@playwright/test';
import { loginAsStudent } from './auth-student.setup';

test.setTimeout(60000);

test.describe('Student self-service portal', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsStudent(page);
    });

    test('01 - login lands on the /my-profile dashboard', async ({ page }) => {
        await expect(page).toHaveURL(/.*\/my-profile/);
        await expect(page.getByRole('heading', { name: 'My Profile' })).toBeVisible({ timeout: 20000 });
    });

    // Each detail page renders under the canonical <app-list-page> heading.
    const detailPages: Array<[string, string]> = [
        ['/my-profile/attendance', 'My Attendance'],
        ['/my-profile/exam-results', 'My Exam Results'],
        ['/my-profile/timetable', 'My Timetable'],
        ['/my-profile/invoices', 'My Fee Invoices'],
        ['/my-profile/events', 'Notices & Events'],
    ];

    for (const [route, heading] of detailPages) {
        test(`02 - ${route} loads`, async ({ page }) => {
            await page.goto(route);
            await page.waitForLoadState('networkidle');
            await expect(page).toHaveURL(new RegExp(route.replace(/\//g, '\\/')));
            await expect(page.getByRole('heading', { name: heading })).toBeVisible({ timeout: 20000 });
        });
    }

    test('03 - dashboard quick-link tile navigates to a detail page', async ({ page }) => {
        await page.locator('a[href="/my-profile/attendance"]').first().click();
        await expect(page).toHaveURL(/.*\/my-profile\/attendance/);
        await expect(page.getByRole('heading', { name: 'My Attendance' })).toBeVisible({ timeout: 20000 });
    });

    test('04 - invoice list drills into a printable detail', async ({ page }) => {
        await page.goto('/my-profile/invoices');
        await page.waitForLoadState('networkidle');

        const view = page.locator('a[href*="/my-profile/invoices/"]').first();
        // Student may legitimately have no invoices in some seeds — only drill in if present.
        if (await view.count()) {
            await view.click();
            await expect(page).toHaveURL(/.*\/my-profile\/invoices\/[0-9a-fA-F-]+/);
            await expect(page.getByRole('heading', { name: 'Invoice', exact: true })).toBeVisible({ timeout: 20000 });
            await expect(page.getByRole('button', { name: /Print/ })).toBeVisible();
        }
    });

    test('05 - admin route is blocked for a student (permission guard redirect)', async ({ page }) => {
        await page.goto('/students');
        await expect(page).toHaveURL(/.*\/my-profile/, { timeout: 20000 });
    });
});
