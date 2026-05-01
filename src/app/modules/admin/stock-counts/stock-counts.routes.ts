import { Routes } from '@angular/router';
import { StockCountListComponent } from './stock-count-list.component';
import { StockCountFormComponent } from './stock-count-form.component';
import { StockCountDetailComponent } from './stock-count-detail.component';

export default [
    { path: '', component: StockCountListComponent },
    { path: 'create', component: StockCountFormComponent },
    { path: ':id', component: StockCountDetailComponent },
] as Routes;
