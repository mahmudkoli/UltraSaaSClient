import { Routes } from '@angular/router';
import { LeaveListComponent } from './leave-list.component';
import { LeaveFormComponent } from './leave-form.component';

export default [
    { path: '', component: LeaveListComponent },
    { path: 'apply', component: LeaveFormComponent },
] as Routes;
