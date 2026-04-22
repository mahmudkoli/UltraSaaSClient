/* eslint-disable */
import { FuseNavigationItem } from '@fuse/components/navigation';

export const defaultNavigation: FuseNavigationItem[] = [
    {
        id: 'system-management',
        title: 'System Management',
        type: 'collapsable',
        icon: 'heroicons_outline:cog-6-tooth',
        children: [
            {
                id   : 'user-management',
                title: 'Users',
                type : 'basic',
                icon : 'heroicons_outline:users',
                link : '/users'
            },
            {
                id   : 'tenant-management',
                title: 'Tenants',
                type : 'basic',
                icon : 'heroicons_outline:building-office',
                link : '/tenant'
            },
            {
                id   : 'institute-management',
                title: 'Outlets',
                type : 'basic',
                icon : 'heroicons_outline:building-storefront',
                link : '/institute'
            }
        ]
    }
];

export const compactNavigation: FuseNavigationItem[] = [
    {
        id   : 'user-management',
        title: 'Users',
        type : 'basic',
        icon : 'heroicons_outline:users',
        link : '/users'
    },
    {
        id   : 'tenant-management',
        title: 'Tenants',
        type : 'basic',
        icon : 'heroicons_outline:building-office',
        link : '/tenant'
    },
    {
        id   : 'institute-management',
        title: 'Outlets',
        type : 'basic',
        icon : 'heroicons_outline:building-storefront',
        link : '/institute'
    }
];

export const futuristicNavigation: FuseNavigationItem[] = [
    {
        id: 'system-management',
        title: 'System Management',
        type: 'collapsable',
        icon: 'heroicons_outline:cog-6-tooth',
        children: [
            {
                id   : 'user-management',
                title: 'Users',
                type : 'basic',
                icon : 'heroicons_outline:users',
                link : '/users'
            },
            {
                id   : 'tenant-management',
                title: 'Tenants',
                type : 'basic',
                icon : 'heroicons_outline:building-office',
                link : '/tenant'
            },
            {
                id   : 'institute-management',
                title: 'Outlets',
                type : 'basic',
                icon : 'heroicons_outline:building-storefront',
                link : '/institute'
            }
        ]
    }
];

export const horizontalNavigation: FuseNavigationItem[] = [
    {
        id: 'system',
        title: 'System',
        type: 'group',
        children: [
            {
                id   : 'user-management',
                title: 'Users',
                type : 'basic',
                icon : 'heroicons_outline:users',
                link : '/users'
            },
            {
                id   : 'tenant-management',
                title: 'Tenants',
                type : 'basic',
                icon : 'heroicons_outline:building-office',
                link : '/tenant'
            },
            {
                id   : 'institute-management',
                title: 'Outlets',
                type : 'basic',
                icon : 'heroicons_outline:building-storefront',
                link : '/institute'
            }
        ]
    }
];
