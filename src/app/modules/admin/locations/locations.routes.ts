import { Routes } from '@angular/router';

export default [
    {
        path: '',
        loadComponent: () => import('./locations-list.component').then(m => m.LocationsListComponent),
    },
    {
        path: 'create',
        loadComponent: () => import('./locations-form.component').then(m => m.LocationsFormComponent),
    },
    {
        path: 'edit/:id',
        loadComponent: () => import('./locations-form.component').then(m => m.LocationsFormComponent),
    },
] as Routes;
