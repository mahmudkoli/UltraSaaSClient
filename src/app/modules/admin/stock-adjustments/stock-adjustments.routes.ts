import { Routes } from '@angular/router';
import { StockAdjustmentListComponent } from './stock-adjustment-list.component';
import { StockAdjustmentFormComponent } from './stock-adjustment-form.component';

export default [
    { path: '', component: StockAdjustmentListComponent },
    { path: 'create', component: StockAdjustmentFormComponent },
] as Routes;
