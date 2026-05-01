import { Routes } from '@angular/router';

export default [
    {
        path: '',
        loadComponent: () => import('./audit-trail-list.component').then(m => m.AuditTrailListComponent),
    },
] as Routes;
