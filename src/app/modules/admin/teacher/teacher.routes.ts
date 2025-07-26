import { Routes } from '@angular/router';
import { TeacherListComponent } from './teacher-list.component';
import { TeacherFormComponent } from './teacher-form.component';

export default [
    {
        path: '',
        component: TeacherListComponent,
    },
    {
        path: 'create',
        component: TeacherFormComponent,
    },
    {
        path: ':id/edit',
        component: TeacherFormComponent,
    },
] as Routes; 