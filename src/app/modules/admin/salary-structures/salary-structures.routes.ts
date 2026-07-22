import { Routes } from '@angular/router';

export default [
    {
        path: '',
        loadComponent: () => import('./salary-structures-list.component').then(m => m.SalaryStructuresListComponent),
    },
    {
        path: 'create',
        loadComponent: () => import('./salary-structures-form.component').then(m => m.SalaryStructuresFormComponent),
    },
    {
        path: 'edit/:id',
        loadComponent: () => import('./salary-structures-form.component').then(m => m.SalaryStructuresFormComponent),
    },
] as Routes;
