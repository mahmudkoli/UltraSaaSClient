import { Routes } from '@angular/router';
import { ExamResultListComponent } from './exam-result-list.component';
import { ExamResultFormComponent } from './exam-result-form.component';

export default [
    { path: '', component: ExamResultListComponent },
    { path: 'bulk-entry', loadComponent: () => import('./exam-result-bulk-entry.component').then(m => m.ExamResultBulkEntryComponent) },
    { path: 'create', component: ExamResultFormComponent },
    { path: ':id/edit', component: ExamResultFormComponent }
] as Routes;
