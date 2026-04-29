import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BrandsService, CategoriesService, ProductsService, UnitsService } from 'app/core/catalog/catalog.service';
import { BrandDto, CategoryDto, UnitDto } from 'app/core/catalog/catalog.types';

@Component({
    selector: 'app-product-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatCheckboxModule],
    template: `
        <div class="p-6 max-w-3xl">
            <div class="flex items-center gap-2 mb-4">
                <button mat-icon-button routerLink="/catalog/products"><mat-icon>arrow_back</mat-icon></button>
                <h2 class="text-2xl font-semibold">{{ id ? 'Edit Product' : 'New Product' }}</h2>
            </div>
            <form [formGroup]="form" (ngSubmit)="save()" class="flex flex-col gap-4">
                <div class="grid grid-cols-2 gap-4">
                    <mat-form-field><mat-label>Name</mat-label><input matInput formControlName="name" /></mat-form-field>
                    <mat-form-field><mat-label>SKU</mat-label><input matInput formControlName="sku" /></mat-form-field>
                    <mat-form-field>
                        <mat-label>Category</mat-label>
                        <mat-select formControlName="categoryId">
                            <mat-option [value]="undefined">— None —</mat-option>
                            @for (c of categories; track c.id) { <mat-option [value]="c.id">{{ c.name }}</mat-option> }
                        </mat-select>
                    </mat-form-field>
                    <mat-form-field>
                        <mat-label>Brand</mat-label>
                        <mat-select formControlName="brandId">
                            <mat-option [value]="undefined">— None —</mat-option>
                            @for (b of brands; track b.id) { <mat-option [value]="b.id">{{ b.name }}</mat-option> }
                        </mat-select>
                    </mat-form-field>
                    <mat-form-field>
                        <mat-label>Unit</mat-label>
                        <mat-select formControlName="unitId">
                            <mat-option [value]="undefined">— None —</mat-option>
                            @for (u of units; track u.id) { <mat-option [value]="u.id">{{ u.name }} ({{ u.code }})</mat-option> }
                        </mat-select>
                    </mat-form-field>
                    <mat-form-field><mat-label>Barcode</mat-label><input matInput formControlName="barcode" /></mat-form-field>
                </div>
                <div class="grid grid-cols-4 gap-4">
                    <mat-form-field><mat-label>Cost Price</mat-label><input matInput type="number" formControlName="costPrice" /></mat-form-field>
                    <mat-form-field><mat-label>Selling Price</mat-label><input matInput type="number" formControlName="sellingPrice" /></mat-form-field>
                    <mat-form-field><mat-label>Tax %</mat-label><input matInput type="number" formControlName="taxRate" /></mat-form-field>
                    <mat-form-field><mat-label>Reorder Level</mat-label><input matInput type="number" formControlName="reorderLevel" /></mat-form-field>
                </div>
                <mat-form-field><mat-label>Description</mat-label><textarea matInput formControlName="description"></textarea></mat-form-field>
                <mat-checkbox formControlName="isActive">Active</mat-checkbox>
                <div class="flex gap-2">
                    <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || saving">{{ saving ? 'Saving...' : 'Save' }}</button>
                    <button mat-button type="button" routerLink="/catalog/products">Cancel</button>
                </div>
            </form>
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
        categoryId: [undefined],
        brandId: [undefined],
        unitId: [undefined],
        costPrice: [0],
        sellingPrice: [0],
        taxRate: [0],
        reorderLevel: [0],
        isActive: [true],
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
