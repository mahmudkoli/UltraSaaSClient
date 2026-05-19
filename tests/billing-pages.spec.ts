import { expect, test } from '@playwright/test';
import { ELECTRO_EMAIL, ELECTRO_TENANT, ROOT_EMAIL, ROOT_TENANT, login } from './auth.setup';

test.setTimeout(60000);

test.describe('Tenant-side billing pages', () => {

    test('/subscription renders plan summary + payment history sections', async ({ page }) => {
        await login(page, { tenant: ELECTRO_TENANT, email: ELECTRO_EMAIL });
        await page.goto('/subscription');
        await page.waitForLoadState('networkidle');
        // MySubscriptionComponent surfaces: current plan, payment history, tenant identity.
        // Invoice list lives on a separate surface; assert what this page actually renders.
        await expect(page.locator('body')).toContainText(/My\s*Subscription|Current plan/i, { timeout: 10000 });
        await expect(page.locator('body')).toContainText(/Payment\s*history/i);
    });
});

test.describe('Platform-admin billing pages (root)', () => {

    test('/plans (subscription plans) list renders for root', async ({ page }) => {
        await login(page, { tenant: ROOT_TENANT, email: ROOT_EMAIL });
        await page.goto('/plans');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('body')).toContainText(/Plan/i);
    });

    test('/announcements list renders for root', async ({ page }) => {
        await login(page, { tenant: ROOT_TENANT, email: ROOT_EMAIL });
        await page.goto('/announcements');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('body')).toContainText(/Announcement/i);
    });

    test('/admin-dashboard renders KPI tiles for root', async ({ page }) => {
        await login(page, { tenant: ROOT_TENANT, email: ROOT_EMAIL });
        await page.goto('/admin-dashboard');
        await page.waitForLoadState('networkidle');
        // Either KPI cards or a tenants/payments-summary block — both valid
        await expect(page.locator('body')).toContainText(/Tenants|Revenue|MRR|Active/i);
    });
});
