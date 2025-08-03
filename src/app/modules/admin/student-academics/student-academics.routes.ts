import { Routes } from '@angular/router';

export default [
    {
        path: '',
        loadComponent: () => import('./student-academics-list.component').then(m => m.StudentAcademicsListComponent),
    },
    {
        path: 'create',
        loadComponent: () => import('./student-academics-form.component').then(m => m.StudentAcademicsFormComponent)
    },
    {
        path: 'edit/:id',
        loadComponent: () => import('./student-academics-form.component').then(m => m.StudentAcademicsFormComponent)
    }
] as Routes; 