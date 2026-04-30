import { Routes } from '@angular/router';
import { StockListComponent } from './stock-list.component';
import { StockSerialListComponent } from './stock-serial-list.component';

export default [
    { path: '', redirectTo: 'stock', pathMatch: 'full' },
    { path: 'stock', component: StockListComponent },
    { path: 'serials', component: StockSerialListComponent },
] as Routes;
