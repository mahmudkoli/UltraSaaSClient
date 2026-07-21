import { Routes } from '@angular/router';
import { EmployeeListComponent } from './employee-list.component';
import { EmployeeFormComponent } from './employee-form.component';

export default [
    {
        path: '',
        component: EmployeeListComponent,
    },
    {
        path: 'create',
        component: EmployeeFormComponent,
    },
    {
        path: ':id/edit',
        component: EmployeeFormComponent,
    },
] as Routes; 