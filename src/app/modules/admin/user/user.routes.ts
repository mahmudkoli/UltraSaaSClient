import { Routes } from '@angular/router';
import { UserListComponent } from './user-list.component';
import { UserFormComponent } from './user-form.component';

export default [
    {
        path: '',
        component: UserListComponent,
    },
    {
        path: 'create',
        component: UserFormComponent,
    },
    {
        path: ':id/edit',
        component: UserFormComponent,
    },
] as Routes; 