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
            // NOTE: this single-segment :id route MUST stay after the literal
            // 'create'/'wizard' paths above, or it would capture them as an id.
            {
                path: ':id',
                loadComponent: () => import('./tenant-overview.component').then(m => m.TenantOverviewComponent)
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
            // Phase v1-C2.2 — /billing + /usage backends were dropped (TenantUsageDto,
            // UpdateBillingPlanRequest, etc. gone). Until the new billing UI is rebuilt
            // against /api/mysubscription + the SubscriptionPlan admin module, these
            // routes render a "coming soon" placeholder so the Tenant-Management action
            // buttons don't dead-end on a non-existent route (Phase v1 QA C3).
            {
                path: ':id/billing',
                loadComponent: () => import('./tenant-placeholder.component').then(m => m.TenantPlaceholderComponent),
                data: { title: 'Billing', icon: 'payment', message: 'Per-tenant billing is being rebuilt against the new subscription module and will be available here soon.' }
            },
            {
                path: ':id/usage',
                loadComponent: () => import('./tenant-placeholder.component').then(m => m.TenantPlaceholderComponent),
                data: { title: 'Usage', icon: 'analytics', message: 'Per-tenant usage analytics are being rebuilt and will be available here soon.' }
            },
            {
                path: ':id/theme-settings',
                loadComponent: () => import('./tenant-theme-settings.component').then(m => m.TenantThemeSettingsComponent)
            },
            {
                // Root-only per-tenant audit log (reuses the audit-trail component, which
                // reads the :id param and targets that tenant's trail).
                path: ':id/audit',
                loadComponent: () => import('../audit-trail/audit-trail.component').then(m => m.AuditTrailComponent)
            },
            {
                path: ':id/clone',
                loadComponent: () => import('./tenant-clone.component').then(m => m.TenantCloneComponent)
            }
        ]
    }
] as Routes; 