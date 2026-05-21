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
        id   : 'example',
        title: 'Example',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/example'
    },
    {
        id: 'academic-management',
        title: 'Academic Management',
        type: 'collapsable',
        icon: 'heroicons_outline:academic-cap',
        children: [
            {
                id   : 'user-management',
                title: 'User Management',
                type : 'basic',
                icon : 'heroicons_outline:users',
                link : '/users'
            },
            {
                id   : 'student-management',
                title: 'Student Management',
                type : 'basic',
                icon : 'heroicons_outline:user-group',
                link : '/students'
            },
            {
                id   : 'teacher-management',
                title: 'Teacher Management',
                type : 'basic',
                icon : 'heroicons_outline:identification',
                link : '/teachers'
            },
            {
                id   : 'academic-year-management',
                title: 'Academic Years',
                type : 'basic',
                icon : 'heroicons_outline:calendar-days',
                link : '/academic-years'
            },
            {
                id   : 'class-management',
                title: 'Classes',
                type : 'basic',
                icon : 'heroicons_outline:rectangle-group',
                link : '/classes'
            },
            {
                id   : 'subject-management',
                title: 'Subjects',
                type : 'basic',
                icon : 'heroicons_outline:book-open',
                link : '/subjects'
            },
            {
                id   : 'student-class-management',
                title: 'Student-Class',
                type : 'basic',
                icon : 'heroicons_outline:link',
                link : '/student-classes'
            },
            {
                id   : 'class-subject-management',
                title: 'Class Subjects',
                type : 'basic',
                icon : 'heroicons_outline:puzzle-piece',
                link : '/class-subjects'
            }
        ]
    },
    {
        id: 'records-management',
        title: 'Records Management',
        type: 'collapsable',
        icon: 'heroicons_outline:document-text',
        children: [
            {
                id   : 'student-academics',
                title: 'Academic Records',
                type : 'basic',
                icon : 'heroicons_outline:clipboard-document-list',
                link : '/student-academics'
            },
            {
                id   : 'student-health',
                title: 'Health Records',
                type : 'basic',
                icon : 'heroicons_outline:heart',
                link : '/student-health'
            },
            {
                id   : 'teacher-qualifications',
                title: 'Teacher Qualifications',
                type : 'basic',
                icon : 'heroicons_outline:trophy',
                link : '/teacher-qualifications'
            },
            {
                id   : 'attendance-management',
                title: 'Attendance',
                type : 'basic',
                icon : 'heroicons_outline:clipboard-document-check',
                link : '/attendances'
            },
            {
                id   : 'exam-management',
                title: 'Exams',
                type : 'basic',
                icon : 'heroicons_outline:clipboard-document-list',
                link : '/exams'
            },
            {
                id   : 'exam-result-management',
                title: 'Exam Results',
                type : 'basic',
                icon : 'heroicons_outline:chart-bar-square',
                link : '/exam-results'
            }
        ]
    },
    {
        id: 'finance-management',
        title: 'Finance',
        type: 'collapsable',
        icon: 'heroicons_outline:currency-dollar',
        children: [
            {
                id   : 'fee-type-management',
                title: 'Fee Types',
                type : 'basic',
                icon : 'heroicons_outline:tag',
                link : '/fee-types'
            },
            {
                id   : 'fee-structure-management',
                title: 'Fee Structures',
                type : 'basic',
                icon : 'heroicons_outline:table-cells',
                link : '/fee-structures'
            },
            {
                id   : 'fee-structure-detail-management',
                title: 'Fee Structure Details',
                type : 'basic',
                icon : 'heroicons_outline:list-bullet',
                link : '/fee-structure-details'
            },
            {
                id   : 'fee-invoice-management',
                title: 'Fee Invoices',
                type : 'basic',
                icon : 'heroicons_outline:banknotes',
                link : '/fee-invoices'
            },
            {
                id   : 'fee-reports',
                title: 'Fee Reports',
                type : 'basic',
                icon : 'heroicons_outline:chart-bar-square',
                link : '/fee-reports'
            },
            {
                id   : 'reports',
                title: 'PDF Reports',
                type : 'basic',
                icon : 'heroicons_outline:document-text',
                link : '/reports'
            }
        ]
    },
    {
        id: 'system-management',
        title: 'System Management',
        type: 'collapsable',
        icon: 'heroicons_outline:cog-6-tooth',
        children: [
            {
                id   : 'admin-dashboard',
                title: 'Admin Dashboard',
                type : 'basic',
                icon : 'heroicons_outline:squares-2x2',
                link : '/admin-dashboard'
            },
            {
                id   : 'broadcast',
                title: 'SMS Broadcast',
                type : 'basic',
                icon : 'heroicons_outline:megaphone',
                link : '/broadcast'
            },
            {
                id   : 'tenant-management',
                title: 'Tenant Management',
                type : 'basic',
                icon : 'heroicons_outline:building-office',
                link : '/tenant'
            },
            {
                id   : 'institute-management',
                title: 'Institute Management',
                type : 'basic',
                icon : 'heroicons_outline:academic-cap',
                link : '/institute'
            },
            {
                id   : 'grade-bands',
                title: 'Grade Bands',
                type : 'basic',
                icon : 'heroicons_outline:star',
                link : '/grade-bands'
            },
            {
                id   : 'sibling-discount-policy',
                title: 'Sibling Discount',
                type : 'basic',
                icon : 'heroicons_outline:users',
                link : '/sibling-discount-policy'
            },
            {
                id   : 'audit-trail',
                title: 'Audit Trail',
                type : 'basic',
                icon : 'heroicons_outline:clipboard-document-list',
                link : '/audit-trail'
            },
            {
                id   : 'announcement-archive',
                title: 'Announcements',
                type : 'basic',
                icon : 'heroicons_outline:megaphone',
                link : '/announcement-archive'
            },
            {
                id   : 'sms-templates',
                title: 'SMS Templates',
                type : 'basic',
                icon : 'heroicons_outline:chat-bubble-bottom-center-text',
                link : '/sms-templates'
            },
            {
                id   : 'mail-templates',
                title: 'Mail Templates',
                type : 'basic',
                icon : 'heroicons_outline:envelope',
                link : '/mail-templates'
            },
            {
                id   : 'sms-logs',
                title: 'SMS Logs',
                type : 'basic',
                icon : 'heroicons_outline:queue-list',
                link : '/sms-logs'
            },
            {
                id   : 'mail-logs',
                title: 'Mail Logs',
                type : 'basic',
                icon : 'heroicons_outline:inbox-stack',
                link : '/mail-logs'
            },
            {
                id   : 'comms-config',
                title: 'SMS/Mail Config',
                type : 'basic',
                icon : 'heroicons_outline:adjustments-horizontal',
                link : '/comms-config'
            },
            {
                id   : 'library',
                title: 'Library',
                type : 'basic',
                icon : 'heroicons_outline:book-open',
                link : '/library/books'
            },
            {
                id   : 'hostels',
                title: 'Hostels',
                type : 'basic',
                icon : 'heroicons_outline:home-modern',
                link : '/hostels'
            },
            {
                id   : 'transport',
                title: 'Transport',
                type : 'basic',
                icon : 'heroicons_outline:truck',
                link : '/transport/routes'
            },
            {
                id   : 'events',
                title: 'Events',
                type : 'basic',
                icon : 'heroicons_outline:calendar',
                link : '/events'
            },
            {
                id   : 'subscription-plans',
                title: 'Subscription Plans',
                type : 'basic',
                icon : 'heroicons_outline:rectangle-stack',
                link : '/plans'
            },
            {
                id   : 'my-subscription',
                title: 'My Subscription',
                type : 'basic',
                icon : 'heroicons_outline:credit-card',
                link : '/subscription'
            }
        ]
    }
];

