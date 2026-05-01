import { Routes } from '@angular/router';

export default [
    {
        path: '',
        loadComponent: () =>
            import('./purchase-return-list.component').then(m => m.PurchaseReturnListComponent),
    },
    {
        path: 'from/:goodsReceiptId/new',
        loadComponent: () =>
            import('./purchase-return-form.component').then(m => m.PurchaseReturnFormComponent),
    },
    {
        path: ':id',
        loadComponent: () =>
            import('./purchase-return-detail.component').then(m => m.PurchaseReturnDetailComponent),
    },
] as Routes;
