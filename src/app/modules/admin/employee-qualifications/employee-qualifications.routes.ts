import { Routes } from '@angular/router';

export default [
    {
        path: '',
        loadComponent: () => import('./employee-qualifications-list.component').then(m => m.EmployeeQualificationsListComponent),
    },
    {
        path: 'create',
        loadComponent: () => import('./employee-qualifications-form.component').then(m => m.EmployeeQualificationsFormComponent)
    },
    {
        path: 'edit/:id',
        loadComponent: () => import('./employee-qualifications-form.component').then(m => m.EmployeeQualificationsFormComponent)
    }
] as Routes; 