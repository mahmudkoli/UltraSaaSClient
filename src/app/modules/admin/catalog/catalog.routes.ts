import { Routes } from '@angular/router';
import { ProductListComponent } from './product-list.component';
import { ProductFormComponent } from './product-form.component';
import { CategoryListComponent } from './category-list.component';
import { CategoryFormComponent } from './category-form.component';
import { BrandListComponent } from './brand-list.component';
import { BrandFormComponent } from './brand-form.component';
import { UnitListComponent } from './unit-list.component';
import { UnitFormComponent } from './unit-form.component';

export default [
    { path: '', redirectTo: 'products', pathMatch: 'full' },

    { path: 'products', component: ProductListComponent },
    { path: 'products/create', component: ProductFormComponent },
    { path: 'products/:id', component: ProductFormComponent },

    { path: 'categories', component: CategoryListComponent },
    { path: 'categories/create', component: CategoryFormComponent },
    { path: 'categories/:id', component: CategoryFormComponent },

    { path: 'brands', component: BrandListComponent },
    { path: 'brands/create', component: BrandFormComponent },
    { path: 'brands/:id', component: BrandFormComponent },

    { path: 'units', component: UnitListComponent },
    { path: 'units/create', component: UnitFormComponent },
    { path: 'units/:id', component: UnitFormComponent },
] as Routes;
