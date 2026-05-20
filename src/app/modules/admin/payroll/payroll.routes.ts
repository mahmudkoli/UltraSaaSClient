import { Routes } from '@angular/router';
import { PayrollListComponent } from './payroll-list.component';
import { PayrollFormComponent } from './payroll-form.component';

export default [
    { path: '', component: PayrollListComponent },
    { path: 'generate', component: PayrollFormComponent },
] as Routes;
