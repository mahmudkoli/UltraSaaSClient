import { Routes } from '@angular/router';
import { StockTransferListComponent } from './stock-transfer-list.component';
import { StockTransferFormComponent } from './stock-transfer-form.component';
import { StockTransferDetailComponent } from './stock-transfer-detail.component';

export default [
    { path: '', component: StockTransferListComponent },
    { path: 'create', component: StockTransferFormComponent },
    { path: ':id', component: StockTransferDetailComponent },
] as Routes;
