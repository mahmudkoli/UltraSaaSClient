import { Routes } from '@angular/router';

export default [
    {
        path: '',
        loadComponent: () => import('./payroll-runs-list.component').then(m => m.PayrollRunsListComponent),
    },
    {
        path: ':id',
        loadComponent: () => import('./payroll-run-detail.component').then(m => m.PayrollRunDetailComponent),
    },
] as Routes;
