/* eslint-disable */
import { FuseNavigationItem } from '@fuse/components/navigation';

// Each leaf nav entry carries the permission required to *see* it (in `meta.permission`).
// Collapsable / group entries don't need their own permission — NavigationService drops
// any group whose children all get filtered out. Admin users hold every permission so
// see the full nav unchanged.
//
// Phase 2.58 — `title` holds the transloco key. NavigationService swaps the
// key for the translated label before publishing and re-emits on lang change.

const posNav: FuseNavigationItem[] = [
    { id: 'pos', title: 'NAV.POS_SALE', type: 'basic', icon: 'heroicons_outline:shopping-cart', link: '/pos',
      meta: { permission: 'Permissions.Sales.Create' } },
    { id: 'sales', title: 'NAV.SALES', type: 'basic', icon: 'heroicons_outline:receipt-percent', link: '/sales',
      meta: { permission: 'Permissions.Sales.View' } },
    { id: 'shifts', title: 'NAV.SHIFTS', type: 'basic', icon: 'heroicons_outline:clock', link: '/shifts',
      meta: { permission: 'Permissions.Shifts.View' } },
    { id: 'returns', title: 'NAV.RETURNS', type: 'basic', icon: 'heroicons_outline:arrow-uturn-left', link: '/returns',
      meta: { permission: 'Permissions.SaleReturns.View' } },
    {
        id: 'catalog', title: 'NAV.CATALOG', type: 'collapsable', icon: 'heroicons_outline:squares-2x2',
        children: [
            { id: 'catalog-products', title: 'NAV.PRODUCTS', type: 'basic', icon: 'heroicons_outline:cube', link: '/catalog/products',
              meta: { permission: 'Permissions.Products.View' } },
            { id: 'catalog-categories', title: 'NAV.CATEGORIES', type: 'basic', icon: 'heroicons_outline:tag', link: '/catalog/categories',
              meta: { permission: 'Permissions.Categories.View' } },
            { id: 'catalog-brands', title: 'NAV.BRANDS', type: 'basic', icon: 'heroicons_outline:bookmark', link: '/catalog/brands',
              meta: { permission: 'Permissions.Brands.View' } },
            { id: 'catalog-units', title: 'NAV.UNITS', type: 'basic', icon: 'heroicons_outline:scale', link: '/catalog/units',
              meta: { permission: 'Permissions.Units.View' } },
        ],
    },
    { id: 'customers', title: 'NAV.CUSTOMERS', type: 'basic', icon: 'heroicons_outline:user-group', link: '/customers',
      meta: { permission: 'Permissions.Customers.View' } },
    { id: 'promotions', title: 'NAV.PROMOTIONS', type: 'basic', icon: 'heroicons_outline:tag', link: '/promotions',
      meta: { permission: 'Permissions.Promotions.View' } },
    { id: 'suppliers', title: 'NAV.SUPPLIERS', type: 'basic', icon: 'heroicons_outline:truck', link: '/suppliers',
      meta: { permission: 'Permissions.Suppliers.View' } },
    {
        id: 'inventory', title: 'NAV.INVENTORY', type: 'collapsable', icon: 'heroicons_outline:cube-transparent',
        children: [
            { id: 'inventory-stock', title: 'NAV.STOCK_ON_HAND', type: 'basic', icon: 'heroicons_outline:square-3-stack-3d', link: '/inventory/stock',
              meta: { permission: 'Permissions.Stocks.View' } },
            { id: 'inventory-serials', title: 'NAV.STOCK_SERIALS', type: 'basic', icon: 'heroicons_outline:qr-code', link: '/inventory/serials',
              meta: { permission: 'Permissions.StockSerials.View', businessType: 'Electronics' } },
            // Batches are stock-tracking data tied to pharmacy/generic products — same
            // shape as Stock Serials for Electronics. Vertical gate hides them on
            // tenants that don't have batch-tracked products. Moved here from the
            // standalone Pharmacy group so all stock surfaces live together.
            { id: 'inventory-batches', title: 'NAV.BATCHES', type: 'basic', icon: 'heroicons_outline:swatch', link: '/batches',
              meta: { permission: 'Permissions.Batches.View', businessType: 'Pharmacy' } },
        ],
    },
    {
        id: 'procurement', title: 'NAV.PROCUREMENT', type: 'collapsable', icon: 'heroicons_outline:archive-box',
        children: [
            { id: 'purchase-orders', title: 'NAV.PURCHASE_ORDERS', type: 'basic', icon: 'heroicons_outline:document-text', link: '/purchase-orders',
              meta: { permission: 'Permissions.PurchaseOrders.View' } },
            { id: 'goods-receipts', title: 'NAV.GOODS_RECEIPTS', type: 'basic', icon: 'heroicons_outline:inbox-arrow-down', link: '/goods-receipts',
              meta: { permission: 'Permissions.GoodsReceipts.View' } },
            { id: 'stock-transfers', title: 'NAV.STOCK_TRANSFERS', type: 'basic', icon: 'heroicons_outline:arrows-right-left', link: '/stock-transfers',
              meta: { permission: 'Permissions.StockTransfers.View' } },
            { id: 'stock-adjustments', title: 'NAV.STOCK_ADJUSTMENTS', type: 'basic', icon: 'heroicons_outline:adjustments-horizontal', link: '/stock-adjustments',
              meta: { permission: 'Permissions.StockAdjustments.View' } },
            { id: 'stock-counts', title: 'NAV.CYCLE_COUNTS', type: 'basic', icon: 'heroicons_outline:clipboard-document-check', link: '/stock-counts',
              meta: { permission: 'Permissions.StockCounts.View' } },
            { id: 'purchase-returns', title: 'NAV.PURCHASE_RETURNS', type: 'basic', icon: 'heroicons_outline:arrow-uturn-up', link: '/purchase-returns',
              meta: { permission: 'Permissions.PurchaseReturns.View' } },
        ],
    },
    // Prescriptions is a top-level entry (not inventory) — it's a clinical
    // record, not stock data. Batches moved up to Inventory; this entry no
    // longer needs a parent group.
    { id: 'prescriptions', title: 'NAV.PRESCRIPTIONS', type: 'basic', icon: 'heroicons_outline:document-check', link: '/prescriptions',
      meta: { permission: 'Permissions.Prescriptions.View', businessType: 'Pharmacy' } },
    { id: 'reports', title: 'NAV.REPORTS', type: 'basic', icon: 'heroicons_outline:chart-bar', link: '/reports',
      meta: { permission: 'Permissions.Reports.View' } },
];

