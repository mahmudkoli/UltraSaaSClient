import { Routes } from '@angular/router';

export default [
    {
        path: '',
        loadComponent: () => import('./statutory-config.component').then(m => m.StatutoryConfigComponent),
    },
] as Routes;
