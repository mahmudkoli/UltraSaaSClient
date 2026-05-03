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
    {path: '', pathMatch : 'full', redirectTo: 'pos'},

    // Redirect signed-in user to the '/users'
    //
    // After the user signs in, the sign-in page will redirect the user to the 'signed-in-redirect'
    // path. Below is another redirection for that path to redirect the user to the desired
    // location. This is a small convenience to keep all main routes together here on this file.
    {path: 'signed-in-redirect', pathMatch : 'full', redirectTo: 'pos'},

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
