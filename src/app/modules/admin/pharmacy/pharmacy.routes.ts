import { Routes } from '@angular/router';
import { verticalGuard } from 'app/core/auth/guards/vertical.guard';
import { BatchesListComponent } from './batches-list.component';

export default [
    { path: '', component: BatchesListComponent, canActivate: [verticalGuard('Pharmacy')] },
] as Routes;
