import { Routes } from '@angular/router';

export default [
    {
        path: '',
        children: [
            {
                path: '',
                loadComponent: () => import('./student-class-list.component').then(m => m.StudentClassListComponent)
            },
            {
                path: 'create',
                loadComponent: () => import('./student-class-form.component').then(m => m.StudentClassFormComponent)
            },
            {
                path: ':id/edit',
                loadComponent: () => import('./student-class-form.component').then(m => m.StudentClassFormComponent)
            }
        ]
    }
] as Routes;
