import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslocoModule } from '@ngneat/transloco';
import { CategoriesService, ProductsService } from 'app/core/catalog/catalog.service';
import { CategoryDto, ProductDto } from 'app/core/catalog/catalog.types';
import { PromotionsService } from 'app/core/marketing/marketing.service';
import { PromotionDto } from 'app/core/marketing/marketing.types';

@Component({
    selector: 'app-promotion-form',
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule, RouterModule, TranslocoModule,
        MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatIconModule,
        MatInputModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule,
    ],
    template: `
<div class="flex flex-col flex-auto min-w-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 relative">
    <div class="absolute inset-0 opacity-5 dark:opacity-10"><div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, rgba(0,0,0,0.1) 1px, transparent 0); background-size: 20px 20px;"></div></div>
    <div class="relative z-10 flex flex-col flex-auto min-w-0">
        <div class="flex flex-col sm:flex-row space-y-16 sm:space-y-0 flex-0 sm:items-center sm:justify-between p-2 sm:py-3 sm:px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
            <div class="flex items-center space-x-4">
                <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-pink-500 to-fuchsia-600 rounded-xl shadow-lg"><mat-icon class="text-white">{{ id ? 'edit' : 'local_offer' }}</mat-icon></div>
                <div>
                    <h2 class="text-3xl font-bold tracking-tight leading-7 sm:leading-10 truncate bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">{{ (id ? 'PROMOTIONS.FORM.TITLE_EDIT' : 'PROMOTIONS.FORM.TITLE_NEW') | transloco }}</h2>
                    <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">{{ 'PROMOTIONS.FORM.SUBTITLE' | transloco }}</p>
                </div>
            </div>
            <div class="flex flex-col w-full sm:w-auto sm:flex-row space-y-16 sm:space-y-0 flex-1 sm:flex-none sm:items-center sm:justify-end gap-4">
                <button mat-stroked-button class="h-12 px-6 rounded-lg" routerLink="/promotions"><mat-icon class="icon-size-5 mr-2">arrow_back</mat-icon><span>{{ 'PROMOTIONS.FORM.CANCEL_BUTTON' | transloco }}</span></button>
            </div>
        </div>

        <div class="flex-auto p-4 sm:p-6">
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <form [formGroup]="form" (ngSubmit)="save()" class="p-6 sm:p-8">
                    <div class="mb-6">
                        <div class="flex items-center space-x-3 mb-4">
                            <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center"><mat-icon class="text-blue-600 dark:text-blue-400 text-lg">info</mat-icon></div>
                            <h3 class="text-xl font-semibold text-gray-900 dark:text-white">{{ 'PROMOTIONS.FORM.SECTION_IDENTIFICATION' | transloco }}</h3>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <mat-form-field class="w-full" appearance="outline">
                                <mat-label>{{ 'PROMOTIONS.FORM.CODE_LABEL' | transloco }}</mat-label>
                                <input matInput formControlName="code" [placeholder]="'PROMOTIONS.FORM.CODE_PLACEHOLDER' | transloco">
                                <mat-error *ngIf="form.get('code')?.hasError('required')">{{ 'PROMOTIONS.FORM.CODE_REQUIRED' | transloco }}</mat-error>
                            </mat-form-field>
                            <mat-form-field class="w-full" appearance="outline">
                                <mat-label>{{ 'PROMOTIONS.FORM.NAME_LABEL' | transloco }}</mat-label>
                                <input matInput formControlName="name">
                                <mat-error *ngIf="form.get('name')?.hasError('required')">{{ 'PROMOTIONS.FORM.NAME_REQUIRED' | transloco }}</mat-error>
                            </mat-form-field>
                            <mat-form-field class="w-full sm:col-span-2" appearance="outline">
                                <mat-label>{{ 'PROMOTIONS.FORM.DESCRIPTION_LABEL' | transloco }}</mat-label>
                                <input matInput formControlName="description">
                            </mat-form-field>
                        </div>
                    </div>

                    <div class="mb-6">
                        <div class="flex items-center space-x-3 mb-4">
                            <div class="w-8 h-8 bg-violet-100 dark:bg-violet-900 rounded-lg flex items-center justify-center"><mat-icon class="text-violet-600 dark:text-violet-400 text-lg">tune</mat-icon></div>
                            <h3 class="text-xl font-semibold text-gray-900 dark:text-white">{{ 'PROMOTIONS.FORM.SECTION_DISCOUNT' | transloco }}</h3>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <mat-form-field class="w-full" appearance="outline">
                                <mat-label>{{ 'PROMOTIONS.FORM.TYPE_LABEL' | transloco }}</mat-label>
                                <mat-select formControlName="type">
                                    <mat-option value="PercentageOff">{{ 'PROMOTIONS.FORM.TYPE_PERCENT' | transloco }}</mat-option>
                                    <mat-option value="FixedAmountOff">{{ 'PROMOTIONS.FORM.TYPE_FIXED' | transloco }}</mat-option>
                                    <mat-option value="BuyXGetYFree">{{ 'PROMOTIONS.FORM.TYPE_BOGO' | transloco }}</mat-option>
                                </mat-select>
                            </mat-form-field>
                            <mat-form-field class="w-full" appearance="outline">
                                <mat-label>{{ 'PROMOTIONS.FORM.SCOPE_LABEL' | transloco }}</mat-label>
                                <mat-select formControlName="scope">
                                    <mat-option value="Cart">{{ 'PROMOTIONS.FORM.SCOPE_CART' | transloco }}</mat-option>
                                    <mat-option value="Product">{{ 'PROMOTIONS.FORM.SCOPE_PRODUCT' | transloco }}</mat-option>
                                    <mat-option value="Category">{{ 'PROMOTIONS.FORM.SCOPE_CATEGORY' | transloco }}</mat-option>
                                </mat-select>
                            </mat-form-field>

                            <mat-form-field class="w-full" appearance="outline" *ngIf="form.value.type !== 'BuyXGetYFree'">
                                <mat-label>{{ (form.value.type === 'PercentageOff' ? 'PROMOTIONS.FORM.PERCENT_LABEL' : 'PROMOTIONS.FORM.AMOUNT_LABEL') | transloco }}</mat-label>
                                <input matInput type="number" min="0" step="0.01" formControlName="value">
                            </mat-form-field>

                            <ng-container *ngIf="form.value.type === 'BuyXGetYFree'">
                                <mat-form-field class="w-full" appearance="outline">
                                    <mat-label>{{ 'PROMOTIONS.FORM.BUY_QTY_LABEL' | transloco }}</mat-label>
                                    <input matInput type="number" min="1" formControlName="buyQty">
                                </mat-form-field>
                                <mat-form-field class="w-full" appearance="outline">
                                    <mat-label>{{ 'PROMOTIONS.FORM.GET_QTY_LABEL' | transloco }}</mat-label>
                                    <input matInput type="number" min="1" formControlName="getQty">
                                </mat-form-field>
                            </ng-container>

                            <mat-form-field class="w-full" appearance="outline" *ngIf="form.value.scope === 'Product'">
                                <mat-label>{{ 'PROMOTIONS.FORM.PRODUCT_LABEL' | transloco }}</mat-label>
                                <mat-select formControlName="productId">
                                    @for (p of products; track p.id) {
                                        <mat-option [value]="p.id">{{ p.name }} ({{ p.sku }})</mat-option>
                                    }
                                </mat-select>
                            </mat-form-field>
                            <mat-form-field class="w-full" appearance="outline" *ngIf="form.value.scope === 'Category'">
                                <mat-label>{{ 'PROMOTIONS.FORM.CATEGORY_LABEL' | transloco }}</mat-label>
                                <mat-select formControlName="categoryId">
                                    @for (c of categories; track c.id) {
                                        <mat-option [value]="c.id">{{ c.name }}</mat-option>
                                    }
                                </mat-select>
                            </mat-form-field>

                            <mat-form-field class="w-full" appearance="outline">
                                <mat-label>{{ 'PROMOTIONS.FORM.MIN_PURCHASE_LABEL' | transloco }}</mat-label>
                                <input matInput type="number" min="0" step="0.01" formControlName="minPurchaseAmount">
                            </mat-form-field>
                        </div>
                    </div>

                    <div class="mb-6">
                        <div class="flex items-center space-x-3 mb-4">
                            <div class="w-8 h-8 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center"><mat-icon class="text-amber-600 dark:text-amber-400 text-lg">event</mat-icon></div>
                            <h3 class="text-xl font-semibold text-gray-900 dark:text-white">{{ 'PROMOTIONS.FORM.SECTION_VALIDITY' | transloco }}</h3>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <mat-form-field class="w-full" appearance="outline">
                                <mat-label>{{ 'PROMOTIONS.FORM.START_DATE_LABEL' | transloco }}</mat-label>
                                <input matInput [matDatepicker]="startPicker" formControlName="startDate">
                                <mat-datepicker-toggle matIconSuffix [for]="startPicker"></mat-datepicker-toggle>
                                <mat-datepicker #startPicker></mat-datepicker>
                            </mat-form-field>
                            <mat-form-field class="w-full" appearance="outline">
                                <mat-label>{{ 'PROMOTIONS.FORM.END_DATE_LABEL' | transloco }}</mat-label>
                                <input matInput [matDatepicker]="endPicker" formControlName="endDate">
                                <mat-datepicker-toggle matIconSuffix [for]="endPicker"></mat-datepicker-toggle>
                                <mat-datepicker #endPicker></mat-datepicker>
                            </mat-form-field>
                            <mat-form-field class="w-full" appearance="outline">
                                <mat-label>{{ 'PROMOTIONS.FORM.USAGE_LIMIT_LABEL' | transloco }}</mat-label>
                                <input matInput type="number" min="0" formControlName="usageLimit">
                            </mat-form-field>
                        </div>
                        <div class="mt-2">
                            <mat-checkbox formControlName="isActive">{{ 'PROMOTIONS.FORM.ACTIVE_LABEL' | transloco }}</mat-checkbox>
                        </div>
                    </div>

                    <div class="flex items-center justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button mat-button type="button" routerLink="/promotions">{{ 'PROMOTIONS.FORM.CANCEL_BUTTON' | transloco }}</button>
                        <button mat-flat-button color="primary" type="submit" class="h-12 px-6 rounded-lg shadow-lg" [disabled]="form.invalid || saving">
                            <mat-icon class="icon-size-5 mr-2">save</mat-icon><span>{{ (saving ? 'PROMOTIONS.FORM.SAVING' : 'PROMOTIONS.FORM.SAVE_BUTTON') | transloco }}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
    `,
})
export class PromotionFormComponent implements OnInit {
    private readonly api = inject(PromotionsService);
    private readonly productsApi = inject(ProductsService);
    private readonly categoriesApi = inject(CategoriesService);
    private readonly fb = inject(FormBuilder);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);

    id: string | null = null;
    saving = false;
    products: ProductDto[] = [];
    categories: CategoryDto[] = [];

    form: FormGroup = this.fb.group({
        code: ['', Validators.required],
        name: ['', Validators.required],
        description: [''],
        type: ['PercentageOff', Validators.required],
        scope: ['Cart', Validators.required],
        value: [0],
        buyQty: [1],
        getQty: [1],
        productId: [null],
        categoryId: [null],
        minPurchaseAmount: [0],
        startDate: [null],
        endDate: [null],
        usageLimit: [null],
        isActive: [true],
    });

    ngOnInit(): void {
        this.productsApi.getAll({ isActive: true }).subscribe(p => this.products = p);
        this.categoriesApi.getAll().subscribe(c => this.categories = c);
        this.id = this.route.snapshot.paramMap.get('id');
        if (this.id) {
            this.api.get(this.id).subscribe(p => this.form.patchValue({
                ...p,
                startDate: p.startDate ? new Date(p.startDate) : null,
                endDate: p.endDate ? new Date(p.endDate) : null,
            }));
        }
    }

    save(): void {
        if (this.form.invalid) return;
        this.saving = true;
        const v = this.form.getRawValue();
        const payload: Partial<PromotionDto> = {
            ...v,
            startDate: v.startDate ? new Date(v.startDate).toISOString() : undefined,
            endDate: v.endDate ? new Date(v.endDate).toISOString() : undefined,
            productId: v.scope === 'Product' ? v.productId : undefined,
            categoryId: v.scope === 'Category' ? v.categoryId : undefined,
            usageLimit: v.usageLimit ? Number(v.usageLimit) : undefined,
        };
        const op$ = this.id ? this.api.update(this.id, payload) : this.api.create(payload);
        op$.subscribe({
            next: () => { this.saving = false; this.router.navigate(['/promotions']); },
            error: () => { this.saving = false; },
        });
    }
}
