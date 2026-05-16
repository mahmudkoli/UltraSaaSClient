import { Routes } from '@angular/router';
import { AnnouncementFormComponent } from './announcement-form.component';
import { AnnouncementsComponent } from './announcements.component';

export default [
    { path: '', component: AnnouncementsComponent },
    { path: 'new', component: AnnouncementFormComponent },
] satisfies Routes;
