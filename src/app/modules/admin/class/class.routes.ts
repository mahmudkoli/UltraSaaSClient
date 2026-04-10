import { Routes } from '@angular/router';

export default [
    {
        path: '',
        children: [
            {
                path: '',
                loadComponent: () => import('./class-list.component').then(m => m.ClassListComponent)
            },
            {
                path: 'create',
                loadComponent: () => import('./class-form.component').then(m => m.ClassFormComponent)
            },
            {
                path: ':id/edit',
                loadComponent: () => import('./class-form.component').then(m => m.ClassFormComponent)
            }
        ]
    }
] as Routes;