const sysNav: FuseNavigationItem = {
    id: 'system-management',
    title: 'NAV.SYSTEM',
    type: 'collapsable',
    icon: 'heroicons_outline:cog-6-tooth',
    children: [
        { id: 'user-management', title: 'NAV.USERS', type: 'basic', icon: 'heroicons_outline:users', link: '/users',
          meta: { permission: 'Permissions.Users.View' } },
        { id: 'tenant-management', title: 'NAV.TENANTS', type: 'basic', icon: 'heroicons_outline:building-office', link: '/tenant',
          meta: { permission: 'Permissions.Tenants.View' } },
        { id: 'outlet-management', title: 'NAV.OUTLETS', type: 'basic', icon: 'heroicons_outline:building-storefront', link: '/outlet',
          meta: { permission: 'Permissions.Outlets.View' } },
        { id: 'branding-profiles', title: 'NAV.BRANDING_PROFILES', type: 'basic', icon: 'heroicons_outline:document-text', link: '/branding-profiles',
          meta: { permission: 'Permissions.BrandingProfiles.View' } },
        { id: 'audit-trail', title: 'NAV.AUDIT_TRAIL', type: 'basic', icon: 'heroicons_outline:clock', link: '/audit',
          meta: { permission: 'Permissions.AuditTrails.View' } },
        // Phase 2.48 platform-admin entries. Gated on Tenants.View (root-only marker).
        { id: 'platform-dashboard', title: 'NAV.PLATFORM_DASHBOARD', type: 'basic',
          icon: 'heroicons_outline:chart-pie', link: '/admin-dashboard',
          meta: { permission: 'Permissions.Tenants.View' } },
        { id: 'subscription-plans', title: 'NAV.PLANS', type: 'basic',
          icon: 'heroicons_outline:rectangle-stack', link: '/plans',
          meta: { permission: 'Permissions.Tenants.View' } },
        { id: 'announcements', title: 'NAV.ANNOUNCEMENTS', type: 'basic',
          icon: 'heroicons_outline:megaphone', link: '/announcements',
          meta: { permission: 'Permissions.Tenants.View' } },
    ],
};

