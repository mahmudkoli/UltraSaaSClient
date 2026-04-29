import { Routes } from '@angular/router';
import { CategoriesComponent } from './categories.component';
import { BrandsComponent } from './brands.component';
import { UnitsComponent } from './units.component';
import { ProductsComponent } from './products.component';

export default [
    { path: '', redirectTo: 'products', pathMatch: 'full' },
    { path: 'categories', component: CategoriesComponent },
    { path: 'brands', component: BrandsComponent },
    { path: 'units', component: UnitsComponent },
    { path: 'products', component: ProductsComponent },
] as Routes;
