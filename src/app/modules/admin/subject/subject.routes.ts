import { Routes } from '@angular/router';

export default [
    {
        path: '',
        children: [
            {
                path: '',
                loadComponent: () => import('./subject-list.component').then(m => m.SubjectListComponent)
            },
            {
                path: 'create',
                loadComponent: () => import('./subject-form.component').then(m => m.SubjectFormComponent)
            },
            {
                path: ':id/edit',
                loadComponent: () => import('./subject-form.component').then(m => m.SubjectFormComponent)
            }
        ]
    }
] as Routes;
