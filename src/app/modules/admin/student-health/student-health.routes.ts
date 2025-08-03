import { Routes } from '@angular/router';

export default [
    {
        path: '',
        loadComponent: () => import('./student-health-list.component').then(m => m.StudentHealthListComponent)
    },
    {
        path: 'create',
        loadComponent: () => import('./student-health-form.component').then(m => m.StudentHealthFormComponent)
    },
    {
        path: 'edit/:id',
        loadComponent: () => import('./student-health-form.component').then(m => m.StudentHealthFormComponent)
    }
] as Routes; 