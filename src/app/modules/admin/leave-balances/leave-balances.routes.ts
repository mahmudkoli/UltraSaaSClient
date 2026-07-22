import { Routes } from '@angular/router';

export default [
    {
        path: '',
        loadComponent: () => import('./leave-balances-list.component').then(m => m.LeaveBalancesListComponent),
    },
    {
        path: 'set',
        loadComponent: () => import('./leave-balances-form.component').then(m => m.LeaveBalancesFormComponent),
    },
] as Routes;
