/* eslint-disable */
import { FuseNavigationItem } from '@fuse/components/navigation';

export const defaultNavigation: FuseNavigationItem[] = [
    {
        id   : 'my-profile',
        title: 'My Profile',
        type : 'basic',
        icon : 'heroicons_outline:user',
        link : '/my-profile'
    },
    {
        id   : 'analytics',
        title: 'Analytics Dashboard',
        type : 'basic',
        icon : 'heroicons_outline:chart-bar',
        link : '/analytics'
    },
    {
        id      : 'academic-management',
        title   : 'Academic Management',
        type    : 'collapsable',
        icon    : 'heroicons_outline:academic-cap',
        children: [
            { id: 'user-management',          title: 'User Management',  type: 'basic', icon: 'heroicons_outline:users',          link: '/users' },
            { id: 'student-management',       title: 'Students',         type: 'basic', icon: 'heroicons_outline:user-group',     link: '/students' },
            { id: 'teacher-management',       title: 'Teachers',         type: 'basic', icon: 'heroicons_outline:identification', link: '/teachers' },
            { id: 'academic-year-management', title: 'Academic Years',   type: 'basic', icon: 'heroicons_outline:calendar-days',  link: '/academic-years' },
            { id: 'class-management',         title: 'Classes',          type: 'basic', icon: 'heroicons_outline:rectangle-group', link: '/classes' },
            { id: 'subject-management',       title: 'Subjects',         type: 'basic', icon: 'heroicons_outline:book-open',      link: '/subjects' },
            { id: 'student-class-management', title: 'Student-Class',    type: 'basic', icon: 'heroicons_outline:link',           link: '/student-classes' },
            { id: 'class-subject-management', title: 'Class Subjects',   type: 'basic', icon: 'heroicons_outline:puzzle-piece',   link: '/class-subjects' },
            { id: 'grade-bands',              title: 'Grade Bands',      type: 'basic', icon: 'heroicons_outline:star',           link: '/grade-bands' }
        ]
    },
    {
        id      : 'records-management',
        title   : 'Records Management',
        type    : 'collapsable',
        icon    : 'heroicons_outline:document-text',
        children: [
            { id: 'student-academics',       title: 'Academic Records',      type: 'basic', icon: 'heroicons_outline:clipboard-document-list',  link: '/student-academics' },
            { id: 'student-health',          title: 'Health Records',        type: 'basic', icon: 'heroicons_outline:heart',                    link: '/student-health' },
            { id: 'teacher-qualifications',  title: 'Teacher Qualifications', type: 'basic', icon: 'heroicons_outline:trophy',                   link: '/teacher-qualifications' },
            { id: 'attendance-management',   title: 'Attendance',            type: 'basic', icon: 'heroicons_outline:clipboard-document-check', link: '/attendances' },
            { id: 'exam-management',         title: 'Exams',                 type: 'basic', icon: 'heroicons_outline:clipboard-document-list',  link: '/exams' },
            { id: 'exam-result-management',  title: 'Exam Results',          type: 'basic', icon: 'heroicons_outline:chart-bar-square',         link: '/exam-results' },
            { id: 'timetable',               title: 'Timetable',             type: 'basic', icon: 'heroicons_outline:table-cells',              link: '/timetable' }
        ]
    },
    {
        id      : 'hr-management',
        title   : 'HR',
        type    : 'collapsable',
        icon    : 'heroicons_outline:briefcase',
        children: [
            { id: 'leaves',  title: 'Leaves',  type: 'basic', icon: 'heroicons_outline:calendar',  link: '/leaves' },
            { id: 'payroll', title: 'Payroll', type: 'basic', icon: 'heroicons_outline:banknotes', link: '/payroll' }
        ]
    },
    {
        id      : 'finance-management',
        title   : 'Finance',
        type    : 'collapsable',
        icon    : 'heroicons_outline:currency-dollar',
        children: [
            { id: 'fee-type-management',             title: 'Fee Types',             type: 'basic', icon: 'heroicons_outline:tag',              link: '/fee-types' },
            { id: 'fee-structure-management',        title: 'Fee Structures',        type: 'basic', icon: 'heroicons_outline:table-cells',      link: '/fee-structures' },
            { id: 'fee-structure-detail-management', title: 'Fee Structure Details', type: 'basic', icon: 'heroicons_outline:list-bullet',      link: '/fee-structure-details' },
            { id: 'fee-invoice-management',          title: 'Fee Invoices',          type: 'basic', icon: 'heroicons_outline:banknotes',        link: '/fee-invoices' },
            { id: 'fee-reports',                     title: 'Fee Reports',           type: 'basic', icon: 'heroicons_outline:chart-bar-square', link: '/fee-reports' },
            { id: 'reports',                         title: 'PDF Reports',           type: 'basic', icon: 'heroicons_outline:document-text',    link: '/reports' },
            { id: 'sibling-discount-policy',         title: 'Sibling Discount',      type: 'basic', icon: 'heroicons_outline:users',            link: '/sibling-discount-policy' }
        ]
    },
    {
        id      : 'library-management',
        title   : 'Library',
        type    : 'collapsable',
        icon    : 'heroicons_outline:book-open',
        children: [
            { id: 'library-books',  title: 'Books',  type: 'basic', icon: 'heroicons_outline:book-open',                link: '/library/books' },
            { id: 'library-issues', title: 'Issues', type: 'basic', icon: 'heroicons_outline:arrow-uturn-left',         link: '/library/issues' }
        ]
    },
    {
        id      : 'hostel-management',
        title   : 'Hostels',
        type    : 'collapsable',
        icon    : 'heroicons_outline:home-modern',
        children: [
            { id: 'hostels',            title: 'Hostel Buildings', type: 'basic', icon: 'heroicons_outline:building-office-2', link: '/hostels' },
            { id: 'hostel-allocations', title: 'Allocations',      type: 'basic', icon: 'heroicons_outline:key',               link: '/hostels/allocations' }
        ]
    },
    {
        id      : 'transport-management',
        title   : 'Transport',
        type    : 'collapsable',
        icon    : 'heroicons_outline:truck',
        children: [
            { id: 'transport-routes',      title: 'Routes',      type: 'basic', icon: 'heroicons_outline:map',         link: '/transport/routes' },
            { id: 'transport-vehicles',    title: 'Vehicles',    type: 'basic', icon: 'heroicons_outline:truck',       link: '/transport/vehicles' },
            { id: 'transport-assignments', title: 'Assignments', type: 'basic', icon: 'heroicons_outline:user-group',  link: '/transport/assignments' }
        ]
    },
    {
        id      : 'communication',
        title   : 'Communication',
        type    : 'collapsable',
        icon    : 'heroicons_outline:megaphone',
        children: [
            { id: 'events',               title: 'Events',          type: 'basic', icon: 'heroicons_outline:calendar',                          link: '/events' },
            { id: 'announcement-archive', title: 'Announcements',   type: 'basic', icon: 'heroicons_outline:megaphone',                         link: '/announcement-archive' },
            { id: 'broadcast',            title: 'SMS Broadcast',   type: 'basic', icon: 'heroicons_outline:paper-airplane',                    link: '/broadcast' },
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
            { id: 'admin-dashboard',      title: 'Admin Dashboard',     type: 'basic', icon: 'heroicons_outline:squares-2x2',             link: '/admin-dashboard' },
            { id: 'audit-trail',          title: 'Audit Trail',         type: 'basic', icon: 'heroicons_outline:clipboard-document-list', link: '/audit-trail' },
            { id: 'tenant-management',    title: 'Tenant Management',   type: 'basic', icon: 'heroicons_outline:building-office',         link: '/tenant' },
            { id: 'institute-management', title: 'Institute Management', type: 'basic', icon: 'heroicons_outline:academic-cap',            link: '/institute' },
            { id: 'subscription-plans',   title: 'Subscription Plans',  type: 'basic', icon: 'heroicons_outline:rectangle-stack',         link: '/plans' },
            { id: 'my-subscription',      title: 'My Subscription',     type: 'basic', icon: 'heroicons_outline:credit-card',             link: '/subscription' }
        ]
    }
];

