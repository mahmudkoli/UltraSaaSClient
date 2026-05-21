import { Routes } from '@angular/router';
import { PublicInvoiceComponent } from './public-invoice.component';

export default [
    { path: ':token', component: PublicInvoiceComponent },
] as Routes;
