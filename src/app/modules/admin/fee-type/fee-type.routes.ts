import { Routes } from '@angular/router';
import { FeeTypeListComponent } from './fee-type-list.component';
import { FeeTypeFormComponent } from './fee-type-form.component';

export default [
    { path: '', component: FeeTypeListComponent },
    { path: 'create', component: FeeTypeFormComponent },
    { path: ':id/edit', component: FeeTypeFormComponent }
] as Routes;
