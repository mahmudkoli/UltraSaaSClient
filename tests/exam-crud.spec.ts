import { test, expect } from '@playwright/test';
import { loginAsGreenwoodAdmin } from './auth.setup';

test.setTimeout(90000);

// Uses the Greenwood admin: this form's academicYearId dropdown is populated from
// seeded academic years, which exist on greenwood (not on the root tenant).
test.describe('Exams CRUD', () => {
    test('create (FK select + datepickers) → search → delete', async ({ page }) => {
        await loginAsGreenwoodAdmin(page);
        await page.goto('/exams');
        await page.waitForLoadState('networkidle');

        const ts = Date.now().toString().slice(-6);
        const name = `E2E Exam ${ts}`;

        await page.getByTestId('exam-add-btn').click();
        await expect(page).toHaveURL(/\/exams\/create/);
        await page.waitForLoadState('networkidle'); // academic-year options load

        await page.locator('input[formControlName="name"]').fill(name);
        await page.locator('input[formControlName="code"]').fill(`EX${ts}`);
        await page.locator('mat-select[formControlName="examType"]').click();
        await page.locator('mat-option').first().click();
        await page.locator('mat-select[formControlName="academicYearId"]').click();
        await page.locator('mat-option').first().click();
        await page.locator('input[formControlName="startDate"]').fill('1/1/2032');
        await page.locator('input[formControlName="startDate"]').press('Tab');
        await page.locator('input[formControlName="endDate"]').fill('1/5/2032');
        await page.locator('input[formControlName="endDate"]').press('Tab');
        await page.locator('input[formControlName="totalMarks"]').fill('100');
        await page.locator('input[formControlName="passingMarks"]').fill('40');
        await page.getByTestId('exam-save-btn').click();

        await expect(page).toHaveURL(/\/exams$/, { timeout: 20000 });
        await page.locator('input[matInput]').first().fill(name);
        const row = page.locator('tr', { hasText: name });
        await expect(row).toBeVisible({ timeout: 20000 });

        await row.getByTestId('exam-delete').click();
        await page.getByTestId('confirm-dialog-confirm').click();
        await expect(page.locator('tr', { hasText: name })).toHaveCount(0, { timeout: 20000 });
    });
});
