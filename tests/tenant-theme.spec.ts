import { test, expect } from '@playwright/test';
import { login } from './auth.setup';

test.setTimeout(60000);

test.describe('Tenant Theme Settings E2E', () => {

    // ════════════════════════════════════════════════════════════
    // NAVIGATION
    // ════════════════════════════════════════════════════════════

    test('01 - Tenant list shows Theme column', async ({ page }) => {
        await login(page);
        await page.goto('/tenant');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('text=Theme').first()).toBeVisible({ timeout: 10000 });
    });

    test('02 - Theme settings page loads for tenant', async ({ page }) => {
        await login(page);
        await page.goto('/tenant/electroplus/theme-settings');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('text=Theme Settings').first()).toBeVisible({ timeout: 10000 });
        await expect(page.locator('text=electroplus').first()).toBeVisible();
    });

    test('03 - Theme settings page shows Color Theme section', async ({ page }) => {
        await login(page);
        await page.goto('/tenant/electroplus/theme-settings');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('text=Color Theme').first()).toBeVisible({ timeout: 10000 });
        await expect(page.locator('text=Color Scheme').first()).toBeVisible();
        await expect(page.locator('text=Layout').first()).toBeVisible();
    });

    // ════════════════════════════════════════════════════════════
    // THEME SELECTION
    // ════════════════════════════════════════════════════════════

    test('04 - Can select a color theme', async ({ page }) => {
        await login(page);
        await page.goto('/tenant/electroplus/theme-settings');
        await page.waitForLoadState('networkidle');

        // Click on Teal theme
        await page.locator('text=Teal').click();

        // Verify selection ring appears (ring-2 class applied)
        const tealOption = page.locator('.theme-teal').first();
        await expect(tealOption).toHaveClass(/ring-2/);
    });

    test('05 - Can select a color scheme', async ({ page }) => {
        await login(page);
        await page.goto('/tenant/electroplus/theme-settings');
        await page.waitForLoadState('networkidle');

        // Click Dark scheme
        await page.locator('text=Dark').first().click();

        // Verify the Dark option has ring-2
        const darkOption = page.locator('text=Dark').first().locator('..');
        await expect(darkOption).toHaveClass(/ring-2/);
    });

    test('06 - Can select a layout', async ({ page }) => {
        await login(page);
        await page.goto('/tenant/electroplus/theme-settings');
        await page.waitForLoadState('networkidle');

        // Click Modern layout
        await page.locator('text=Modern').first().click();

        // Verify Modern label has primary color
        const modernLabel = page.locator('text=Modern').first();
        await expect(modernLabel).toHaveClass(/text-primary/);
    });

    // ════════════════════════════════════════════════════════════
    // PREVIEW
    // ════════════════════════════════════════════════════════════

    test('07 - Preview button exists and works', async ({ page }) => {
        await login(page);
        await page.goto('/tenant/electroplus/theme-settings');
        await page.waitForLoadState('networkidle');

        // Preview button should be visible
        const previewBtn = page.locator('button:has-text("Preview")');
        await expect(previewBtn).toBeVisible({ timeout: 10000 });

        // Click preview
        await previewBtn.click();

        // Banner should appear
        await expect(page.locator('text=Previewing theme').first()).toBeVisible({ timeout: 10000 });

        // Back to Current button should appear
        await expect(page.locator('button:has-text("Back to Current")').first()).toBeVisible();
    });

    test('08 - Back to Current restores original', async ({ page }) => {
        await login(page);
        await page.goto('/tenant/electroplus/theme-settings');
        await page.waitForLoadState('networkidle');

        // Select a different theme and preview
        await page.locator('text=Rose').click();
        await page.locator('button:has-text("Preview")').click();
        await page.waitForLoadState('networkidle');

        // Click Back to Current
        await page.locator('button:has-text("Back to Current")').first().click();
        await page.waitForLoadState('networkidle');

        // Preview banner should be gone
        await expect(page.locator('text=Previewing theme')).toBeHidden({ timeout: 10000 });
    });

    // ════════════════════════════════════════════════════════════
    // SAVE
    // ════════════════════════════════════════════════════════════

    test('09 - Save theme and verify selections persist', async ({ page }) => {
        await login(page);
        await page.goto('/tenant/electroplus/theme-settings');
        await page.waitForLoadState('networkidle');

        // Select Teal + Dark + Compact
        await page.locator('text=Teal').click();
        await page.locator('text=Dark').first().click();
        await page.locator('text=Compact').first().click();

        // Save — use the header Save button (exact match avoids the
        // "Save brand color & tax ID" button added in the Brand Identity section).
        await page.getByRole('button', { name: 'Save', exact: true }).click();

        // Should redirect to tenant list
        await expect(page).toHaveURL(/.*tenant/, { timeout: 15000 });

        // Go back to theme settings — selections should be loaded
        await page.goto('/tenant/electroplus/theme-settings');
        await page.waitForLoadState('networkidle');

        // Verify saved selections are pre-selected (ring-2 classes)
        await expect(page.locator('.theme-teal').first()).toHaveClass(/ring-2/, { timeout: 10000 });
    });

    // ════════════════════════════════════════════════════════════
    // RESET TO DEFAULT
    // ════════════════════════════════════════════════════════════

    test('10 - Reset to Default resets selections', async ({ page }) => {
        await login(page);
        await page.goto('/tenant/electroplus/theme-settings');
        await page.waitForLoadState('networkidle');

        // Select something non-default
        await page.locator('text=Purple').click();

        // Reset
        await page.locator('button:has-text("Reset to Default")').click();

        // Default theme option pill should be selected (has ring-2)
        const defaultPill = page.locator('div.theme-default.ring-2');
        await expect(defaultPill).toBeVisible({ timeout: 5000 });
    });

    // ════════════════════════════════════════════════════════════
    // BACK NAVIGATION
    // ════════════════════════════════════════════════════════════

    test('11 - Back button returns to tenant list', async ({ page }) => {
        await login(page);
        await page.goto('/tenant/electroplus/theme-settings');
        await page.waitForLoadState('networkidle');

        await page.locator('button:has-text("Back")').first().click();
        await expect(page).toHaveURL(/.*tenant/, { timeout: 10000 });
    });

    // ════════════════════════════════════════════════════════════
    // TENANT EDIT — THEME INFO
    // ════════════════════════════════════════════════════════════

    test('12 - Tenant edit review shows theme info', async ({ page }) => {
        await login(page);
        await page.goto('/tenant/electroplus/edit');
        await page.waitForLoadState('networkidle');

        // Navigate to the Review tab (last tab)
        const reviewTab = page.locator('text=Review').first();
        await reviewTab.click();
        await page.waitForTimeout(500);

        // Theme settings card should show
        await expect(page.locator('text=Theme Settings').first()).toBeVisible({ timeout: 10000 });
        await expect(page.locator('text=Configure Theme').first()).toBeVisible();
    });

    // ════════════════════════════════════════════════════════════
    // CROSS-TENANT — DIFFERENT TENANTS HAVE OWN SETTINGS
    // ════════════════════════════════════════════════════════════

    test('13 - Different tenants have independent theme pages', async ({ page }) => {
        await login(page);

        // Visit electroplus theme settings
        await page.goto('/tenant/electroplus/theme-settings');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('text=electroplus').first()).toBeVisible({ timeout: 10000 });

        // Visit a different tenant's theme settings (compumart from Phase 2.7z seed).
        await page.goto('/tenant/compumart/theme-settings');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('text=compumart').first()).toBeVisible({ timeout: 10000 });
    });

    // ════════════════════════════════════════════════════════════
    // THEME BUTTON IN TENANT LIST
    // ════════════════════════════════════════════════════════════

    test('14 - Theme button in tenant list navigates to theme settings', async ({ page }) => {
        await login(page);
        await page.goto('/tenant');
        await page.waitForLoadState('networkidle');

        // Click the palette (theme) icon button on first tenant row
        const themeButton = page.locator('button[mattooltip="Theme Settings"]').first();
        await expect(themeButton).toBeVisible({ timeout: 10000 });
        await themeButton.click();

        // Should navigate to theme settings page
        await expect(page).toHaveURL(/.*theme-settings/, { timeout: 10000 });
        await expect(page.locator('text=Theme Settings').first()).toBeVisible();
    });
});
