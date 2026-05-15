import { Route } from '@angular/router';
import { initialDataResolver } from 'app/app.resolvers';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { NoAuthGuard } from 'app/core/auth/guards/noAuth.guard';
import { PostLoginRedirectComponent } from 'app/core/auth/post-login-redirect.component';
import { LayoutComponent } from 'app/layout/layout.component';

// @formatter:off
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const appRoutes: Route[] = [

    // Redirect empty path — same three-branch landing as signed-in-redirect.
    {path: '', pathMatch : 'full', redirectTo: 'signed-in-redirect'},

    // Phase 2.48 — three-branch landing resolver (replaces the old static
    // redirectTo:'pos'). Root admin → /admin-dashboard, tenant Admin with
    // Dashboards.View → /dashboard (resolves in 2.49), else → /pos.
    {path: 'signed-in-redirect', component: PostLoginRedirectComponent, canActivate: [AuthGuard]},

    // Public routes — no guard, no nav chrome. Listed BEFORE the auth groups so the
    // child match resolves here first and no AuthGuard / NoAuthGuard fires for
    // unauthenticated customers opening a shared invoice link.
    {
        path: '',
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            {path: 'invoice/:token', loadChildren: () => import('app/modules/public/invoice-viewer/invoice-viewer.routes')},
        ]
    },

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
            {path: 'users', loadChildren: () => import('app/modules/admin/user/user.routes')},
            {path: 'tenant', loadChildren: () => import('app/modules/admin/tenant/tenant.routes')},
            {path: 'outlet', loadChildren: () => import('app/modules/admin/outlet/outlet.routes')},
            {path: 'branding-profiles', loadChildren: () => import('app/modules/admin/branding/branding.routes')},
            {path: 'profile', loadChildren: () => import('app/modules/admin/profile/profile.routes')},

            // POS
            {path: 'pos', loadChildren: () => import('app/modules/admin/pos/pos.routes')},
            {path: 'catalog', loadChildren: () => import('app/modules/admin/catalog/catalog.routes')},
            {path: 'sales', loadChildren: () => import('app/modules/admin/sales/sales.routes')},
            {path: 'shifts', loadChildren: () => import('app/modules/admin/shifts/shifts.routes')},
            {path: 'returns', loadChildren: () => import('app/modules/admin/returns/returns.routes')},
            {path: 'customers', loadChildren: () => import('app/modules/admin/customers/customers.routes')},
            {path: 'suppliers', loadChildren: () => import('app/modules/admin/suppliers/suppliers.routes')},
            {path: 'purchase-orders', loadChildren: () => import('app/modules/admin/purchase-orders/purchase-orders.routes')},
            {path: 'goods-receipts', loadChildren: () => import('app/modules/admin/goods-receipts/goods-receipts.routes')},
            {path: 'purchase-returns', loadChildren: () => import('app/modules/admin/purchase-returns/purchase-returns.routes')},
            {path: 'audit', loadChildren: () => import('app/modules/admin/audit/audit.routes')},
            // Phase 2.48 — platform billing surfaces.
            {path: 'admin-dashboard', loadChildren: () => import('app/modules/admin/admin-dashboard/admin-dashboard.routes')},
            {path: 'plans', loadChildren: () => import('app/modules/admin/plans/plans.routes')},
            {path: 'announcements', loadChildren: () => import('app/modules/admin/announcements/announcements.routes')},
            {path: 'subscription', loadChildren: () => import('app/modules/admin/subscription/subscription.routes')},
            {path: 'stock-transfers', loadChildren: () => import('app/modules/admin/stock-transfers/stock-transfers.routes')},
            {path: 'stock-adjustments', loadChildren: () => import('app/modules/admin/stock-adjustments/stock-adjustments.routes')},
            {path: 'stock-counts', loadChildren: () => import('app/modules/admin/stock-counts/stock-counts.routes')},
            {path: 'inventory', loadChildren: () => import('app/modules/admin/inventory/inventory.routes')},
            {path: 'batches', loadChildren: () => import('app/modules/admin/pharmacy/pharmacy.routes')},
            {path: 'prescriptions', loadChildren: () => import('app/modules/admin/pharmacy/prescriptions.routes')},
            {path: 'promotions', loadChildren: () => import('app/modules/admin/promotions/promotions.routes')},
            {path: 'reports', loadChildren: () => import('app/modules/admin/reports/reports.routes')},
        ]
    }
];
