import { Routes } from '@angular/router';
import { PromotionListComponent } from './promotion-list.component';
import { PromotionFormComponent } from './promotion-form.component';

export default [
    { path: '', component: PromotionListComponent },
    { path: 'create', component: PromotionFormComponent },
    { path: ':id', component: PromotionFormComponent },
] as Routes;
