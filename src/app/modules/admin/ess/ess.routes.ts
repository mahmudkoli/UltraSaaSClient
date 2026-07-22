import { Routes } from '@angular/router';

export default [
    {
        path: 'payslips',
        loadComponent: () => import('./my-payslips.component').then(m => m.MyPayslipsComponent),
    },
    {
        path: 'leave-balances',
        loadComponent: () => import('./my-leave-balances.component').then(m => m.MyLeaveBalancesComponent),
    },
    { path: '', pathMatch: 'full', redirectTo: 'payslips' },
] as Routes;
