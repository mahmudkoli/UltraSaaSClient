import { test, expect } from '@playwright/test';
import { login } from './auth.setup';

test.setTimeout(90000);

// Single-page inline-form CRUD (no FK, no separate route). Also exercises the
// backend fix that made template create/update bindable (was 400 via private setters).

test('SMS Templates CRUD: add → list → delete', async ({ page }) => {
    await login(page);
    await page.goto('/sms-templates');
    await page.waitForLoadState('networkidle');

    const ts = Date.now().toString().slice(-6);
    const title = `E2E SMS ${ts}`;
    await page.locator('input[formControlName="title"]').fill(title);
    await page.locator('textarea[formControlName="message"]').fill('Hello {Name}');
    await page.getByTestId('sms-template-save-btn').click();

    await expect(page.locator('table')).toContainText(title, { timeout: 20000 });
    page.once('dialog', d => d.accept());
    await page.locator('tr', { hasText: title }).getByTestId('sms-template-delete').click();
    await expect(page.locator('tr', { hasText: title })).toHaveCount(0, { timeout: 20000 });
});

test('Mail Templates CRUD: add → list → delete', async ({ page }) => {
    await login(page);
    await page.goto('/mail-templates');
    await page.waitForLoadState('networkidle');

    const ts = Date.now().toString().slice(-6);
    const title = `E2E Mail ${ts}`;
    await page.locator('input[formControlName="title"]').fill(title);
    await page.locator('input[formControlName="subject"]').fill('Welcome');
    await page.locator('textarea[formControlName="body"]').fill('<p>Hi {Name}</p>');
    await page.getByTestId('mail-template-save-btn').click();

    await expect(page.locator('table')).toContainText(title, { timeout: 20000 });
    page.once('dialog', d => d.accept());
    await page.locator('tr', { hasText: title }).getByTestId('mail-template-delete').click();
    await expect(page.locator('tr', { hasText: title })).toHaveCount(0, { timeout: 20000 });
});
