import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { BrandsService, CategoriesService, ProductsService, UnitsService } from 'app/core/catalog/catalog.service';
import { BrandDto, CategoryDto, ProductDto, UnitDto } from 'app/core/catalog/catalog.types';

@Component({
    selector: 'app-product-dialog',
    standalone: true,
    imports: [CommonModule, FormsModule, MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatCheckboxModule],
    template: `
        <h2 mat-dialog-title>{{ row?.id ? 'Edit' : 'New' }} Product</h2>
        <div mat-dialog-content class="grid grid-cols-2 gap-3 pt-2">
            <mat-form-field appearance="outline"><mat-label>Name</mat-label><input matInput [(ngModel)]="model.name" /></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>SKU</mat-label><input matInput [(ngModel)]="model.sku" /></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Barcode</mat-label><input matInput [(ngModel)]="model.barcode" /></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Category</mat-label>
                <mat-select [(ngModel)]="model.categoryId">
                    <mat-option [value]="undefined">— None —</mat-option>
                    @for (c of categories; track c.id) { <mat-option [value]="c.id">{{ c.name }}</mat-option> }
                </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Brand</mat-label>
                <mat-select [(ngModel)]="model.brandId">
                    <mat-option [value]="undefined">— None —</mat-option>
                    @for (b of brands; track b.id) { <mat-option [value]="b.id">{{ b.name }}</mat-option> }
                </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Unit</mat-label>
                <mat-select [(ngModel)]="model.unitId">
                    <mat-option [value]="undefined">— None —</mat-option>
                    @for (u of units; track u.id) { <mat-option [value]="u.id">{{ u.name }} ({{ u.code }})</mat-option> }
                </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Cost Price</mat-label>
                <input matInput type="number" [(ngModel)]="model.costPrice" /></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Selling Price</mat-label>
                <input matInput type="number" [(ngModel)]="model.sellingPrice" /></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Tax Rate %</mat-label>
                <input matInput type="number" [(ngModel)]="model.taxRate" /></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Reorder Level</mat-label>
                <input matInput type="number" [(ngModel)]="model.reorderLevel" /></mat-form-field>
            <mat-form-field appearance="outline" class="col-span-2"><mat-label>Description</mat-label>
                <textarea matInput [(ngModel)]="model.description"></textarea></mat-form-field>
            <mat-checkbox class="col-span-2" [(ngModel)]="model.isActive">Active</mat-checkbox>
        </div>
        <div mat-dialog-actions align="end">
            <button mat-button (click)="ref.close()">Cancel</button>
            <button mat-raised-button color="primary" [disabled]="saving()" (click)="save()">Save</button>
        </div>
    `,
})
export class ProductDialogComponent {
    private readonly api = inject(ProductsService);
    readonly ref = inject(MatDialogRef<ProductDialogComponent>);
    row?: ProductDto;
    model: Partial<ProductDto>;
    saving = signal(false);
    categories: CategoryDto[];
    brands: BrandDto[];
    units: UnitDto[];

    constructor(@Inject(MAT_DIALOG_DATA) data: { row?: ProductDto; categories: CategoryDto[]; brands: BrandDto[]; units: UnitDto[] }) {
        this.row = data.row;
        this.categories = data.categories;
        this.brands = data.brands;
        this.units = data.units;
        this.model = data.row
            ? { ...data.row }
            : { name: '', sku: '', costPrice: 0, sellingPrice: 0, taxRate: 0, reorderLevel: 0, isActive: true };
    }

    save(): void {
        if (!this.model.name || !this.model.sku) return;
        this.saving.set(true);
        const op = this.row?.id ? this.api.update(this.row.id, this.model) : this.api.create(this.model as any);
        op.subscribe({ next: () => this.ref.close(true), error: () => this.saving.set(false) });
    }
}

