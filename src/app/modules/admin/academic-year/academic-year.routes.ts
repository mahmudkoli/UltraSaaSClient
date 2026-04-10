import { Routes } from '@angular/router';

export default [
    {
        path: '',
        children: [
            {
                path: '',
                loadComponent: () => import('./academic-year-list.component').then(m => m.AcademicYearListComponent)
            },
            {
                path: 'create',
                loadComponent: () => import('./academic-year-form.component').then(m => m.AcademicYearFormComponent)
            },
            {
                path: ':id/edit',
                loadComponent: () => import('./academic-year-form.component').then(m => m.AcademicYearFormComponent)
            }
        ]
    }
] as Routes;
