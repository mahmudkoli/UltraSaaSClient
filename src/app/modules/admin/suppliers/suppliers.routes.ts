import { Routes } from '@angular/router';
import { SupplierListComponent } from './supplier-list.component';
import { SupplierFormComponent } from './supplier-form.component';

export default [
    { path: '', component: SupplierListComponent },
    { path: 'create', component: SupplierFormComponent },
    { path: ':id', component: SupplierFormComponent },
] as Routes;