// Compact/futuristic/horizontal variants mirror the defaultNavigation group
// structure. Children are filled at runtime by api.ts via matching `id`s, so
// only the top-level group skeletons need to live here.
export const compactNavigation: FuseNavigationItem[] = [
    { id: 'my-profile',            title: 'My Profile',          type: 'basic',       icon: 'heroicons_outline:user',           link: '/my-profile' },
    { id: 'analytics',             title: 'Analytics',           type: 'basic',       icon: 'heroicons_outline:chart-bar',      link: '/analytics' },
    { id: 'academic-management',   title: 'Academic',            type: 'collapsable', icon: 'heroicons_outline:academic-cap',   children: [] },
    { id: 'records-management',    title: 'Records',             type: 'collapsable', icon: 'heroicons_outline:document-text',  children: [] },
    { id: 'hr-management',         title: 'HR',                  type: 'collapsable', icon: 'heroicons_outline:briefcase',      children: [] },
    { id: 'finance-management',    title: 'Finance',             type: 'collapsable', icon: 'heroicons_outline:currency-dollar', children: [] },
    { id: 'library-management',    title: 'Library',             type: 'collapsable', icon: 'heroicons_outline:book-open',      children: [] },
    { id: 'hostel-management',     title: 'Hostels',             type: 'collapsable', icon: 'heroicons_outline:home-modern',    children: [] },
    { id: 'transport-management',  title: 'Transport',           type: 'collapsable', icon: 'heroicons_outline:truck',          children: [] },
    { id: 'communication',         title: 'Communication',       type: 'collapsable', icon: 'heroicons_outline:megaphone',      children: [] },
    { id: 'system-management',     title: 'System',              type: 'collapsable', icon: 'heroicons_outline:cog-6-tooth',    children: [] }
];

