import { Routes } from '@angular/router';

export default [
    {
        path: '',
        loadComponent: () => import('./designations-list.component').then(m => m.DesignationsListComponent),
    },
    {
        path: 'create',
        loadComponent: () => import('./designations-form.component').then(m => m.DesignationsFormComponent),
    },
    {
        path: 'edit/:id',
        loadComponent: () => import('./designations-form.component').then(m => m.DesignationsFormComponent),
    },
] as Routes;
