import { Routes } from '@angular/router';
import { TimetableComponent } from './timetable.component';
import { TimetableFormComponent } from './timetable-form.component';

export default [
    { path: '', component: TimetableComponent },
    { path: 'create', component: TimetableFormComponent },
    { path: ':id/edit', component: TimetableFormComponent },
] as Routes;
