import { Routes } from '@angular/router';
import { SalesComponent, SaleDetailComponent } from './sales.component';

export default [
    { path: '', component: SalesComponent },
    { path: ':id', component: SaleDetailComponent },
] as Routes;
