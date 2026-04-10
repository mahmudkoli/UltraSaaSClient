import { Routes } from '@angular/router';
import { FeeInvoiceListComponent } from './fee-invoice-list.component';
import { FeeInvoiceFormComponent } from './fee-invoice-form.component';

export default [
    { path: '', component: FeeInvoiceListComponent },
    { path: 'create', component: FeeInvoiceFormComponent },
    { path: ':id/edit', component: FeeInvoiceFormComponent }
] as Routes;
