import { Routes } from '@angular/router';
import { OutletListComponent } from './outlet-list.component';
import { OutletFormComponent } from './outlet-form.component';

export default [
    { path: '', component: OutletListComponent },
    { path: 'create', component: OutletFormComponent },
    { path: ':id', component: OutletFormComponent },
] as Routes;
