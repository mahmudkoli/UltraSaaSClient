import { Routes } from '@angular/router';

export default [
    {
        path: '',
        loadComponent: () => import('./departments-list.component').then(m => m.DepartmentsListComponent),
    },
    {
        path: 'create',
        loadComponent: () => import('./departments-form.component').then(m => m.DepartmentsFormComponent),
    },
    {
        path: 'edit/:id',
        loadComponent: () => import('./departments-form.component').then(m => m.DepartmentsFormComponent),
    },
] as Routes;
