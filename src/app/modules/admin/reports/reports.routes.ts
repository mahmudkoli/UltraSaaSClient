import { Routes } from '@angular/router';

export default [
    {
        path: 'headcount',
        loadComponent: () => import('./headcount-report.component').then(m => m.HeadcountReportComponent),
    },
    { path: '', pathMatch: 'full', redirectTo: 'headcount' },
] as Routes;
