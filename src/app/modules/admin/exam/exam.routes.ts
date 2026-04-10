import { Routes } from '@angular/router';
import { ExamListComponent } from './exam-list.component';
import { ExamFormComponent } from './exam-form.component';

export default [
    { path: '', component: ExamListComponent },
    { path: 'create', component: ExamFormComponent },
    { path: ':id/edit', component: ExamFormComponent }
] as Routes;
