/* eslint-disable */
import { FuseNavigationItem } from '@fuse/components/navigation';

// MK Corex HRM navigation (develop-v3). Edu groups (Academic / Records /
// Finance / Library / Hostels / Transport) were stripped in the F0 frontend
// strip; only HR + platform (comms / system) groups remain. Items are still
// permission-filtered at runtime (NAV_PERMISSIONS + nav filter).
export const defaultNavigation: FuseNavigationItem[] = [
    {
        id   : 'my-profile',
        title: 'My Profile',
        type : 'basic',
        icon : 'heroicons_outline:user',
        link : '/profile'
    },
    {
        id   : 'analytics',
        title: 'Dashboard',
        type : 'basic',
        icon : 'heroicons_outline:chart-bar',
        link : '/analytics'
    },
    {
        id      : 'hr-management',
        title   : 'HR',
        type    : 'collapsable',
        icon    : 'heroicons_outline:briefcase',
        children: [
            { id: 'employee-management',    title: 'Employees',              type: 'basic', icon: 'heroicons_outline:identification', link: '/employees' },
            { id: 'employee-qualifications', title: 'Qualifications',        type: 'basic', icon: 'heroicons_outline:trophy',         link: '/employee-qualifications' },
            { id: 'org-chart',              title: 'Org Chart',              type: 'basic', icon: 'heroicons_outline:share',          link: '/org-chart' },
            { id: 'leaves',                 title: 'Leaves',                 type: 'basic', icon: 'heroicons_outline:calendar',       link: '/leaves' },
            { id: 'payroll',                title: 'Payroll',                type: 'basic', icon: 'heroicons_outline:banknotes',      link: '/payroll' }
        ]
    },
    {
        id      : 'communication',
        title   : 'Communication',
        type    : 'collapsable',
        icon    : 'heroicons_outline:megaphone',
        children: [
            { id: 'announcement-archive', title: 'Announcements',   type: 'basic', icon: 'heroicons_outline:megaphone',                         link: '/announcement-archive' },
            { id: 'sms-templates',        title: 'SMS Templates',   type: 'basic', icon: 'heroicons_outline:chat-bubble-bottom-center-text',    link: '/sms-templates' },
            { id: 'mail-templates',       title: 'Mail Templates',  type: 'basic', icon: 'heroicons_outline:envelope',                          link: '/mail-templates' },
            { id: 'sms-logs',             title: 'SMS Logs',        type: 'basic', icon: 'heroicons_outline:queue-list',                        link: '/sms-logs' },
            { id: 'mail-logs',            title: 'Mail Logs',       type: 'basic', icon: 'heroicons_outline:inbox-stack',                       link: '/mail-logs' },
            { id: 'comms-config',         title: 'SMS/Mail Config', type: 'basic', icon: 'heroicons_outline:adjustments-horizontal',            link: '/comms-config' }
        ]
    },
    {
        id      : 'system-management',
        title   : 'System Management',
        type    : 'collapsable',
        icon    : 'heroicons_outline:cog-6-tooth',
        children: [
            { id: 'departments',          title: 'Departments',          type: 'basic', icon: 'heroicons_outline:building-office-2',       link: '/departments' },
            { id: 'designations',         title: 'Designations',         type: 'basic', icon: 'heroicons_outline:identification',         link: '/designations' },
            { id: 'locations',            title: 'Locations',            type: 'basic', icon: 'heroicons_outline:map-pin',                 link: '/locations' },
            { id: 'cost-centres',         title: 'Cost Centres',         type: 'basic', icon: 'heroicons_outline:banknotes',               link: '/cost-centres' },
            { id: 'user-management',      title: 'User Management',      type: 'basic', icon: 'heroicons_outline:users',                    link: '/users' },
            { id: 'admin-dashboard',      title: 'Admin Dashboard',      type: 'basic', icon: 'heroicons_outline:squares-2x2',             link: '/admin-dashboard' },
            { id: 'audit-trail',          title: 'Audit Trail',          type: 'basic', icon: 'heroicons_outline:clipboard-document-list', link: '/audit-trail' },
            { id: 'tenant-management',    title: 'Tenant Management',    type: 'basic', icon: 'heroicons_outline:building-office',         link: '/tenant' },
            { id: 'institute-management', title: 'Institute Management', type: 'basic', icon: 'heroicons_outline:academic-cap',            link: '/institute' },
            { id: 'subscription-plans',   title: 'Subscription Plans',   type: 'basic', icon: 'heroicons_outline:rectangle-stack',         link: '/plans' },
            { id: 'my-subscription',      title: 'My Subscription',      type: 'basic', icon: 'heroicons_outline:credit-card',             link: '/subscription' }
        ]
    }
];

// Compact/futuristic/horizontal variants mirror the defaultNavigation group
// structure. Children are filled at runtime by api.ts via matching `id`s, so
// only the top-level group skeletons need to live here.
export const compactNavigation: FuseNavigationItem[] = [
    { id: 'my-profile',        title: 'My Profile', type: 'basic',       icon: 'heroicons_outline:user',        link: '/profile' },
    { id: 'analytics',         title: 'Dashboard',  type: 'basic',       icon: 'heroicons_outline:chart-bar',   link: '/analytics' },
    { id: 'hr-management',     title: 'HR',         type: 'collapsable', icon: 'heroicons_outline:briefcase',   children: [] },
    { id: 'communication',     title: 'Comms',      type: 'collapsable', icon: 'heroicons_outline:megaphone',   children: [] },
    { id: 'system-management', title: 'System',     type: 'collapsable', icon: 'heroicons_outline:cog-6-tooth', children: [] }
];

export const futuristicNavigation: FuseNavigationItem[] = [
    { id: 'my-profile',        title: 'My Profile',        type: 'basic',       icon: 'heroicons_outline:user',        link: '/profile' },
    { id: 'analytics',         title: 'Dashboard',         type: 'basic',       icon: 'heroicons_outline:chart-bar',   link: '/analytics' },
    { id: 'hr-management',     title: 'HR',                type: 'collapsable', icon: 'heroicons_outline:briefcase',   children: [] },
    { id: 'communication',     title: 'Communication',     type: 'collapsable', icon: 'heroicons_outline:megaphone',   children: [] },
    { id: 'system-management', title: 'System Management', type: 'collapsable', icon: 'heroicons_outline:cog-6-tooth', children: [] }
];

export const horizontalNavigation: FuseNavigationItem[] = [
    { id: 'my-profile',        title: 'My Profile', type: 'basic', icon: 'heroicons_outline:user',        link: '/profile' },
    { id: 'analytics',         title: 'Dashboard',  type: 'basic', icon: 'heroicons_outline:chart-bar',   link: '/analytics' },
    { id: 'hr-management',     title: 'HR',         type: 'group', icon: 'heroicons_outline:briefcase',   children: [] },
    { id: 'communication',     title: 'Comms',      type: 'group', icon: 'heroicons_outline:megaphone',   children: [] },
    { id: 'system-management', title: 'System',     type: 'group', icon: 'heroicons_outline:cog-6-tooth', children: [] }
];