@Component({
    selector: 'app-products',
    standalone: true,
    imports: [CommonModule, FormsModule, MatButtonModule, MatDialogModule, MatIconModule, MatInputModule, MatTableModule, MatFormFieldModule, MatSelectModule],
    template: `
        <div class="p-6">
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-2xl font-semibold">Products</h2>
                <button mat-raised-button color="primary" (click)="open()"><mat-icon>add</mat-icon> New</button>
            </div>
            <mat-form-field appearance="outline" class="w-full !mb-3">
                <mat-label>Search</mat-label>
                <input matInput [(ngModel)]="search" placeholder="Filter by SKU/name/barcode..." />
            </mat-form-field>
            <table mat-table [dataSource]="filtered()" class="w-full">
                <ng-container matColumnDef="sku"><th mat-header-cell *matHeaderCellDef>SKU</th>
                    <td mat-cell *matCellDef="let r">{{ r.sku }}</td></ng-container>
                <ng-container matColumnDef="name"><th mat-header-cell *matHeaderCellDef>Name</th>
                    <td mat-cell *matCellDef="let r">{{ r.name }}</td></ng-container>
                <ng-container matColumnDef="cost"><th mat-header-cell *matHeaderCellDef>Cost</th>
                    <td mat-cell *matCellDef="let r">{{ r.costPrice | number:'1.2-2' }}</td></ng-container>
                <ng-container matColumnDef="price"><th mat-header-cell *matHeaderCellDef>Price</th>
                    <td mat-cell *matCellDef="let r">{{ r.sellingPrice | number:'1.2-2' }}</td></ng-container>
                <ng-container matColumnDef="tax"><th mat-header-cell *matHeaderCellDef>Tax %</th>
                    <td mat-cell *matCellDef="let r">{{ r.taxRate | number:'1.0-2' }}</td></ng-container>
                <ng-container matColumnDef="reorder"><th mat-header-cell *matHeaderCellDef>Reorder</th>
                    <td mat-cell *matCellDef="let r">{{ r.reorderLevel | number:'1.0-2' }}</td></ng-container>
                <ng-container matColumnDef="active"><th mat-header-cell *matHeaderCellDef>Active</th>
                    <td mat-cell *matCellDef="let r">{{ r.isActive ? 'Yes' : 'No' }}</td></ng-container>
                <ng-container matColumnDef="actions"><th mat-header-cell *matHeaderCellDef></th>
                    <td mat-cell *matCellDef="let r">
                        <button mat-icon-button (click)="open(r)"><mat-icon>edit</mat-icon></button>
                        <button mat-icon-button color="warn" (click)="remove(r)"><mat-icon>delete</mat-icon></button>
                    </td></ng-container>
                <tr mat-header-row *matHeaderRowDef="cols"></tr>
                <tr mat-row *matRowDef="let row; columns: cols"></tr>
            </table>
        </div>
    `,
})
export class ProductsComponent implements OnInit {
    private readonly api = inject(ProductsService);
    private readonly cats = inject(CategoriesService);
    private readonly brds = inject(BrandsService);
    private readonly uts = inject(UnitsService);
    private readonly dialog = inject(MatDialog);
    rows = signal<ProductDto[]>([]);
    categories = signal<CategoryDto[]>([]);
    brands = signal<BrandDto[]>([]);
    units = signal<UnitDto[]>([]);
    search = '';
    cols = ['sku', 'name', 'cost', 'price', 'tax', 'reorder', 'active', 'actions'];

    ngOnInit(): void {
        this.load();
        this.cats.getAll().subscribe(d => this.categories.set(d));
        this.brds.getAll().subscribe(d => this.brands.set(d));
        this.uts.getAll().subscribe(d => this.units.set(d));
    }
    load(): void { this.api.getAll().subscribe(d => this.rows.set(d)); }
    filtered(): ProductDto[] {
        const q = this.search.trim().toLowerCase();
        if (!q) return this.rows();
        return this.rows().filter(r =>
            r.name.toLowerCase().includes(q)
            || r.sku.toLowerCase().includes(q)
            || (r.barcode ?? '').toLowerCase().includes(q));
    }
    open(row?: ProductDto): void {
        this.dialog.open(ProductDialogComponent, {
            data: { row, categories: this.categories(), brands: this.brands(), units: this.units() },
            width: '720px',
        }).afterClosed().subscribe(saved => { if (saved) this.load(); });
    }
    remove(r: ProductDto): void {
        if (!confirm(`Delete "${r.name}"?`)) return;
        this.api.delete(r.id).subscribe(() => this.load());
    }
}
