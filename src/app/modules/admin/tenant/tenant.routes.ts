import { Routes } from '@angular/router';

export default [
    {
        path: '',
        children: [
            {
                path: '',
                loadComponent: () => import('./tenant-list.component').then(m => m.TenantListComponent)
            },
            {
                path: 'create',
                loadComponent: () => import('./tenant-form.component').then(m => m.TenantFormComponent)
            },
            {
                path: 'create-with-institute',
                loadComponent: () => import('./tenant-with-institute-form.component').then(m => m.TenantWithInstituteFormComponent)
            },
            {
                path: 'wizard',
                loadComponent: () => import('./tenant-institute-wizard.component').then(m => m.TenantInstituteWizardComponent)
            },
            {
                path: ':id/edit',
                loadComponent: () => import('./tenant-form.component').then(m => m.TenantFormComponent)
            },
            {
                path: ':id/permissions',
                loadComponent: () => import('./tenant-permissions.component').then(m => m.TenantPermissionsComponent)
            },
            {
                path: ':id/features',
                loadComponent: () => import('./tenant-features.component').then(m => m.TenantFeaturesComponent)
            },
            {
                path: ':id/billing',
                loadComponent: () => import('./tenant-billing.component').then(m => m.TenantBillingComponent)
            },
            {
                path: ':id/usage',
                loadComponent: () => import('./tenant-usage.component').then(m => m.TenantUsageComponent)
            },
            {
                path: 'theme-settings',
                loadComponent: () => import('./tenant-theme-settings.component').then(m => m.TenantThemeSettingsComponent)
            }
        ]
    }
] as Routes; 