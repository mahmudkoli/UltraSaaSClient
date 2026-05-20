import { Route } from '@angular/router';
import { initialDataResolver } from 'app/app.resolvers';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { NoAuthGuard } from 'app/core/auth/guards/noAuth.guard';
import { LayoutComponent } from 'app/layout/layout.component';

// @formatter:off
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const appRoutes: Route[] = [

    // Redirect empty path to '/users'
    {path: '', pathMatch : 'full', redirectTo: 'users'},

    // Redirect signed-in user to the '/users'
    //
    // After the user signs in, the sign-in page will redirect the user to the 'signed-in-redirect'
    // path. Below is another redirection for that path to redirect the user to the desired
    // location. This is a small convenience to keep all main routes together here on this file.
    {path: 'signed-in-redirect', pathMatch : 'full', redirectTo: 'users'},

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
            {path: 'unlock-session', loadChildren: () => import('app/modules/auth/unlock-session/unlock-session.routes')}
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
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            {path: 'example', loadChildren: () => import('app/modules/admin/example/example.routes')},
            {path: 'analytics', loadChildren: () => import('app/modules/admin/analytics/analytics.routes')},
            {path: 'users', loadChildren: () => import('app/modules/admin/user/user.routes')},
            {path: 'students', loadChildren: () => import('app/modules/admin/student/student.routes')},
            {path: 'teachers', loadChildren: () => import('app/modules/admin/teacher/teacher.routes')},
            {path: 'leaves', loadChildren: () => import('app/modules/admin/leave/leave.routes')},
            {path: 'payroll', loadChildren: () => import('app/modules/admin/payroll/payroll.routes')},
            {path: 'reports', loadChildren: () => import('app/modules/admin/reports/reports.routes')},
            {path: 'student-academics', loadChildren: () => import('app/modules/admin/student-academics/student-academics.routes')},
            {path: 'student-health', loadChildren: () => import('app/modules/admin/student-health/student-health.routes')},
            {path: 'teacher-qualifications', loadChildren: () => import('app/modules/admin/teacher-qualifications/teacher-qualifications.routes')},
            {path: 'tenant', loadChildren: () => import('app/modules/admin/tenant/tenant.routes')},
            {path: 'admin-dashboard', loadChildren: () => import('app/modules/admin/admin-dashboard/admin-dashboard.routes')},
            {path: 'plans', loadChildren: () => import('app/modules/admin/plans/plans.routes')},
            {path: 'subscription', loadChildren: () => import('app/modules/admin/my-subscription/my-subscription.routes')},
            {path: 'institute', loadChildren: () => import('app/modules/admin/institute/institute.routes')},
            {path: 'academic-years', loadChildren: () => import('app/modules/admin/academic-year/academic-year.routes')},
            {path: 'classes', loadChildren: () => import('app/modules/admin/class/class.routes')},
            {path: 'subjects', loadChildren: () => import('app/modules/admin/subject/subject.routes')},
            {path: 'student-classes', loadChildren: () => import('app/modules/admin/student-class/student-class.routes')},
            {path: 'attendances', loadChildren: () => import('app/modules/admin/attendance/attendance.routes')},
            {path: 'exams', loadChildren: () => import('app/modules/admin/exam/exam.routes')},
            {path: 'exam-results', loadChildren: () => import('app/modules/admin/exam-result/exam-result.routes')},
            {path: 'fee-types', loadChildren: () => import('app/modules/admin/fee-type/fee-type.routes')},
            {path: 'fee-structures', loadChildren: () => import('app/modules/admin/fee-structure/fee-structure.routes')},
            {path: 'fee-invoices', loadChildren: () => import('app/modules/admin/fee-invoice/fee-invoice.routes')},
            {path: 'fee-reports', loadChildren: () => import('app/modules/admin/fee-reports/fee-reports.routes')},
            {path: 'class-subjects', loadChildren: () => import('app/modules/admin/class-subject/class-subject.routes')},
            {path: 'fee-structure-details', loadChildren: () => import('app/modules/admin/fee-structure-detail/fee-structure-detail.routes')},
            {path: 'profile', loadChildren: () => import('app/modules/admin/profile/profile.routes')},
        ]
    }
];
