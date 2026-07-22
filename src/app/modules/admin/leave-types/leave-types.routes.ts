import { Routes } from '@angular/router';

export default [
    {
        path: '',
        loadComponent: () => import('./leave-types-list.component').then(m => m.LeaveTypesListComponent),
    },
    {
        path: 'create',
        loadComponent: () => import('./leave-types-form.component').then(m => m.LeaveTypesFormComponent),
    },
    {
        path: 'edit/:id',
        loadComponent: () => import('./leave-types-form.component').then(m => m.LeaveTypesFormComponent),
    },
] as Routes;
