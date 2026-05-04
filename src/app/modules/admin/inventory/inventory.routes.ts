import { Routes } from '@angular/router';
import { verticalGuard } from 'app/core/auth/guards/vertical.guard';
import { StockListComponent } from './stock-list.component';
import { StockSerialListComponent } from './stock-serial-list.component';

export default [
    { path: '', redirectTo: 'stock', pathMatch: 'full' },
    { path: 'stock', component: StockListComponent },
    { path: 'serials', component: StockSerialListComponent, canActivate: [verticalGuard('Electronics')] },
] as Routes;
