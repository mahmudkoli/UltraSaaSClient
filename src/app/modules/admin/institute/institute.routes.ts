import { Routes } from '@angular/router';

export default [
    {
        path: '',
        children: [
            {
                path: '',
                loadComponent: () => import('./institute-list.component').then(m => m.InstituteListComponent)
            },
            {
                path: 'create',
                loadComponent: () => import('./institute-form.component').then(m => m.InstituteFormComponent)
            },
            {
                path: ':id/edit',
                loadComponent: () => import('./institute-form.component').then(m => m.InstituteFormComponent)
            },
            {
                path: 'create-enhanced',
                loadComponent: () => import('./institute-form-enhanced.component').then(m => m.InstituteFormEnhancedComponent)
            },
            {
                path: ':id/edit-enhanced',
                loadComponent: () => import('./institute-form-enhanced.component').then(m => m.InstituteFormEnhancedComponent)
            },
            {
                path: ':id/branding',
                loadComponent: () => import('./institute-branding.component').then(m => m.InstituteBrandingComponent)
            },
            {
                path: ':id/capacity',
                loadComponent: () => import('./institute-capacity.component').then(m => m.InstituteCapacityComponent)
            }
        ]
    }
] as Routes; 