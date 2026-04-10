import { Routes } from '@angular/router';
import { FeeStructureListComponent } from './fee-structure-list.component';
import { FeeStructureFormComponent } from './fee-structure-form.component';

export default [
    { path: '', component: FeeStructureListComponent },
    { path: 'create', component: FeeStructureFormComponent },
    { path: ':id/edit', component: FeeStructureFormComponent }
] as Routes;
