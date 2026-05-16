import { Routes } from '@angular/router';

export default [
    {
        path: '',
        loadComponent: () =>
            import('./notification-history.component').then(m => m.NotificationHistoryComponent),
    },
] as Routes;
