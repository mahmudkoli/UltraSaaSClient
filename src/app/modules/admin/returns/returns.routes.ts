import { Routes } from '@angular/router';
import { ReturnsListComponent } from './returns-list.component';
import { ReturnFormComponent } from './return-form.component';
import { ReturnDetailComponent } from './return-detail.component';

export default [
    { path: '', component: ReturnsListComponent },
    { path: 'new/:saleId', component: ReturnFormComponent },
    { path: ':id', component: ReturnDetailComponent },
] as Routes;
