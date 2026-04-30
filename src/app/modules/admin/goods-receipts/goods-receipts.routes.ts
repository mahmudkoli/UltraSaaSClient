import { Routes } from '@angular/router';
import { GoodsReceiptListComponent } from './goods-receipt-list.component';
import { GoodsReceiptFormComponent } from './goods-receipt-form.component';
import { GoodsReceiptDetailComponent } from './goods-receipt-detail.component';

export default [
    { path: '', component: GoodsReceiptListComponent },
    { path: 'new/:poId', component: GoodsReceiptFormComponent },
    { path: ':id', component: GoodsReceiptDetailComponent },
] as Routes;
