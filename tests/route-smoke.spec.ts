import { test, expect } from '@playwright/test';
import { login } from './auth.setup';

test.setTimeout(120000);

// Every authenticated admin route should load and render a real shell (not blank /
// not an error). Root admin has all permissions, so the permission guard admits all.
const ROUTES = [
    '/analytics', '/users', '/students', '/teachers',
    '/academic-years', '/classes', '/subjects', '/class-subjects', '/student-classes',
    '/attendances', '/exams', '/exam-results', '/timetable', '/grade-bands',
    '/student-academics', '/student-health', '/teacher-qualifications',
    '/fee-types', '/fee-structures', '/fee-structure-details', '/fee-invoices', '/fee-reports',
    '/sibling-discount-policy',
    '/library/books', '/library/issues',
    '/hostels', '/hostels/allocations',
    '/transport/routes', '/transport/vehicles', '/transport/assignments',
    '/events', '/announcement-archive', '/broadcast',
    '/sms-templates', '/mail-templates', '/sms-logs', '/mail-logs', '/comms-config',
    '/leaves', '/payroll', '/reports',
    '/tenant', '/institute', '/plans', '/subscription', '/admin-dashboard', '/audit-trail',
    '/profile', '/my-profile',
];

const SHELL = 'fuse-vertical-navigation, mat-toolbar, app-list-page, h2, table, mat-card, form';

test.describe('Route smoke (admin)', () => {
    for (const route of ROUTES) {
        test(`loads ${route}`, async ({ page }) => {
            await login(page);
            await page.goto(route);
            await page.waitForLoadState('networkidle');
            await expect(page).toHaveURL(new RegExp(route.replace(/\//g, '\\/')));
            await expect(page.locator(SHELL).first()).toBeVisible({ timeout: 20000 });
        });
    }
});
