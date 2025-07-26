import { Routes } from '@angular/router';

export default [
    {
        path: '',
        children: [
            {
                path: '',
                loadComponent: () => import('./student-list.component').then(m => m.StudentListComponent)
            },
            {
                path: 'create',
                loadComponent: () => import('./student-form.component').then(m => m.StudentFormComponent)
            },
            {
                path: ':id/edit',
                loadComponent: () => import('./student-form.component').then(m => m.StudentFormComponent)
            }
        ]
    }
] as Routes; 