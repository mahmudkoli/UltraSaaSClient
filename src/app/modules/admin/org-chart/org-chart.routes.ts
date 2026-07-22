import { Routes } from '@angular/router';

export default [
    {
        path: '',
        loadComponent: () => import('./org-chart.component').then(m => m.OrgChartComponent),
    },
] as Routes;