export const compactNavigation: FuseNavigationItem[] = [
    {
        id   : 'my-profile',
        title: 'My Profile',
        type : 'basic',
        icon : 'heroicons_outline:user',
        link : '/my-profile'
    },
    {
        id   : 'analytics',
        title: 'Analytics',
        type : 'basic',
        icon : 'heroicons_outline:chart-bar',
        link : '/analytics'
    },
    {
        id   : 'example',
        title: 'Example',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/example'
    },
    {
        id   : 'user-management',
        title: 'Users',
        type : 'basic',
        icon : 'heroicons_outline:users',
        link : '/users'
    },
    {
        id   : 'student-management',
        title: 'Students',
        type : 'basic',
        icon : 'heroicons_outline:user-group',
        link : '/students'
    },
    {
        id   : 'teacher-management',
        title: 'Teachers',
        type : 'basic',
        icon : 'heroicons_outline:identification',
        link : '/teachers'
    },
    {
        id   : 'academic-year-management',
        title: 'Academic Years',
        type : 'basic',
        icon : 'heroicons_outline:calendar-days',
        link : '/academic-years'
    },
    {
        id   : 'class-management',
        title: 'Classes',
        type : 'basic',
        icon : 'heroicons_outline:rectangle-group',
        link : '/classes'
    },
    {
        id   : 'subject-management',
        title: 'Subjects',
        type : 'basic',
        icon : 'heroicons_outline:book-open',
        link : '/subjects'
    },
    {
        id   : 'student-class-management',
        title: 'Student-Class',
        type : 'basic',
        icon : 'heroicons_outline:link',
        link : '/student-classes'
    },
    {
        id   : 'class-subject-management',
        title: 'Class Subjects',
        type : 'basic',
        icon : 'heroicons_outline:puzzle-piece',
        link : '/class-subjects'
    },
    {
        id   : 'student-academics',
        title: 'Academic Records',
        type : 'basic',
        icon : 'heroicons_outline:clipboard-document-list',
        link : '/student-academics'
    },
    {
        id   : 'student-health',
        title: 'Health Records',
        type : 'basic',
        icon : 'heroicons_outline:heart',
        link : '/student-health'
    },
    {
        id   : 'teacher-qualifications',
        title: 'Qualifications',
        type : 'basic',
        icon : 'heroicons_outline:trophy',
        link : '/teacher-qualifications'
    },
    {
        id   : 'attendance-management',
        title: 'Attendance',
        type : 'basic',
        icon : 'heroicons_outline:clipboard-document-check',
        link : '/attendances'
    },
    {
        id   : 'exam-management',
        title: 'Exams',
        type : 'basic',
        icon : 'heroicons_outline:clipboard-document-list',
        link : '/exams'
    },
    {
        id   : 'exam-result-management',
        title: 'Exam Results',
        type : 'basic',
        icon : 'heroicons_outline:chart-bar-square',
        link : '/exam-results'
    },
    {
        id   : 'fee-type-management',
        title: 'Fee Types',
        type : 'basic',
        icon : 'heroicons_outline:tag',
        link : '/fee-types'
    },
    {
        id   : 'fee-structure-management',
        title: 'Fee Structures',
        type : 'basic',
        icon : 'heroicons_outline:table-cells',
        link : '/fee-structures'
    },
    {
        id   : 'fee-structure-detail-management',
        title: 'Fee Details',
        type : 'basic',
        icon : 'heroicons_outline:list-bullet',
        link : '/fee-structure-details'
    },
    {
        id   : 'fee-invoice-management',
        title: 'Fee Invoices',
        type : 'basic',
        icon : 'heroicons_outline:banknotes',
        link : '/fee-invoices'
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
        title: 'Institutes',
        type : 'basic',
        icon : 'heroicons_outline:academic-cap',
        link : '/institute'
    }
];

