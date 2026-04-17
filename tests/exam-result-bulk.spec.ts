import { test, expect } from '@playwright/test';
import { login } from './auth.setup';

test.setTimeout(60000);

test.describe('Exam Results Bulk Entry E2E', () => {

    test('01 - List shows Bulk Entry button', async ({ page }) => {
        await login(page);
        await page.goto('/exam-results');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('[data-testid="bulk-entry-button"]')).toBeVisible();
    });

    test('02 - Bulk Entry page loads with exam/subject/class/marks selectors', async ({ page }) => {
        await login(page);
        await page.goto('/exam-results/bulk-entry');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('[data-testid="exam-select"]')).toBeVisible();
        await expect(page.locator('[data-testid="subject-select"]')).toBeVisible();
        await expect(page.locator('[data-testid="class-select"]')).toBeVisible();
        await expect(page.locator('[data-testid="total-marks"]')).toBeVisible();
        await expect(page.locator('[data-testid="load-roster-button"]')).toBeVisible();
    });

    test('03 - Load roster renders marks grid or empty state', async ({ page }) => {
        await login(page);
        await page.goto('/exam-results/bulk-entry');
        await page.waitForLoadState('networkidle');

        async function pickFirst(selector: string) {
            // Required-marker asterisk intercepts pointer events — use force click
            await page.locator(selector).click({ force: true });
            await page.locator('mat-option').first().waitFor({ state: 'visible', timeout: 5000 });
            await page.locator('mat-option').first().click();
            await page.waitForFunction(() => !document.querySelector('.mat-mdc-select-panel'), { timeout: 5000 }).catch(() => {});
        }

        await pickFirst('[data-testid="exam-select"]');
        await pickFirst('[data-testid="subject-select"]');
        await pickFirst('[data-testid="class-select"]');

        await page.locator('[data-testid="load-roster-button"]').click();

        await Promise.race([
            page.locator('[data-testid="save-bulk-button"]').waitFor({ state: 'visible', timeout: 15000 }),
            page.locator('text=No students in this class').waitFor({ state: 'visible', timeout: 15000 })
        ]);
    });

});
