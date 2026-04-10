import { Routes } from '@angular/router';

export default [
    {
        path: '',
        children: [
            {
                path: '',
                loadComponent: () => import('./class-subject-list.component').then(m => m.ClassSubjectListComponent)
            },
            {
                path: 'create',
                loadComponent: () => import('./class-subject-form.component').then(m => m.ClassSubjectFormComponent)
            },
            {
                path: ':id/edit',
                loadComponent: () => import('./class-subject-form.component').then(m => m.ClassSubjectFormComponent)
            }
        ]
    }
] as Routes;
