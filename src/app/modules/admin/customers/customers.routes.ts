import { Routes } from '@angular/router';
import { CustomerListComponent } from './customer-list.component';
import { CustomerFormComponent } from './customer-form.component';

export default [
    { path: '', component: CustomerListComponent },
    { path: 'create', component: CustomerFormComponent },
    { path: ':id', component: CustomerFormComponent },
] as Routes;
