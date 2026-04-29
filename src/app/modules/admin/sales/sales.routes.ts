import { Routes } from '@angular/router';
import { SalesListComponent } from './sales-list.component';
import { SaleDetailComponent } from './sale-detail.component';

export default [
    { path: '', component: SalesListComponent },
    { path: ':id', component: SaleDetailComponent },
] as Routes;
