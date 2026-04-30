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
              meta: { permission: 'Permissions.StockSerials.View' } },
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
    ],
};

export const defaultNavigation: FuseNavigationItem[] = [...posNav, sysNav];

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

export const futuristicNavigation: FuseNavigationItem[] = [...posNav, sysNav];

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
