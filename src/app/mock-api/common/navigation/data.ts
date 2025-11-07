/* eslint-disable */
import { FuseNavigationItem } from '@fuse/components/navigation';

export const defaultNavigation: FuseNavigationItem[] = [
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
            }
        ]
    }
];

export const compactNavigation: FuseNavigationItem[] = [
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
