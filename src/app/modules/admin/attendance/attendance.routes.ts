import { Routes } from '@angular/router';

export default [
    {
        path: '',
        children: [
            {
                path: '',
                loadComponent: () => import('./attendance-list.component').then(m => m.AttendanceListComponent)
            },
            {
                path: 'bulk-mark',
                loadComponent: () => import('./attendance-bulk-mark.component').then(m => m.AttendanceBulkMarkComponent)
            },
            {
                path: 'create',
                loadComponent: () => import('./attendance-form.component').then(m => m.AttendanceFormComponent)
            },
            {
                path: ':id/edit',
                loadComponent: () => import('./attendance-form.component').then(m => m.AttendanceFormComponent)
            }
        ]
    }
] as Routes;