export const futuristicNavigation: FuseNavigationItem[] = [
    { id: 'my-profile',            title: 'My Profile',          type: 'basic',       icon: 'heroicons_outline:user',           link: '/my-profile' },
    { id: 'analytics',             title: 'Analytics',           type: 'basic',       icon: 'heroicons_outline:chart-bar',      link: '/analytics' },
    { id: 'academic-management',   title: 'Academic Management', type: 'collapsable', icon: 'heroicons_outline:academic-cap',   children: [] },
    { id: 'records-management',    title: 'Records Management',  type: 'collapsable', icon: 'heroicons_outline:document-text',  children: [] },
    { id: 'hr-management',         title: 'HR',                  type: 'collapsable', icon: 'heroicons_outline:briefcase',      children: [] },
    { id: 'finance-management',    title: 'Finance',             type: 'collapsable', icon: 'heroicons_outline:currency-dollar', children: [] },
    { id: 'library-management',    title: 'Library',             type: 'collapsable', icon: 'heroicons_outline:book-open',      children: [] },
    { id: 'hostel-management',     title: 'Hostels',             type: 'collapsable', icon: 'heroicons_outline:home-modern',    children: [] },
    { id: 'transport-management',  title: 'Transport',           type: 'collapsable', icon: 'heroicons_outline:truck',          children: [] },
    { id: 'communication',         title: 'Communication',       type: 'collapsable', icon: 'heroicons_outline:megaphone',      children: [] },
    { id: 'system-management',     title: 'System Management',   type: 'collapsable', icon: 'heroicons_outline:cog-6-tooth',    children: [] }
];

export const horizontalNavigation: FuseNavigationItem[] = [
    { id: 'my-profile',            title: 'My Profile',          type: 'basic',       icon: 'heroicons_outline:user',           link: '/my-profile' },
    { id: 'analytics',             title: 'Analytics',           type: 'basic',       icon: 'heroicons_outline:chart-bar',      link: '/analytics' },
    { id: 'academic-management',   title: 'Academic',            type: 'group',       icon: 'heroicons_outline:academic-cap',   children: [] },
    { id: 'records-management',    title: 'Records',             type: 'group',       icon: 'heroicons_outline:document-text',  children: [] },
    { id: 'hr-management',         title: 'HR',                  type: 'group',       icon: 'heroicons_outline:briefcase',      children: [] },
    { id: 'finance-management',    title: 'Finance',             type: 'group',       icon: 'heroicons_outline:currency-dollar', children: [] },
    { id: 'library-management',    title: 'Library',             type: 'group',       icon: 'heroicons_outline:book-open',      children: [] },
    { id: 'hostel-management',     title: 'Hostels',             type: 'group',       icon: 'heroicons_outline:home-modern',    children: [] },
    { id: 'transport-management',  title: 'Transport',           type: 'group',       icon: 'heroicons_outline:truck',          children: [] },
    { id: 'communication',         title: 'Communication',       type: 'group',       icon: 'heroicons_outline:megaphone',      children: [] },
    { id: 'system-management',     title: 'System',              type: 'group',       icon: 'heroicons_outline:cog-6-tooth',    children: [] }
];
