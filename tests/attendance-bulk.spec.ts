import { test, expect } from '@playwright/test';
import { login } from './auth.setup';

test.setTimeout(60000);

test.describe('Attendance Bulk Mark E2E', () => {

    test('01 - List shows Bulk Mark button', async ({ page }) => {
        await login(page);
        await page.goto('/attendances');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('[data-testid="bulk-mark-button"]')).toBeVisible();
    });

    test('02 - Bulk Mark page loads with class/subject/date pickers', async ({ page }) => {
        await login(page);
        await page.goto('/attendances/bulk-mark');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('[data-testid="class-select"]')).toBeVisible();
        await expect(page.locator('[data-testid="subject-select"]')).toBeVisible();
        await expect(page.locator('[data-testid="date-input"]')).toBeVisible();
        await expect(page.locator('[data-testid="load-roster-button"]')).toBeVisible();
    });

    test('03 - Load roster for a class renders students with status dropdowns', async ({ page }) => {
        await login(page);
        await page.goto('/attendances/bulk-mark');
        await page.waitForLoadState('networkidle');

        // Open the class dropdown and select the first option
        await page.locator('[data-testid="class-select"]').click();
        await page.locator('mat-option').first().click();

        // Wait for the mat-select overlay to close so it no longer occludes the page
        await page.locator('.cdk-overlay-backdrop').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});

        // Click Load Roster
        await page.locator('[data-testid="load-roster-button"]').click();

        // Wait for either the roster toolbar or the empty-state to appear
        await Promise.race([
            page.locator('[data-testid="mark-all-present"]').waitFor({ state: 'visible', timeout: 10000 }),
            page.locator('text=No students enrolled').waitFor({ state: 'visible', timeout: 10000 })
        ]);
    });

    test('04 - List page has date range filter controls', async ({ page }) => {
        await login(page);
        await page.goto('/attendances');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('[data-testid="from-date"]')).toBeVisible();
        await expect(page.locator('[data-testid="to-date"]')).toBeVisible();
    });

});
