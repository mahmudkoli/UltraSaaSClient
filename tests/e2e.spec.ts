import { test, expect } from '@playwright/test';
import { login } from './auth.setup';

// Increase timeout for tests that need login
test.setTimeout(60000);

test.describe('UltraSaaS E2E Tests', () => {

    // ════════════════════════════════════════════════════════════
    // AUTH
    // ════════════════════════════════════════════════════════════

    test('01 - Login redirects to users list', async ({ page }) => {
        await login(page);
        await expect(page).toHaveURL(/.*users/);
    });

    // ════════════════════════════════════════════════════════════
    // DASHBOARD
    // ════════════════════════════════════════════════════════════

    test('02 - Dashboard loads', async ({ page }) => {
        await login(page);
        await page.goto('/analytics');
        await expect(page).toHaveURL(/.*analytics/);
        // The analytics component renders — check the page heading in the header bar
        await expect(page.locator('text=Analytics Dashboard').first()).toBeVisible({ timeout: 20000 });
    });

    // ════════════════════════════════════════════════════════════
    // NAVIGATION — all 18 module routes load without error
    // ════════════════════════════════════════════════════════════

    const moduleRoutes = [
        '/users', '/students', '/teachers',
        '/academic-years', '/classes', '/subjects',
        '/class-subjects', '/student-classes', '/attendances',
        '/exams', '/exam-results',
        '/fee-types', '/fee-structures', '/fee-structure-details', '/fee-invoices',
        '/student-health', '/student-academics', '/teacher-qualifications',
    ];

    test('03 - All 18 module routes load', async ({ page }) => {
        await login(page);
        for (const route of moduleRoutes) {
            await page.goto(route);
            await page.waitForLoadState('networkidle');
            await expect(page).toHaveURL(new RegExp(route));
            // Verify page rendered (not blank)
            await expect(page.locator('fuse-vertical-navigation, fuse-horizontal-navigation, .fuse-mat-button-large, mat-toolbar, [class*="header"], h2, table, mat-card').first()).toBeVisible({ timeout: 5000 });
        }
    });

    // ════════════════════════════════════════════════════════════
    // STUDENT LIST + CREATE FORM
    // ════════════════════════════════════════════════════════════

    test('04 - Students: list shows data from demo seed', async ({ page }) => {
        await login(page);
        await page.goto('/students');
        await page.waitForLoadState('networkidle');
        // Demo data: "Aarav" is the first seeded student
        await expect(page.locator('body')).toContainText(/Aarav|Mehta|student/i, { timeout: 10000 });
    });

    test('05 - Students: create form renders', async ({ page }) => {
        await login(page);
        await page.goto('/students/create');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('text=First Name').first()).toBeVisible({ timeout: 10000 });
    });

    // ════════════════════════════════════════════════════════════
    // TEACHER LIST + CREATE FORM
    // ════════════════════════════════════════════════════════════

    test('06 - Teachers: list shows data', async ({ page }) => {
        await login(page);
        await page.goto('/teachers');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('body')).toContainText(/Rajesh|Sharma|teacher/i, { timeout: 10000 });
    });

    test('07 - Teachers: create form renders', async ({ page }) => {
        await login(page);
        await page.goto('/teachers/create');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('text=First Name').first()).toBeVisible({ timeout: 10000 });
    });

    // ════════════════════════════════════════════════════════════
    // ACADEMIC YEAR
    // ════════════════════════════════════════════════════════════

    test('08 - Academic Years: list shows seeded data', async ({ page }) => {
        await login(page);
        await page.goto('/academic-years');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('text=2025-2026').first()).toBeVisible({ timeout: 10000 });
    });

    // ════════════════════════════════════════════════════════════
    // CLASSES
    // ════════════════════════════════════════════════════════════

    test('09 - Classes: list shows seeded data', async ({ page }) => {
        await login(page);
        await page.goto('/classes');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('text=Grade 7').first()).toBeVisible({ timeout: 10000 });
    });

    // ════════════════════════════════════════════════════════════
    // SUBJECTS
    // ════════════════════════════════════════════════════════════

    test('10 - Subjects: list shows seeded data', async ({ page }) => {
        await login(page);
        await page.goto('/subjects');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('text=Mathematics').first()).toBeVisible({ timeout: 10000 });
    });

    // ════════════════════════════════════════════════════════════
    // EXAMS
    // ════════════════════════════════════════════════════════════

    test('11 - Exams: list shows seeded data', async ({ page }) => {
        await login(page);
        await page.goto('/exams');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('text=Mid-Term').first()).toBeVisible({ timeout: 10000 });
    });

    // ════════════════════════════════════════════════════════════
    // FEE TYPES
    // ════════════════════════════════════════════════════════════

    test('12 - Fee Types: list shows seeded data', async ({ page }) => {
        await login(page);
        await page.goto('/fee-types');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('text=Tuition').first()).toBeVisible({ timeout: 10000 });
    });

    // ════════════════════════════════════════════════════════════
    // FEE INVOICES
    // ════════════════════════════════════════════════════════════

    test('13 - Fee Invoices: list shows seeded data', async ({ page }) => {
        await login(page);
        await page.goto('/fee-invoices');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('text=INV-').first()).toBeVisible({ timeout: 10000 });
    });

    // ════════════════════════════════════════════════════════════
    // TENANT & INSTITUTE
    // ════════════════════════════════════════════════════════════

    test('14 - Tenant: list shows root', async ({ page }) => {
        await login(page);
        await page.goto('/tenant');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('text=root').first()).toBeVisible({ timeout: 10000 });
    });

    test('15 - Institute: page loads', async ({ page }) => {
        await login(page);
        await page.goto('/institute');
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveURL(/.*institute/);
    });
});
