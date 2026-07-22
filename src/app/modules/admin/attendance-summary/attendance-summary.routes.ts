import { Routes } from '@angular/router';

export default [
    {
        path: '',
        loadComponent: () => import('./attendance-summary.component').then(m => m.AttendanceSummaryComponent),
    },
] as Routes;