export const futuristicNavigation: FuseNavigationItem[] = [
    {
        id   : 'analytics',
        title: 'Analytics Dashboard',
        type : 'basic',
        icon : 'heroicons_outline:chart-bar',
        link : '/analytics'
    },
    {
        id   : 'example',
        title: 'Example',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/example'
    },
    {
        id: 'academic-management',
        title: 'Academic Management',
        type: 'collapsable',
        icon: 'heroicons_outline:academic-cap',
        children: [
            {
                id   : 'user-management',
                title: 'User Management',
                type : 'basic',
                icon : 'heroicons_outline:users',
                link : '/users'
            },
            {
                id   : 'student-management',
                title: 'Student Management',
                type : 'basic',
                icon : 'heroicons_outline:user-group',
                link : '/students'
            },
            {
                id   : 'teacher-management',
                title: 'Teacher Management',
                type : 'basic',
                icon : 'heroicons_outline:identification',
                link : '/teachers'
            },
            {
                id   : 'academic-year-management',
                title: 'Academic Years',
                type : 'basic',
                icon : 'heroicons_outline:calendar-days',
                link : '/academic-years'
            },
            {
                id   : 'class-management',
                title: 'Classes',
                type : 'basic',
                icon : 'heroicons_outline:rectangle-group',
                link : '/classes'
            },
            {
                id   : 'subject-management',
                title: 'Subjects',
                type : 'basic',
                icon : 'heroicons_outline:book-open',
                link : '/subjects'
            },
            {
                id   : 'student-class-management',
                title: 'Student-Class',
                type : 'basic',
                icon : 'heroicons_outline:link',
                link : '/student-classes'
            },
            {
                id   : 'class-subject-management',
                title: 'Class Subjects',
                type : 'basic',
                icon : 'heroicons_outline:puzzle-piece',
                link : '/class-subjects'
            }
        ]
    },
    {
        id: 'records-management',
        title: 'Records Management',
        type: 'collapsable',
        icon: 'heroicons_outline:document-text',
        children: [
            {
                id   : 'student-academics',
                title: 'Academic Records',
                type : 'basic',
                icon : 'heroicons_outline:clipboard-document-list',
                link : '/student-academics'
            },
            {
                id   : 'student-health',
                title: 'Health Records',
                type : 'basic',
                icon : 'heroicons_outline:heart',
                link : '/student-health'
            },
            {
                id   : 'teacher-qualifications',
                title: 'Teacher Qualifications',
                type : 'basic',
                icon : 'heroicons_outline:trophy',
                link : '/teacher-qualifications'
            },
            {
                id   : 'attendance-management',
                title: 'Attendance',
                type : 'basic',
                icon : 'heroicons_outline:clipboard-document-check',
                link : '/attendances'
            },
            {
                id   : 'exam-management',
                title: 'Exams',
                type : 'basic',
                icon : 'heroicons_outline:clipboard-document-list',
                link : '/exams'
            },
            {
                id   : 'exam-result-management',
                title: 'Exam Results',
                type : 'basic',
                icon : 'heroicons_outline:chart-bar-square',
                link : '/exam-results'
            }
        ]
    },
    {
        id: 'finance-management',
        title: 'Finance',
        type: 'collapsable',
        icon: 'heroicons_outline:currency-dollar',
        children: [
            {
                id   : 'fee-type-management',
                title: 'Fee Types',
                type : 'basic',
                icon : 'heroicons_outline:tag',
                link : '/fee-types'
            },
            {
                id   : 'fee-structure-management',
                title: 'Fee Structures',
                type : 'basic',
                icon : 'heroicons_outline:table-cells',
                link : '/fee-structures'
            },
            {
                id   : 'fee-structure-detail-management',
                title: 'Fee Structure Details',
                type : 'basic',
                icon : 'heroicons_outline:list-bullet',
                link : '/fee-structure-details'
            },
            {
                id   : 'fee-invoice-management',
                title: 'Fee Invoices',
                type : 'basic',
                icon : 'heroicons_outline:banknotes',
                link : '/fee-invoices'
            },
            {
                id   : 'fee-reports',
                title: 'Fee Reports',
                type : 'basic',
                icon : 'heroicons_outline:chart-bar-square',
                link : '/fee-reports'
            },
            {
                id   : 'reports',
                title: 'PDF Reports',
                type : 'basic',
                icon : 'heroicons_outline:document-text',
                link : '/reports'
            }
        ]
    },
    {
        id: 'system-management',
        title: 'System Management',
        type: 'collapsable',
        icon: 'heroicons_outline:cog-6-tooth',
        children: [
            {
                id   : 'admin-dashboard',
                title: 'Admin Dashboard',
                type : 'basic',
                icon : 'heroicons_outline:squares-2x2',
                link : '/admin-dashboard'
            },
            {
                id   : 'broadcast',
                title: 'SMS Broadcast',
                type : 'basic',
                icon : 'heroicons_outline:megaphone',
                link : '/broadcast'
            },
            {
                id   : 'tenant-management',
                title: 'Tenant Management',
                type : 'basic',
                icon : 'heroicons_outline:building-office',
                link : '/tenant'
            },
            {
                id   : 'institute-management',
                title: 'Institute Management',
                type : 'basic',
                icon : 'heroicons_outline:academic-cap',
                link : '/institute'
            },
            {
                id   : 'grade-bands',
                title: 'Grade Bands',
                type : 'basic',
                icon : 'heroicons_outline:star',
                link : '/grade-bands'
            },
            {
                id   : 'sibling-discount-policy',
                title: 'Sibling Discount',
                type : 'basic',
                icon : 'heroicons_outline:users',
                link : '/sibling-discount-policy'
            },
            {
                id   : 'audit-trail',
                title: 'Audit Trail',
                type : 'basic',
                icon : 'heroicons_outline:clipboard-document-list',
                link : '/audit-trail'
            },
            {
                id   : 'announcement-archive',
                title: 'Announcements',
                type : 'basic',
                icon : 'heroicons_outline:megaphone',
                link : '/announcement-archive'
            },
            {
                id   : 'sms-templates',
                title: 'SMS Templates',
                type : 'basic',
                icon : 'heroicons_outline:chat-bubble-bottom-center-text',
                link : '/sms-templates'
            },
            {
                id   : 'mail-templates',
                title: 'Mail Templates',
                type : 'basic',
                icon : 'heroicons_outline:envelope',
                link : '/mail-templates'
            },
            {
                id   : 'sms-logs',
                title: 'SMS Logs',
                type : 'basic',
                icon : 'heroicons_outline:queue-list',
                link : '/sms-logs'
            },
            {
                id   : 'mail-logs',
                title: 'Mail Logs',
                type : 'basic',
                icon : 'heroicons_outline:inbox-stack',
                link : '/mail-logs'
            },
            {
                id   : 'comms-config',
                title: 'SMS/Mail Config',
                type : 'basic',
                icon : 'heroicons_outline:adjustments-horizontal',
                link : '/comms-config'
            },
            {
                id   : 'library',
                title: 'Library',
                type : 'basic',
                icon : 'heroicons_outline:book-open',
                link : '/library/books'
            },
            {
                id   : 'hostels',
                title: 'Hostels',
                type : 'basic',
                icon : 'heroicons_outline:home-modern',
                link : '/hostels'
            },
            {
                id   : 'transport',
                title: 'Transport',
                type : 'basic',
                icon : 'heroicons_outline:truck',
                link : '/transport/routes'
            },
            {
                id   : 'events',
                title: 'Events',
                type : 'basic',
                icon : 'heroicons_outline:calendar',
                link : '/events'
            },
            {
                id   : 'subscription-plans',
                title: 'Subscription Plans',
                type : 'basic',
                icon : 'heroicons_outline:rectangle-stack',
                link : '/plans'
            },
            {
                id   : 'my-subscription',
                title: 'My Subscription',
                type : 'basic',
                icon : 'heroicons_outline:credit-card',
                link : '/subscription'
            }
        ]
    }
];