// Phase 2.48 — tenant-side "My Subscription" entry. Visible only to users with
// Permissions.Subscription.View (tenant Admin role only).
const mySubscriptionNav: FuseNavigationItem = {
    id: 'my-subscription', title: 'NAV.MY_SUBSCRIPTION', type: 'basic',
    icon: 'heroicons_outline:credit-card', link: '/subscription',
    meta: { permission: 'Permissions.Subscription.View' },
};

// Phase 2.56c — tenant-side notification inbox. Sits next to My Subscription
// since it surfaces the same kind of admin/billing content. Open to every
// authenticated user (no permission gate) so cashiers can also see broadcast
// notices marked AllUsers (maintenance windows, feature releases).
const notificationsNav: FuseNavigationItem = {
    id: 'my-notifications', title: 'NAV.NOTIFICATIONS', type: 'basic',
    icon: 'heroicons_outline:bell', link: '/notifications',
};

// Phase 2.49 — tenant-side "Home" dashboard. Pinned at the top so owners
// landing from the post-login resolver have orientation. Gated by
// Permissions.Dashboards.View (tenant Admin role only; cashiers continue
// landing on /pos with no Home entry surfaced).
const homeNav: FuseNavigationItem = {
    id: 'tenant-home', title: 'NAV.HOME', type: 'basic',
    icon: 'heroicons_outline:home', link: '/dashboard',
    meta: { permission: 'Permissions.Dashboards.View' },
};

export const defaultNavigation: FuseNavigationItem[] = [homeNav, ...posNav, mySubscriptionNav, notificationsNav, sysNav];

export const compactNavigation: FuseNavigationItem[] = [
    { id: 'pos', title: 'NAV.POS_SALE', type: 'basic', icon: 'heroicons_outline:shopping-cart', link: '/pos',
      meta: { permission: 'Permissions.Sales.Create' } },
    { id: 'sales', title: 'NAV.SALES', type: 'basic', icon: 'heroicons_outline:receipt-percent', link: '/sales',
      meta: { permission: 'Permissions.Sales.View' } },
    { id: 'catalog-products', title: 'NAV.PRODUCTS', type: 'basic', icon: 'heroicons_outline:cube', link: '/catalog/products',
      meta: { permission: 'Permissions.Products.View' } },
    { id: 'customers', title: 'NAV.CUSTOMERS', type: 'basic', icon: 'heroicons_outline:user-group', link: '/customers',
      meta: { permission: 'Permissions.Customers.View' } },
    { id: 'reports', title: 'NAV.REPORTS', type: 'basic', icon: 'heroicons_outline:chart-bar', link: '/reports',
      meta: { permission: 'Permissions.Reports.View' } },
    { id: 'user-management', title: 'NAV.USERS', type: 'basic', icon: 'heroicons_outline:users', link: '/users',
      meta: { permission: 'Permissions.Users.View' } },
];

export const futuristicNavigation: FuseNavigationItem[] = [homeNav, ...posNav, mySubscriptionNav, notificationsNav, sysNav];

export const horizontalNavigation: FuseNavigationItem[] = [
    {
        id: 'pos-group',
        title: 'NAV.POS_SALE',
        type: 'group',
        children: posNav,
    },
    {
        id: 'system',
        title: 'NAV.SYSTEM',
        type: 'group',
        children: sysNav.children!,
    },
];
