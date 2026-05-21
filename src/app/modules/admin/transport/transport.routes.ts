import { Routes } from '@angular/router';
import { AssignmentFormComponent } from './assignment-form.component';
import { AssignmentsListComponent } from './assignments-list.component';
import { RouteFormComponent } from './route-form.component';
import { RoutesListComponent } from './routes-list.component';
import { VehicleFormComponent } from './vehicle-form.component';
import { VehiclesListComponent } from './vehicles-list.component';

export default [
    { path: '', redirectTo: 'routes', pathMatch: 'full' },
    { path: 'routes', component: RoutesListComponent },
    { path: 'routes/create', component: RouteFormComponent },
    { path: 'routes/:id/edit', component: RouteFormComponent },
    { path: 'vehicles', component: VehiclesListComponent },
    { path: 'vehicles/create', component: VehicleFormComponent },
    { path: 'vehicles/:id/edit', component: VehicleFormComponent },
    { path: 'assignments', component: AssignmentsListComponent },
    { path: 'assignments/create', component: AssignmentFormComponent },
    { path: 'assignments/:id/edit', component: AssignmentFormComponent },
] as Routes;