export const horizontalNavigation: FuseNavigationItem[] = [
    {
        id   : 'analytics',
        title: 'Analytics',
        type : 'basic',
        icon : 'heroicons_outline:chart-bar',
        link : '/analytics'
    },
    {
        id   : 'example',
        title: 'Example',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/example'
    },
    {
        id: 'management',
        title: 'Management',
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
                id   : 'student-management',
                title: 'Students',
                type : 'basic',
                icon : 'heroicons_outline:user-group',
                link : '/students'
            },
            {
                id   : 'teacher-management',
                title: 'Teachers',
                type : 'basic',
                icon : 'heroicons_outline:identification',
                link : '/teachers'
            },
            {
                id   : 'leaves',
                title: 'Leaves',
                type : 'basic',
                icon : 'heroicons_outline:calendar',
                link : '/leaves'
            },
            {
                id   : 'payroll',
                title: 'Payroll',
                type : 'basic',
                icon : 'heroicons_outline:banknotes',
                link : '/payroll'
            },
            {
                id   : 'academic-year-management',
                title: 'Academic Years',
                type : 'basic',
                icon : 'heroicons_outline:calendar-days',
                link : '/academic-years'
            },
            {
                id   : 'class-management',
                title: 'Classes',
                type : 'basic',
                icon : 'heroicons_outline:rectangle-group',
                link : '/classes'
            },
            {
                id   : 'subject-management',
                title: 'Subjects',
                type : 'basic',
                icon : 'heroicons_outline:book-open',
                link : '/subjects'
            },
            {
                id   : 'student-class-management',
                title: 'Student-Class',
                type : 'basic',
                icon : 'heroicons_outline:link',
                link : '/student-classes'
            },
            {
                id   : 'class-subject-management',
                title: 'Class Subjects',
                type : 'basic',
                icon : 'heroicons_outline:puzzle-piece',
                link : '/class-subjects'
            }
        ]
    },
    {
        id: 'records',
        title: 'Records',
        type: 'group',
        children: [
            {
                id   : 'student-academics',
                title: 'Academic Records',
                type : 'basic',
                icon : 'heroicons_outline:clipboard-document-list',
                link : '/student-academics'
            },
            {
                id   : 'student-health',
                title: 'Health Records',
                type : 'basic',
                icon : 'heroicons_outline:heart',
                link : '/student-health'
            },
            {
                id   : 'teacher-qualifications',
                title: 'Teacher Qualifications',
                type : 'basic',
                icon : 'heroicons_outline:trophy',
                link : '/teacher-qualifications'
            },
            {
                id   : 'attendance-management',
                title: 'Attendance',
                type : 'basic',
                icon : 'heroicons_outline:clipboard-document-check',
                link : '/attendances'
            },
            {
                id   : 'exam-management',
                title: 'Exams',
                type : 'basic',
                icon : 'heroicons_outline:clipboard-document-list',
                link : '/exams'
            },
            {
                id   : 'exam-result-management',
                title: 'Exam Results',
                type : 'basic',
                icon : 'heroicons_outline:chart-bar-square',
                link : '/exam-results'
            }
        ]
    },
    {
        id: 'finance',
        title: 'Finance',
        type: 'group',
        children: [
            {
                id   : 'fee-type-management',
                title: 'Fee Types',
                type : 'basic',
                icon : 'heroicons_outline:tag',
                link : '/fee-types'
            },
            {
                id   : 'fee-structure-management',
                title: 'Fee Structures',
                type : 'basic',
                icon : 'heroicons_outline:table-cells',
                link : '/fee-structures'
            },
            {
                id   : 'fee-structure-detail-management',
                title: 'Fee Structure Details',
                type : 'basic',
                icon : 'heroicons_outline:list-bullet',
                link : '/fee-structure-details'
            },
            {
                id   : 'fee-invoice-management',
                title: 'Fee Invoices',
                type : 'basic',
                icon : 'heroicons_outline:banknotes',
                link : '/fee-invoices'
            },
            {
                id   : 'fee-reports',
                title: 'Fee Reports',
                type : 'basic',
                icon : 'heroicons_outline:chart-bar-square',
                link : '/fee-reports'
            },
            {
                id   : 'reports',
                title: 'PDF Reports',
                type : 'basic',
                icon : 'heroicons_outline:document-text',
                link : '/reports'
            }
        ]
    },
    {
        id: 'system',
        title: 'System',
        type: 'group',
        children: [
            {
                id   : 'tenant-management',
                title: 'Tenants',
                type : 'basic',
                icon : 'heroicons_outline:building-office',
                link : '/tenant'
            },
            {
                id   : 'institute-management',
                title: 'Institutes',
                type : 'basic',
                icon : 'heroicons_outline:academic-cap',
                link : '/institute'
            }
        ]
    }
];
