import { Route } from '@angular/router';
import { initialDataResolver } from 'app/app.resolvers';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { NoAuthGuard } from 'app/core/auth/guards/noAuth.guard';
import { SubscriptionGuard } from 'app/core/auth/guards/subscription.guard';
import { PermissionGuard } from 'app/core/auth/guards/permission.guard';
import { LandingRedirectGuard } from 'app/core/auth/guards/landing-redirect.guard';
import { LayoutComponent } from 'app/layout/layout.component';

// @formatter:off
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const appRoutes: Route[] = [

    // Permission-aware landing for the empty path: admins → '/users',
    // students/parents (no admin permissions) → '/my-profile'. The guard
    // returns a UrlTree, so this path-less route only redirects.
    {path: '', pathMatch : 'full', canActivate: [AuthGuard, LandingRedirectGuard], children: []},

    // Redirect signed-in user after login. The sign-in page sends the user to
    // 'signed-in-redirect'; the same permission-aware guard picks the right home.
    {path: 'signed-in-redirect', pathMatch : 'full', canActivate: [AuthGuard, LandingRedirectGuard], children: []},

    // Auth routes for guests
    {
        path: '',
        canActivate: [NoAuthGuard],
        canActivateChild: [NoAuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            {path: 'confirmation-required', loadChildren: () => import('app/modules/auth/confirmation-required/confirmation-required.routes')},
            {path: 'forgot-password', loadChildren: () => import('app/modules/auth/forgot-password/forgot-password.routes')},
            {path: 'reset-password', loadChildren: () => import('app/modules/auth/reset-password/reset-password.routes')},
            {path: 'sign-in', loadChildren: () => import('app/modules/auth/sign-in/sign-in.routes')},
            {path: 'sign-up', loadChildren: () => import('app/modules/auth/sign-up/sign-up.routes')}
        ]
    },

    // Auth routes for authenticated users
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            {path: 'sign-out', loadChildren: () => import('app/modules/auth/sign-out/sign-out.routes')},
            {path: 'unlock-session', loadChildren: () => import('app/modules/auth/unlock-session/unlock-session.routes')},
            // Phase v1-J1 — lockout landing when SubscriptionGuard finds the
            // tenant is suspended. Auth-required (user must sign in to see
            // their own school's status) but NOT subscription-guarded.
            {path: 'subscription-expired', loadChildren: () => import('app/modules/subscription-expired/subscription-expired.routes')},
        ]
    },

    // Landing routes
    {
        path: '',
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            {path: 'home', loadChildren: () => import('app/modules/landing/home/home.routes')},
        ]
    },

    // Admin routes
    {
        path: '',
        canActivate: [AuthGuard, SubscriptionGuard],
        canActivateChild: [AuthGuard, SubscriptionGuard, PermissionGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            // `data.permission` mirrors `NAV_PERMISSIONS` (modules-config.ts) and the
            // BE `[MustHavePermission]` on each page. Routes without it are
            // self-service (profile) and open to any authenticated user.
            //
            // MK Corex HRM (develop-v3): Edu-only feature routes (students,
            // academic, finance, library, hostel, transport, events, timetable,
            // exams) were removed in the F0 frontend strip. HR + platform routes
            // remain. `teachers`/`teacher-qualifications` are the Employee UI
            // (renamed to `employees` in a later FE sprint).
            {path: 'analytics', data: {permission: 'Permissions.Dashboard.View'}, loadChildren: () => import('app/modules/admin/analytics/analytics.routes')},
            {path: 'users', data: {permission: 'Permissions.Users.View'}, loadChildren: () => import('app/modules/admin/user/user.routes')},
            {path: 'employees', data: {permission: 'Permissions.Employees.View'}, loadChildren: () => import('app/modules/admin/employee/employee.routes')},
            {path: 'employee-qualifications', data: {permission: 'Permissions.Employees.View'}, loadChildren: () => import('app/modules/admin/employee-qualifications/employee-qualifications.routes')},
            {path: 'org-chart', data: {permission: 'Permissions.Employees.View'}, loadChildren: () => import('app/modules/admin/org-chart/org-chart.routes')},
            {path: 'attendances', data: {permission: 'Permissions.Attendances.View'}, loadChildren: () => import('app/modules/admin/attendances/attendances.routes')},
            {path: 'leaves', data: {permission: 'Permissions.Leaves.Search'}, loadChildren: () => import('app/modules/admin/leave/leave.routes')},
            {path: 'payroll', data: {permission: 'Permissions.PayrollSlips.View'}, loadChildren: () => import('app/modules/admin/payroll/payroll.routes')},
            {path: 'departments', data: {permission: 'Permissions.Departments.View'}, loadChildren: () => import('app/modules/admin/departments/departments.routes')},
            {path: 'designations', data: {permission: 'Permissions.Designations.View'}, loadChildren: () => import('app/modules/admin/designations/designations.routes')},
            {path: 'locations', data: {permission: 'Permissions.Locations.View'}, loadChildren: () => import('app/modules/admin/locations/locations.routes')},
            {path: 'cost-centres', data: {permission: 'Permissions.CostCentres.View'}, loadChildren: () => import('app/modules/admin/cost-centres/cost-centres.routes')},
            {path: 'leave-types', data: {permission: 'Permissions.LeaveTypes.View'}, loadChildren: () => import('app/modules/admin/leave-types/leave-types.routes')},
            {path: 'audit-trail', data: {permission: 'Permissions.AuditTrails.View'}, loadChildren: () => import('app/modules/admin/audit-trail/audit-trail.routes')},
            {path: 'announcement-archive', data: {permission: 'Permissions.Tenants.View'}, loadChildren: () => import('app/modules/admin/announcement-archive/announcement-archive.routes')},
            {path: 'sms-templates', data: {permission: 'Permissions.SMSTemplates.View'}, loadChildren: () => import('app/modules/admin/sms-templates/sms-templates.routes')},
            {path: 'mail-templates', data: {permission: 'Permissions.MailTemplates.View'}, loadChildren: () => import('app/modules/admin/mail-templates/mail-templates.routes')},
            {path: 'sms-logs', data: {permission: 'Permissions.SMSLog.Search'}, loadChildren: () => import('app/modules/admin/sms-logs/sms-logs.routes')},
            {path: 'mail-logs', data: {permission: 'Permissions.MailLog.Search'}, loadChildren: () => import('app/modules/admin/mail-logs/mail-logs.routes')},
            {path: 'comms-config', data: {permission: 'Permissions.SMSConfig.View'}, loadChildren: () => import('app/modules/admin/comms-config/comms-config.routes')},
            {path: 'tenant', data: {permission: 'Permissions.Tenants.View'}, loadChildren: () => import('app/modules/admin/tenant/tenant.routes')},
            {path: 'admin-dashboard', data: {permission: 'Permissions.Tenants.View'}, loadChildren: () => import('app/modules/admin/admin-dashboard/admin-dashboard.routes')},
            {path: 'plans', data: {permission: 'Permissions.Tenants.View'}, loadChildren: () => import('app/modules/admin/plans/plans.routes')},
            {path: 'subscription', data: {permission: 'Permissions.Subscription.View'}, loadChildren: () => import('app/modules/admin/my-subscription/my-subscription.routes')},
            {path: 'institute', data: {permission: 'Permissions.Institutes.View'}, loadChildren: () => import('app/modules/admin/institute/institute.routes')},
            {path: 'profile', loadChildren: () => import('app/modules/admin/profile/profile.routes')},
        ]
    },

    // Redirect intuitive-but-wrong slugs to their canonical routes so
    // guessed/bookmarked URLs resolve instead of 404ing.
    {path: 'announcements', pathMatch: 'full', redirectTo: 'announcement-archive'},

    // Global 404 (Phase v1 QA C2) — catch-all for unknown URLs so they render a
    // friendly Not-Found page instead of hanging on the loading screen forever.
    // Unguarded on purpose: reachable whether or not the user is signed in.
    {
        path: '**',
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            {path: '', loadComponent: () => import('app/modules/not-found/not-found.component').then(m => m.NotFoundComponent)},
        ]
    }
];
