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

    // Public (no-auth) routes — Phase v1-I2 fee-invoice WhatsApp share viewer
    {
        path: 'public',
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            {path: 'invoice', loadChildren: () => import('app/modules/public/invoice/public-invoice.routes')},
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
            // self-service (my-profile, profile) and open to any authenticated user.
            {path: 'example', loadChildren: () => import('app/modules/admin/example/example.routes')},
            {path: 'analytics', data: {permission: 'Permissions.Dashboard.View'}, loadChildren: () => import('app/modules/admin/analytics/analytics.routes')},
            {path: 'users', data: {permission: 'Permissions.Users.View'}, loadChildren: () => import('app/modules/admin/user/user.routes')},
            {path: 'students', data: {permission: 'Permissions.Students.View'}, loadChildren: () => import('app/modules/admin/student/student.routes')},
            {path: 'teachers', data: {permission: 'Permissions.Teachers.View'}, loadChildren: () => import('app/modules/admin/teacher/teacher.routes')},
            {path: 'leaves', data: {permission: 'Permissions.Leaves.Search'}, loadChildren: () => import('app/modules/admin/leave/leave.routes')},
            {path: 'payroll', data: {permission: 'Permissions.PayrollSlips.View'}, loadChildren: () => import('app/modules/admin/payroll/payroll.routes')},
            {path: 'reports', data: {permission: 'Permissions.Students.View'}, loadChildren: () => import('app/modules/admin/reports/reports.routes')},
            {path: 'grade-bands', data: {permission: 'Permissions.GradeBands.View'}, loadChildren: () => import('app/modules/admin/grade-bands/grade-bands.routes')},
            {path: 'sibling-discount-policy', data: {permission: 'Permissions.SiblingDiscountPolicy.View'}, loadChildren: () => import('app/modules/admin/sibling-discount-policy/sibling-discount-policy.routes')},
            {path: 'audit-trail', data: {permission: 'Permissions.AuditTrails.View'}, loadChildren: () => import('app/modules/admin/audit-trail/audit-trail.routes')},
            {path: 'announcement-archive', data: {permission: 'Permissions.Tenants.View'}, loadChildren: () => import('app/modules/admin/announcement-archive/announcement-archive.routes')},
            {path: 'sms-templates', data: {permission: 'Permissions.SMSTemplates.View'}, loadChildren: () => import('app/modules/admin/sms-templates/sms-templates.routes')},
            {path: 'mail-templates', data: {permission: 'Permissions.MailTemplates.View'}, loadChildren: () => import('app/modules/admin/mail-templates/mail-templates.routes')},
            {path: 'sms-logs', data: {permission: 'Permissions.SMSLog.Search'}, loadChildren: () => import('app/modules/admin/sms-logs/sms-logs.routes')},
            {path: 'mail-logs', data: {permission: 'Permissions.MailLog.Search'}, loadChildren: () => import('app/modules/admin/mail-logs/mail-logs.routes')},
            {path: 'comms-config', data: {permission: 'Permissions.SMSConfig.View'}, loadChildren: () => import('app/modules/admin/comms-config/comms-config.routes')},
            {path: 'library', data: {permission: 'Permissions.Books.View'}, loadChildren: () => import('app/modules/admin/library/library.routes')},
            {path: 'hostels', data: {permission: 'Permissions.Hostels.View'}, loadChildren: () => import('app/modules/admin/hostel/hostel.routes')},
            {path: 'transport', data: {permission: 'Permissions.Routes.View'}, loadChildren: () => import('app/modules/admin/transport/transport.routes')},
            {path: 'events', data: {permission: 'Permissions.Events.View'}, loadChildren: () => import('app/modules/admin/events/events.routes')},
            {path: 'timetable', data: {permission: 'Permissions.TimetableEntries.View'}, loadChildren: () => import('app/modules/admin/timetable/timetable.routes')},
            {path: 'broadcast', data: {permission: 'Permissions.Tenants.Update'}, loadChildren: () => import('app/modules/admin/broadcast/broadcast.routes')},
            {path: 'my-profile', loadChildren: () => import('app/modules/admin/my-child/my-child.routes')},
            {path: 'student-academics', data: {permission: 'Permissions.Students.View'}, loadChildren: () => import('app/modules/admin/student-academics/student-academics.routes')},
            {path: 'student-health', data: {permission: 'Permissions.Students.View'}, loadChildren: () => import('app/modules/admin/student-health/student-health.routes')},
            {path: 'teacher-qualifications', data: {permission: 'Permissions.Teachers.View'}, loadChildren: () => import('app/modules/admin/teacher-qualifications/teacher-qualifications.routes')},
            {path: 'tenant', data: {permission: 'Permissions.Tenants.View'}, loadChildren: () => import('app/modules/admin/tenant/tenant.routes')},
            {path: 'admin-dashboard', data: {permission: 'Permissions.Tenants.View'}, loadChildren: () => import('app/modules/admin/admin-dashboard/admin-dashboard.routes')},
            {path: 'plans', data: {permission: 'Permissions.Tenants.View'}, loadChildren: () => import('app/modules/admin/plans/plans.routes')},
            {path: 'subscription', data: {permission: 'Permissions.Subscription.View'}, loadChildren: () => import('app/modules/admin/my-subscription/my-subscription.routes')},
            {path: 'institute', data: {permission: 'Permissions.Institutes.View'}, loadChildren: () => import('app/modules/admin/institute/institute.routes')},
            {path: 'academic-years', data: {permission: 'Permissions.AcademicYears.View'}, loadChildren: () => import('app/modules/admin/academic-year/academic-year.routes')},
            {path: 'classes', data: {permission: 'Permissions.Classes.View'}, loadChildren: () => import('app/modules/admin/class/class.routes')},
            {path: 'subjects', data: {permission: 'Permissions.Subjects.View'}, loadChildren: () => import('app/modules/admin/subject/subject.routes')},
            {path: 'student-classes', data: {permission: 'Permissions.Students.View'}, loadChildren: () => import('app/modules/admin/student-class/student-class.routes')},
            {path: 'attendances', data: {permission: 'Permissions.Attendances.View'}, loadChildren: () => import('app/modules/admin/attendance/attendance.routes')},
            {path: 'exams', data: {permission: 'Permissions.Exams.View'}, loadChildren: () => import('app/modules/admin/exam/exam.routes')},
            {path: 'exam-results', data: {permission: 'Permissions.ExamResults.View'}, loadChildren: () => import('app/modules/admin/exam-result/exam-result.routes')},
            {path: 'fee-types', data: {permission: 'Permissions.FeeTypes.View'}, loadChildren: () => import('app/modules/admin/fee-type/fee-type.routes')},
            {path: 'fee-structures', data: {permission: 'Permissions.FeeStructures.View'}, loadChildren: () => import('app/modules/admin/fee-structure/fee-structure.routes')},
            {path: 'fee-invoices', data: {permission: 'Permissions.FeeInvoices.View'}, loadChildren: () => import('app/modules/admin/fee-invoice/fee-invoice.routes')},
            {path: 'fee-reports', data: {permission: 'Permissions.FeeInvoices.View'}, loadChildren: () => import('app/modules/admin/fee-reports/fee-reports.routes')},
            {path: 'class-subjects', data: {permission: 'Permissions.ClassSubjects.View'}, loadChildren: () => import('app/modules/admin/class-subject/class-subject.routes')},
            {path: 'fee-structure-details', data: {permission: 'Permissions.FeeStructureDetails.View'}, loadChildren: () => import('app/modules/admin/fee-structure-detail/fee-structure-detail.routes')},
            {path: 'profile', loadChildren: () => import('app/modules/admin/profile/profile.routes')},
        ]
    },

    // Phase v1 QA BUG-13 — redirect intuitive-but-wrong slugs to their canonical
    // routes so guessed/bookmarked URLs resolve instead of 404ing. The sidebar
    // already links to the correct slugs; these only catch manual URL entry.
    {path: 'student-class', pathMatch: 'full', redirectTo: 'student-classes'},
    {path: 'health-records', pathMatch: 'full', redirectTo: 'student-health'},
    {path: 'announcements', pathMatch: 'full', redirectTo: 'announcement-archive'},
    {path: 'library-books', pathMatch: 'full', redirectTo: 'library/books'},

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
