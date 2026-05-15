/* eslint-disable */
import { FuseNavigationItem } from '@fuse/components/navigation';

// Each leaf nav entry carries the permission required to *see* it (in `meta.permission`).
// Collapsable / group entries don't need their own permission — NavigationService drops
// any group whose children all get filtered out. Admin users hold every permission so
// see the full nav unchanged.

const posNav: FuseNavigationItem[] = [
    { id: 'pos', title: 'POS Sale', type: 'basic', icon: 'heroicons_outline:shopping-cart', link: '/pos',
      meta: { permission: 'Permissions.Sales.Create' } },
    { id: 'sales', title: 'Sales', type: 'basic', icon: 'heroicons_outline:receipt-percent', link: '/sales',
      meta: { permission: 'Permissions.Sales.View' } },
    { id: 'shifts', title: 'Shifts', type: 'basic', icon: 'heroicons_outline:clock', link: '/shifts',
      meta: { permission: 'Permissions.Shifts.View' } },
    { id: 'returns', title: 'Returns', type: 'basic', icon: 'heroicons_outline:arrow-uturn-left', link: '/returns',
      meta: { permission: 'Permissions.SaleReturns.View' } },
    {
        id: 'catalog', title: 'Catalog', type: 'collapsable', icon: 'heroicons_outline:squares-2x2',
        children: [
            { id: 'catalog-products', title: 'Products', type: 'basic', icon: 'heroicons_outline:cube', link: '/catalog/products',
              meta: { permission: 'Permissions.Products.View' } },
            { id: 'catalog-categories', title: 'Categories', type: 'basic', icon: 'heroicons_outline:tag', link: '/catalog/categories',
              meta: { permission: 'Permissions.Categories.View' } },
            { id: 'catalog-brands', title: 'Brands', type: 'basic', icon: 'heroicons_outline:bookmark', link: '/catalog/brands',
              meta: { permission: 'Permissions.Brands.View' } },
            { id: 'catalog-units', title: 'Units', type: 'basic', icon: 'heroicons_outline:scale', link: '/catalog/units',
              meta: { permission: 'Permissions.Units.View' } },
        ],
    },
    { id: 'customers', title: 'Customers', type: 'basic', icon: 'heroicons_outline:user-group', link: '/customers',
      meta: { permission: 'Permissions.Customers.View' } },
    { id: 'promotions', title: 'Promotions', type: 'basic', icon: 'heroicons_outline:tag', link: '/promotions',
      meta: { permission: 'Permissions.Promotions.View' } },
    { id: 'suppliers', title: 'Suppliers', type: 'basic', icon: 'heroicons_outline:truck', link: '/suppliers',
      meta: { permission: 'Permissions.Suppliers.View' } },
    {
        id: 'inventory', title: 'Inventory', type: 'collapsable', icon: 'heroicons_outline:cube-transparent',
        children: [
            { id: 'inventory-stock', title: 'Stock On Hand', type: 'basic', icon: 'heroicons_outline:square-3-stack-3d', link: '/inventory/stock',
              meta: { permission: 'Permissions.Stocks.View' } },
            { id: 'inventory-serials', title: 'Stock Serials', type: 'basic', icon: 'heroicons_outline:qr-code', link: '/inventory/serials',
              meta: { permission: 'Permissions.StockSerials.View', businessType: 'Electronics' } },
        ],
    },
    {
        id: 'procurement', title: 'Procurement', type: 'collapsable', icon: 'heroicons_outline:archive-box',
        children: [
            { id: 'purchase-orders', title: 'Purchase Orders', type: 'basic', icon: 'heroicons_outline:document-text', link: '/purchase-orders',
              meta: { permission: 'Permissions.PurchaseOrders.View' } },
            { id: 'goods-receipts', title: 'Goods Receipts', type: 'basic', icon: 'heroicons_outline:inbox-arrow-down', link: '/goods-receipts',
              meta: { permission: 'Permissions.GoodsReceipts.View' } },
            { id: 'stock-transfers', title: 'Stock Transfers', type: 'basic', icon: 'heroicons_outline:arrows-right-left', link: '/stock-transfers',
              meta: { permission: 'Permissions.StockTransfers.View' } },
            { id: 'stock-adjustments', title: 'Stock Adjustments', type: 'basic', icon: 'heroicons_outline:adjustments-horizontal', link: '/stock-adjustments',
              meta: { permission: 'Permissions.StockAdjustments.View' } },
            { id: 'stock-counts', title: 'Cycle Counts', type: 'basic', icon: 'heroicons_outline:clipboard-document-check', link: '/stock-counts',
              meta: { permission: 'Permissions.StockCounts.View' } },
            { id: 'purchase-returns', title: 'Purchase Returns', type: 'basic', icon: 'heroicons_outline:arrow-uturn-up', link: '/purchase-returns',
              meta: { permission: 'Permissions.PurchaseReturns.View' } },
        ],
    },
    {
        id: 'pharmacy', title: 'Pharmacy', type: 'collapsable', icon: 'heroicons_outline:beaker',
        meta: { businessType: 'Pharmacy' },
        children: [
            { id: 'pharmacy-batches', title: 'Batches', type: 'basic', icon: 'heroicons_outline:swatch', link: '/batches',
              meta: { permission: 'Permissions.Batches.View' } },
            { id: 'pharmacy-prescriptions', title: 'Prescriptions', type: 'basic', icon: 'heroicons_outline:document-check', link: '/prescriptions',
              meta: { permission: 'Permissions.Prescriptions.View' } },
        ],
    },
    { id: 'reports', title: 'Reports', type: 'basic', icon: 'heroicons_outline:chart-bar', link: '/reports',
      meta: { permission: 'Permissions.Reports.View' } },
];

