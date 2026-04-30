/* eslint-disable */
import { FuseNavigationItem } from '@fuse/components/navigation';

const posNav: FuseNavigationItem[] = [
    { id: 'pos', title: 'POS Sale', type: 'basic', icon: 'heroicons_outline:shopping-cart', link: '/pos' },
    { id: 'sales', title: 'Sales', type: 'basic', icon: 'heroicons_outline:receipt-percent', link: '/sales' },
    { id: 'returns', title: 'Returns', type: 'basic', icon: 'heroicons_outline:arrow-uturn-left', link: '/returns' },
    {
        id: 'catalog', title: 'Catalog', type: 'collapsable', icon: 'heroicons_outline:squares-2x2',
        children: [
            { id: 'catalog-products', title: 'Products', type: 'basic', icon: 'heroicons_outline:cube', link: '/catalog/products' },
            { id: 'catalog-categories', title: 'Categories', type: 'basic', icon: 'heroicons_outline:tag', link: '/catalog/categories' },
            { id: 'catalog-brands', title: 'Brands', type: 'basic', icon: 'heroicons_outline:bookmark', link: '/catalog/brands' },
            { id: 'catalog-units', title: 'Units', type: 'basic', icon: 'heroicons_outline:scale', link: '/catalog/units' },
        ],
    },
    { id: 'customers', title: 'Customers', type: 'basic', icon: 'heroicons_outline:user-group', link: '/customers' },
    { id: 'promotions', title: 'Promotions', type: 'basic', icon: 'heroicons_outline:tag', link: '/promotions' },
    { id: 'suppliers', title: 'Suppliers', type: 'basic', icon: 'heroicons_outline:truck', link: '/suppliers' },
    {
        id: 'procurement', title: 'Procurement', type: 'collapsable', icon: 'heroicons_outline:archive-box',
        children: [
            { id: 'purchase-orders', title: 'Purchase Orders', type: 'basic', icon: 'heroicons_outline:document-text', link: '/purchase-orders' },
            { id: 'goods-receipts', title: 'Goods Receipts', type: 'basic', icon: 'heroicons_outline:inbox-arrow-down', link: '/goods-receipts' },
        ],
    },
    { id: 'reports', title: 'Reports', type: 'basic', icon: 'heroicons_outline:chart-bar', link: '/reports' },
];

const sysNav: FuseNavigationItem = {
    id: 'system-management',
    title: 'System',
    type: 'collapsable',
    icon: 'heroicons_outline:cog-6-tooth',
    children: [
        { id: 'user-management', title: 'Users', type: 'basic', icon: 'heroicons_outline:users', link: '/users' },
        { id: 'tenant-management', title: 'Tenants', type: 'basic', icon: 'heroicons_outline:building-office', link: '/tenant' },
        { id: 'outlet-management', title: 'Outlets', type: 'basic', icon: 'heroicons_outline:building-storefront', link: '/outlet' },
    ],
};

export const defaultNavigation: FuseNavigationItem[] = [...posNav, sysNav];

export const compactNavigation: FuseNavigationItem[] = [
    { id: 'pos', title: 'POS', type: 'basic', icon: 'heroicons_outline:shopping-cart', link: '/pos' },
    { id: 'sales', title: 'Sales', type: 'basic', icon: 'heroicons_outline:receipt-percent', link: '/sales' },
    { id: 'catalog-products', title: 'Products', type: 'basic', icon: 'heroicons_outline:cube', link: '/catalog/products' },
    { id: 'customers', title: 'Customers', type: 'basic', icon: 'heroicons_outline:user-group', link: '/customers' },
    { id: 'reports', title: 'Reports', type: 'basic', icon: 'heroicons_outline:chart-bar', link: '/reports' },
    { id: 'user-management', title: 'Users', type: 'basic', icon: 'heroicons_outline:users', link: '/users' },
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
