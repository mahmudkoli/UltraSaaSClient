import { Routes } from '@angular/router';
import { PlansListComponent } from './plans-list.component';
import { PlansFormComponent } from './plans-form.component';

export default [
    { path: '', component: PlansListComponent },
    { path: 'create', component: PlansFormComponent },
    { path: ':id/edit', component: PlansFormComponent },
] as Routes;
