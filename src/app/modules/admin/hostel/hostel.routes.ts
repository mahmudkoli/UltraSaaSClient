import { Routes } from '@angular/router';
import { AllocationFormComponent } from './allocation-form.component';
import { AllocationsListComponent } from './allocations-list.component';
import { HostelFormComponent } from './hostel-form.component';
import { HostelsListComponent } from './hostels-list.component';

export default [
    { path: '', component: HostelsListComponent },
    { path: 'create', component: HostelFormComponent },
    { path: 'allocations', component: AllocationsListComponent },
    { path: 'allocations/create', component: AllocationFormComponent },
    { path: 'allocations/:id/edit', component: AllocationFormComponent },
    { path: ':id/edit', component: HostelFormComponent },
] as Routes;
