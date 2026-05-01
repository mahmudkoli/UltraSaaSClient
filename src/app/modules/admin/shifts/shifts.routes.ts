import { Routes } from '@angular/router';
import { ShiftListComponent } from './shift-list.component';

export default [
    { path: '', component: ShiftListComponent },
    {
        path: ':id/report',
        loadComponent: () => import('./shift-report.component').then(m => m.ShiftReportComponent),
    },
] as Routes;
