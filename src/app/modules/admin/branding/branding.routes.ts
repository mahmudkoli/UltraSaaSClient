import { Routes } from '@angular/router';
import { BrandingProfileListComponent } from './branding-profile-list.component';
import { BrandingProfileFormComponent } from './branding-profile-form.component';

export default [
    { path: '', component: BrandingProfileListComponent },
    { path: 'create', component: BrandingProfileFormComponent },
    { path: ':id', component: BrandingProfileFormComponent },
] as Routes;
