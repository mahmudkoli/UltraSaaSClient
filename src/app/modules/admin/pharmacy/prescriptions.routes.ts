import { Routes } from '@angular/router';
import { verticalGuard } from 'app/core/auth/guards/vertical.guard';
import { PrescriptionsListComponent } from './prescriptions-list.component';
import { PrescriptionFormComponent } from './prescription-form.component';
import { PrescriptionDetailComponent } from './prescription-detail.component';

export default [
    { path: '', component: PrescriptionsListComponent, canActivate: [verticalGuard('Pharmacy')] },
    { path: 'create', component: PrescriptionFormComponent, canActivate: [verticalGuard('Pharmacy')] },
    { path: ':id', component: PrescriptionDetailComponent, canActivate: [verticalGuard('Pharmacy')] },
] as Routes;
