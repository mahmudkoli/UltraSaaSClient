import { Routes } from '@angular/router';

export default [
    {
        path: '',
        loadComponent: () => import('./attendances-list.component').then(m => m.AttendancesListComponent),
    },
    {
        path: 'create',
        loadComponent: () => import('./attendances-form.component').then(m => m.AttendancesFormComponent),
    },
    {
        path: 'edit/:id',
        loadComponent: () => import('./attendances-form.component').then(m => m.AttendancesFormComponent),
    },
] as Routes;
