import { Routes } from '@angular/router';
import { PurchaseOrderListComponent } from './purchase-order-list.component';
import { PurchaseOrderFormComponent } from './purchase-order-form.component';
import { PurchaseOrderDetailComponent } from './purchase-order-detail.component';

export default [
    { path: '', component: PurchaseOrderListComponent },
    { path: 'create', component: PurchaseOrderFormComponent },
    { path: ':id', component: PurchaseOrderDetailComponent },
] as Routes;
