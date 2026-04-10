import { Routes } from '@angular/router';
import { ExamResultListComponent } from './exam-result-list.component';
import { ExamResultFormComponent } from './exam-result-form.component';

export default [
    { path: '', component: ExamResultListComponent },
    { path: 'create', component: ExamResultFormComponent },
    { path: ':id/edit', component: ExamResultFormComponent }
] as Routes;