const sysNav: FuseNavigationItem = {
    id: 'system-management',
    title: 'System',
    type: 'collapsable',
    icon: 'heroicons_outline:cog-6-tooth',
    children: [
        { id: 'user-management', title: 'Users', type: 'basic', icon: 'heroicons_outline:users', link: '/users',
          meta: { permission: 'Permissions.Users.View' } },
        { id: 'tenant-management', title: 'Tenants', type: 'basic', icon: 'heroicons_outline:building-office', link: '/tenant',
          meta: { permission: 'Permissions.Tenants.View' } },
        { id: 'outlet-management', title: 'Outlets', type: 'basic', icon: 'heroicons_outline:building-storefront', link: '/outlet',
          meta: { permission: 'Permissions.Outlets.View' } },
        { id: 'branding-profiles', title: 'Branding Profiles', type: 'basic', icon: 'heroicons_outline:document-text', link: '/branding-profiles',
          meta: { permission: 'Permissions.BrandingProfiles.View' } },
        { id: 'audit-trail', title: 'Audit Trail', type: 'basic', icon: 'heroicons_outline:clock', link: '/audit',
          meta: { permission: 'Permissions.AuditTrails.View' } },
        // Phase 2.48 platform-admin entries. Gated on Tenants.View (root-only marker).
        { id: 'platform-dashboard', title: 'Platform Dashboard', type: 'basic',
          icon: 'heroicons_outline:chart-pie', link: '/admin-dashboard',
          meta: { permission: 'Permissions.Tenants.View' } },
        { id: 'subscription-plans', title: 'Plans', type: 'basic',
          icon: 'heroicons_outline:rectangle-stack', link: '/plans',
          meta: { permission: 'Permissions.Tenants.View' } },
        { id: 'announcements', title: 'Announcements', type: 'basic',
          icon: 'heroicons_outline:megaphone', link: '/announcements',
          meta: { permission: 'Permissions.Tenants.View' } },
    ],
};

// Phase 2.48 — tenant-side "My Subscription" entry. Visible only to users with
// Permissions.Subscription.View (tenant Admin role only).
const mySubscriptionNav: FuseNavigationItem = {
    id: 'my-subscription', title: 'My Subscription', type: 'basic',
    icon: 'heroicons_outline:credit-card', link: '/subscription',
    meta: { permission: 'Permissions.Subscription.View' },
};

// Phase 2.49 — tenant-side "Home" dashboard. Pinned at the top so owners
// landing from the post-login resolver have orientation. Gated by
// Permissions.Dashboards.View (tenant Admin role only; cashiers continue
// landing on /pos with no Home entry surfaced).
const homeNav: FuseNavigationItem = {
    id: 'tenant-home', title: 'Home', type: 'basic',
    icon: 'heroicons_outline:home', link: '/dashboard',
    meta: { permission: 'Permissions.Dashboards.View' },
};

export const defaultNavigation: FuseNavigationItem[] = [homeNav, ...posNav, mySubscriptionNav, sysNav];

export const compactNavigation: FuseNavigationItem[] = [
    { id: 'pos', title: 'POS', type: 'basic', icon: 'heroicons_outline:shopping-cart', link: '/pos',
      meta: { permission: 'Permissions.Sales.Create' } },
    { id: 'sales', title: 'Sales', type: 'basic', icon: 'heroicons_outline:receipt-percent', link: '/sales',
      meta: { permission: 'Permissions.Sales.View' } },
    { id: 'catalog-products', title: 'Products', type: 'basic', icon: 'heroicons_outline:cube', link: '/catalog/products',
      meta: { permission: 'Permissions.Products.View' } },
    { id: 'customers', title: 'Customers', type: 'basic', icon: 'heroicons_outline:user-group', link: '/customers',
      meta: { permission: 'Permissions.Customers.View' } },
    { id: 'reports', title: 'Reports', type: 'basic', icon: 'heroicons_outline:chart-bar', link: '/reports',
      meta: { permission: 'Permissions.Reports.View' } },
    { id: 'user-management', title: 'Users', type: 'basic', icon: 'heroicons_outline:users', link: '/users',
      meta: { permission: 'Permissions.Users.View' } },
];

export const futuristicNavigation: FuseNavigationItem[] = [homeNav, ...posNav, mySubscriptionNav, sysNav];

export const horizontalNavigation: FuseNavigationItem[] = [
    {
        id: 'pos-group',
        title: 'POS',
        type: 'group',
        children: posNav,
    },
    {
        id: 'system',
        title: 'System',
        type: 'group',
        children: sysNav.children!,
    },
];
