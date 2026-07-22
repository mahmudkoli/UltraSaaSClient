import { Routes } from '@angular/router';

export default [
    {
        path: '',
        loadComponent: () => import('./cost-centres-list.component').then(m => m.CostCentresListComponent),
    },
    {
        path: 'create',
        loadComponent: () => import('./cost-centres-form.component').then(m => m.CostCentresFormComponent),
    },
    {
        path: 'edit/:id',
        loadComponent: () => import('./cost-centres-form.component').then(m => m.CostCentresFormComponent),
    },
] as Routes;
