import { Routes } from '@angular/router';
import { UserListComponent } from './user-list.component';
import { UserFormComponent } from './user-form.component';
import { RoleListComponent } from './role-list.component';
import { RoleFormComponent } from './role-form.component';
import { RolePermissionsComponent } from './role-permissions.component';

export default [
    { path: '', component: UserListComponent },
    { path: 'create', component: UserFormComponent },
    // Roles routes are registered before :id/edit so 'roles' isn't matched as a user id.
    { path: 'roles', component: RoleListComponent },
    { path: 'roles/create', component: RoleFormComponent },
    { path: 'roles/:id/edit', component: RoleFormComponent },
    { path: 'roles/:id/permissions', component: RolePermissionsComponent },
    { path: ':id/edit', component: UserFormComponent },
] as Routes;
