import { Routes } from '@angular/router';

export default [
    {
        path: '',
        loadComponent: () =>
            import('./purchase-return-list.component').then(m => m.PurchaseReturnListComponent),
    },
] as Routes;
