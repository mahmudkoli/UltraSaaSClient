import { Routes } from '@angular/router';

export default [
    {
        path: '',
        loadComponent: () => import('./teacher-qualifications-list.component').then(m => m.TeacherQualificationsListComponent),
    },
    {
        path: 'create',
        loadComponent: () => import('./teacher-qualifications-form.component').then(m => m.TeacherQualificationsFormComponent)
    },
    {
        path: 'edit/:id',
        loadComponent: () => import('./teacher-qualifications-form.component').then(m => m.TeacherQualificationsFormComponent)
    }
] as Routes; 