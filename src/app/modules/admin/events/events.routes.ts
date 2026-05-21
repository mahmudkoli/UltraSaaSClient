import { Routes } from '@angular/router';
import { EventFormComponent } from './event-form.component';
import { EventsListComponent } from './events-list.component';

export default [
    { path: '', component: EventsListComponent },
    { path: 'create', component: EventFormComponent },
    { path: ':id/edit', component: EventFormComponent },
] as Routes;
