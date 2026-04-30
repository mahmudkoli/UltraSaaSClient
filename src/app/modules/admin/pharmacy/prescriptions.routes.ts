import { Routes } from '@angular/router';
import { PrescriptionsListComponent } from './prescriptions-list.component';
import { PrescriptionFormComponent } from './prescription-form.component';

export default [
    { path: '', component: PrescriptionsListComponent },
    { path: 'create', component: PrescriptionFormComponent },
] as Routes;
