import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslocoModule } from '@ngneat/transloco';
import { BrandsService, CategoriesService, ProductsService, UnitsService } from 'app/core/catalog/catalog.service';
import { BrandDto, CategoryDto, UnitDto } from 'app/core/catalog/catalog.types';

@Component({
    selector: 'app-product-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatCheckboxModule, MatDatepickerModule, MatNativeDateModule, TranslocoModule],
    template: `
<div class="flex flex-col flex-auto min-w-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 relative">
    <div class="absolute inset-0 opacity-5 dark:opacity-10"><div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, rgba(0,0,0,0.1) 1px, transparent 0); background-size: 20px 20px;"></div></div>
    <div class="relative z-10 flex flex-col flex-auto min-w-0">
        <div class="flex flex-col sm:flex-row space-y-16 sm:space-y-0 flex-0 sm:items-center sm:justify-between p-2 sm:py-3 sm:px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
            <div class="flex items-center space-x-4">
                <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-violet-500 to-indigo-600 rounded-xl shadow-lg"><mat-icon class="text-white">{{ id ? 'edit' : 'add_box' }}</mat-icon></div>
                <div>
                    <h2 class="text-3xl font-bold tracking-tight leading-7 sm:leading-10 truncate bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">{{ (id ? 'CATALOG.PRODUCTS.FORM.TITLE_EDIT' : 'CATALOG.PRODUCTS.FORM.TITLE_NEW') | transloco }}</h2>
                    <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">{{ (id ? 'CATALOG.PRODUCTS.FORM.SUBTITLE_EDIT' : 'CATALOG.PRODUCTS.FORM.SUBTITLE_NEW') | transloco }}</p>
                </div>
            </div>
            <div class="flex flex-col w-full sm:w-auto sm:flex-row space-y-16 sm:space-y-0 flex-1 sm:flex-none sm:items-center sm:justify-end gap-4">
                <button mat-stroked-button class="h-12 px-6 rounded-lg" routerLink="/catalog/products"><mat-icon class="icon-size-5 mr-2">arrow_back</mat-icon><span>{{ 'COMMON.CANCEL' | transloco }}</span></button>
            </div>
        </div>
        <div class="flex-auto p-4 sm:p-6">
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <form [formGroup]="form" (ngSubmit)="save()" class="p-6 sm:p-8">

                    <div class="mb-6">
                        <div class="flex items-center space-x-3 mb-4">
                            <div class="w-8 h-8 bg-violet-100 dark:bg-violet-900 rounded-lg flex items-center justify-center"><mat-icon class="text-violet-600 dark:text-violet-400 text-lg">inventory_2</mat-icon></div>
                            <h3 class="text-xl font-semibold text-gray-900 dark:text-white">{{ 'CATALOG.PRODUCTS.FORM.SECTION_BASIC' | transloco }}</h3>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <mat-form-field class="w-full" appearance="outline"><mat-label>{{ 'CATALOG.PRODUCTS.FORM.NAME_LABEL' | transloco }}</mat-label><input matInput formControlName="name"><mat-error *ngIf="form.get('name')?.hasError('required')">{{ 'CATALOG.PRODUCTS.FORM.NAME_REQUIRED' | transloco }}</mat-error></mat-form-field>
                            <mat-form-field class="w-full" appearance="outline"><mat-label>{{ 'CATALOG.PRODUCTS.FORM.SKU_LABEL' | transloco }}</mat-label><input matInput formControlName="sku"><mat-error *ngIf="form.get('sku')?.hasError('required')">{{ 'CATALOG.PRODUCTS.FORM.SKU_REQUIRED' | transloco }}</mat-error></mat-form-field>
                            <mat-form-field class="w-full" appearance="outline"><mat-label>{{ 'CATALOG.PRODUCTS.FORM.BARCODE_LABEL' | transloco }}</mat-label><input matInput formControlName="barcode"></mat-form-field>
                            <mat-form-field class="w-full" appearance="outline"><mat-label>{{ 'CATALOG.PRODUCTS.FORM.IMAGE_URL_LABEL' | transloco }}</mat-label><input matInput formControlName="imageUrl"></mat-form-field>
                            <mat-form-field class="w-full sm:col-span-2" appearance="outline"><mat-label>{{ 'CATALOG.PRODUCTS.FORM.DESCRIPTION_LABEL' | transloco }}</mat-label><textarea matInput formControlName="description" rows="2"></textarea></mat-form-field>
                        </div>
                    </div>

                    <div class="mb-6">
                        <div class="flex items-center space-x-3 mb-4">
                            <div class="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center"><mat-icon class="text-indigo-600 dark:text-indigo-400 text-lg">category</mat-icon></div>
                            <h3 class="text-xl font-semibold text-gray-900 dark:text-white">{{ 'CATALOG.PRODUCTS.FORM.SECTION_CLASSIFICATION' | transloco }}</h3>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <mat-form-field class="w-full" appearance="outline"><mat-label>{{ 'CATALOG.PRODUCTS.FORM.CATEGORY_LABEL' | transloco }}</mat-label>
                                <mat-select formControlName="categoryId">
                                    <mat-option [value]="undefined">{{ 'CATALOG.PRODUCTS.FORM.NONE_OPTION' | transloco }}</mat-option>
                                    @for (c of categories; track c.id) { <mat-option [value]="c.id">{{ c.name }}</mat-option> }
                                </mat-select>
                            </mat-form-field>
                            <mat-form-field class="w-full" appearance="outline"><mat-label>{{ 'CATALOG.PRODUCTS.FORM.BRAND_LABEL' | transloco }}</mat-label>
                                <mat-select formControlName="brandId">
                                    <mat-option [value]="undefined">{{ 'CATALOG.PRODUCTS.FORM.NONE_OPTION' | transloco }}</mat-option>
                                    @for (b of brands; track b.id) { <mat-option [value]="b.id">{{ b.name }}</mat-option> }
                                </mat-select>
                            </mat-form-field>
                            <mat-form-field class="w-full" appearance="outline"><mat-label>{{ 'CATALOG.PRODUCTS.FORM.UNIT_LABEL' | transloco }}</mat-label>
                                <mat-select formControlName="unitId">
                                    <mat-option [value]="undefined">{{ 'CATALOG.PRODUCTS.FORM.NONE_OPTION' | transloco }}</mat-option>
                                    @for (u of units; track u.id) { <mat-option [value]="u.id">{{ u.name }} ({{ u.code }})</mat-option> }
                                </mat-select>
                            </mat-form-field>
                        </div>
                    </div>

                    <div class="mb-6">
                        <div class="flex items-center space-x-3 mb-4">
                            <div class="w-8 h-8 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center"><mat-icon class="text-amber-600 dark:text-amber-400 text-lg">payments</mat-icon></div>
                            <h3 class="text-xl font-semibold text-gray-900 dark:text-white">{{ 'CATALOG.PRODUCTS.FORM.SECTION_PRICING' | transloco }}</h3>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
                            <mat-form-field class="w-full" appearance="outline"><mat-label>{{ 'CATALOG.PRODUCTS.FORM.COST_PRICE_LABEL' | transloco }}</mat-label><input matInput type="number" formControlName="costPrice"></mat-form-field>
                            <mat-form-field class="w-full" appearance="outline"><mat-label>{{ 'CATALOG.PRODUCTS.FORM.SELLING_PRICE_LABEL' | transloco }}</mat-label><input matInput type="number" formControlName="sellingPrice"></mat-form-field>
                            <mat-form-field class="w-full" appearance="outline"><mat-label>{{ 'CATALOG.PRODUCTS.FORM.TAX_RATE_LABEL' | transloco }}</mat-label><input matInput type="number" formControlName="taxRate"></mat-form-field>
                            <mat-form-field class="w-full" appearance="outline"><mat-label>{{ 'CATALOG.PRODUCTS.FORM.REORDER_LEVEL_LABEL' | transloco }}</mat-label><input matInput type="number" formControlName="reorderLevel"></mat-form-field>
                        </div>
                        <mat-checkbox formControlName="isActive" class="mt-2">{{ 'CATALOG.PRODUCTS.FORM.ACTIVE_LABEL' | transloco }}</mat-checkbox>
                    </div>

                    <div class="mb-6">
                        <div class="flex items-center space-x-3 mb-4">
                            <div class="w-8 h-8 bg-rose-100 dark:bg-rose-900 rounded-lg flex items-center justify-center"><mat-icon class="text-rose-600 dark:text-rose-400 text-lg">local_offer</mat-icon></div>
                            <h3 class="text-xl font-semibold text-gray-900 dark:text-white">{{ 'CATALOG.PRODUCTS.FORM.SECTION_OFFER' | transloco }} <span class="text-xs font-normal text-gray-500">{{ 'CATALOG.PRODUCTS.FORM.OPTIONAL_LABEL' | transloco }}</span></h3>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
                            <mat-form-field class="w-full" appearance="outline">
                                <mat-label>{{ 'CATALOG.PRODUCTS.FORM.OFFER_TYPE_LABEL' | transloco }}</mat-label>
                                <mat-select formControlName="offerType">
                                    <mat-option value="None">{{ 'CATALOG.PRODUCTS.FORM.OFFER_TYPE_NONE' | transloco }}</mat-option>
                                    <mat-option value="Flat">{{ 'CATALOG.PRODUCTS.FORM.OFFER_TYPE_FLAT' | transloco }}</mat-option>
                                    <mat-option value="Percentage">{{ 'CATALOG.PRODUCTS.FORM.OFFER_TYPE_PERCENTAGE' | transloco }}</mat-option>
                                </mat-select>
                            </mat-form-field>
                            <mat-form-field class="w-full" appearance="outline">
                                <mat-label>{{ 'CATALOG.PRODUCTS.FORM.OFFER_VALUE_LABEL' | transloco }}</mat-label>
                                <input matInput type="number" min="0" formControlName="offerValue">
                                <span matSuffix class="text-xs text-gray-500 pr-2">{{ form.value.offerType === 'Percentage' ? '%' : '' }}</span>
                            </mat-form-field>
                            <mat-form-field class="w-full" appearance="outline">
                                <mat-label>{{ 'CATALOG.PRODUCTS.FORM.OFFER_START_LABEL' | transloco }}</mat-label>
                                <input matInput [matDatepicker]="start" formControlName="offerStartDate">
                                <mat-datepicker-toggle matIconSuffix [for]="start"></mat-datepicker-toggle>
                                <mat-datepicker #start></mat-datepicker>
                            </mat-form-field>
                            <mat-form-field class="w-full" appearance="outline">
                                <mat-label>{{ 'CATALOG.PRODUCTS.FORM.OFFER_END_LABEL' | transloco }}</mat-label>
                                <input matInput [matDatepicker]="end" formControlName="offerEndDate">
                                <mat-datepicker-toggle matIconSuffix [for]="end"></mat-datepicker-toggle>
                                <mat-datepicker #end></mat-datepicker>
                            </mat-form-field>
                        </div>
                        <p class="text-xs text-gray-500 mt-1">{{ 'CATALOG.PRODUCTS.FORM.OFFER_HINT' | transloco }}</p>
                    </div>

                    <div class="flex items-center justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button mat-button type="button" routerLink="/catalog/products">{{ 'COMMON.CANCEL' | transloco }}</button>
                        <button mat-flat-button color="primary" type="submit" class="h-12 px-6 rounded-lg shadow-lg" [disabled]="form.invalid || saving"><mat-icon class="icon-size-5 mr-2">save</mat-icon><span>{{ (saving ? 'CATALOG.PRODUCTS.FORM.SAVING' : 'COMMON.SAVE') | transloco }}</span></button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
    `,
})
export class ProductFormComponent implements OnInit {
    private readonly api = inject(ProductsService);
    private readonly cats = inject(CategoriesService);
    private readonly brds = inject(BrandsService);
    private readonly uts = inject(UnitsService);
    private readonly fb = inject(FormBuilder);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);

    id: string | null = null;
    saving = false;
    categories: CategoryDto[] = [];
    brands: BrandDto[] = [];
    units: UnitDto[] = [];

    form: FormGroup = this.fb.group({
        name: ['', Validators.required],
        sku: ['', Validators.required],
        description: [''],
        barcode: [''],
        imageUrl: [''],
        categoryId: [undefined],
        brandId: [undefined],
        unitId: [undefined],
        costPrice: [0],
        sellingPrice: [0],
        taxRate: [0],
        reorderLevel: [0],
        isActive: [true],
        offerType: ['None'],
        offerValue: [0],
        offerStartDate: [null],
        offerEndDate: [null],
    });

    ngOnInit(): void {
        this.id = this.route.snapshot.paramMap.get('id');
        this.cats.getAll().subscribe(d => this.categories = d);
        this.brds.getAll().subscribe(d => this.brands = d);
        this.uts.getAll().subscribe(d => this.units = d);
        if (this.id) this.api.get(this.id).subscribe(p => this.form.patchValue(p));
    }

    save(): void {
        if (this.form.invalid) return;
        this.saving = true;
        const v = this.form.getRawValue();
        const op$ = this.id ? this.api.update(this.id, v) : this.api.create(v);
        op$.subscribe({
            next: () => { this.saving = false; this.router.navigate(['/catalog/products']); },
            error: () => { this.saving = false; },
        });
    }
}
