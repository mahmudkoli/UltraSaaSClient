import { Routes } from '@angular/router';

export default [
    {
        path: '',
        children: [
            {
                path: '',
                loadComponent: () => import('./fee-structure-detail-list.component').then(m => m.FeeStructureDetailListComponent)
            },
            {
                path: 'create',
                loadComponent: () => import('./fee-structure-detail-form.component').then(m => m.FeeStructureDetailFormComponent)
            },
            {
                path: ':id/edit',
                loadComponent: () => import('./fee-structure-detail-form.component').then(m => m.FeeStructureDetailFormComponent)
            }
        ]
    }
] as Routes;
