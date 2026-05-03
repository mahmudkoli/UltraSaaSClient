import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { debounceTime, Subject } from 'rxjs';
import { toOrderBy } from 'app/core/common/pagination.types';
import { BrandsService, CategoriesService, ProductsService, SearchProductsRequest } from 'app/core/catalog/catalog.service';
import { BrandDto, CategoryDto, ProductDto } from 'app/core/catalog/catalog.types';
import { TenantInfoService } from 'app/core/auth/tenant-info.service';
import { ProductPricingDialogComponent } from './product-pricing-dialog.component';
import { ProductPharmacyDialogComponent } from './product-pharmacy-dialog.component';
import { ProductElectronicsDialogComponent } from './product-electronics-dialog.component';
import { ImportDialogComponent, ImportDialogConfig } from 'app/core/import/import-dialog.component';

@Component({
    selector: 'app-product-list',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, MatButtonModule, MatDialogModule, MatFormFieldModule, MatIconModule, MatInputModule, MatPaginatorModule, MatSelectModule, MatSortModule, MatTableModule, MatTooltipModule],
    template: `
<div class="flex flex-col flex-auto min-w-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 relative">
    <div class="absolute inset-0 opacity-5 dark:opacity-10"><div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, rgba(0,0,0,0.1) 1px, transparent 0); background-size: 20px 20px;"></div></div>
    <div class="relative z-10 flex flex-col flex-auto min-w-0">
        <div class="flex flex-col sm:flex-row space-y-16 sm:space-y-0 flex-0 sm:items-center sm:justify-between p-2 sm:py-3 sm:px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
            <div class="flex items-center space-x-4">
                <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-violet-500 to-indigo-600 rounded-xl shadow-lg"><mat-icon class="text-white">inventory_2</mat-icon></div>
                <div>
                    <h2 class="text-3xl font-bold tracking-tight leading-7 sm:leading-10 truncate bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Products</h2>
                    <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">SKU master — pricing, tax, reorder levels</p>
                </div>
            </div>
            <div class="flex flex-col w-full sm:w-auto sm:flex-row space-y-16 sm:space-y-0 flex-1 sm:flex-none sm:items-center sm:justify-end gap-4">
                <mat-form-field class="w-full sm:w-auto sm:min-w-72" appearance="outline" subscriptSizing="dynamic">
                    <mat-label>Search products</mat-label>
                    <input matInput [(ngModel)]="search" (ngModelChange)="searchChanged.next($event)" placeholder="SKU / name / barcode">
                    <mat-icon matSuffix class="text-gray-400">search</mat-icon>
                </mat-form-field>
                <mat-form-field class="w-full sm:w-auto sm:min-w-48" appearance="outline" subscriptSizing="dynamic">
                    <mat-label>Category</mat-label>
                    <mat-select [(ngModel)]="categoryFilter" (ngModelChange)="resetAndLoad()">
                        <mat-option value="">All</mat-option>
                        @for (c of categories(); track c.id) { <mat-option [value]="c.id">{{ c.name }}</mat-option> }
                    </mat-select>
                </mat-form-field>
                <button mat-stroked-button class="!h-12 !px-4" (click)="openImport()" matTooltip="Bulk-import products from .xlsx"><mat-icon class="icon-size-5 mr-1">cloud_upload</mat-icon><span>Import</span></button>
                <button mat-fab color="primary" routerLink="../products/create" matTooltip="Add new product"><mat-icon>add</mat-icon></button>
            </div>
        </div>
        <div class="flex-auto p-4 sm:p-6">
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div class="relative overflow-x-auto">
                    <table mat-table matSort [dataSource]="rows()" (matSortChange)="onSort($event)" class="w-full">
                        <ng-container matColumnDef="sku"><th mat-header-cell *matHeaderCellDef mat-sort-header class="pl-4 sm:pl-6"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</span></th>
                            <td mat-cell *matCellDef="let r" class="pl-4 sm:pl-6 font-mono text-xs">{{ r.sku }}</td></ng-container>
                        <ng-container matColumnDef="name"><th mat-header-cell *matHeaderCellDef mat-sort-header><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Name</span></th>
                            <td mat-cell *matCellDef="let r">
                                <div class="flex flex-col">
                                    <span class="text-sm font-medium text-gray-900 dark:text-white">{{ r.name }}</span>
                                    <span class="text-xs text-gray-500">{{ brandName(r.brandId) }} · {{ categoryName(r.categoryId) }}</span>
                                </div>
                            </td></ng-container>
                        <ng-container matColumnDef="costPrice"><th mat-header-cell *matHeaderCellDef mat-sort-header class="!text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</span></th>
                            <td mat-cell *matCellDef="let r" class="!text-right">{{ r.costPrice | number:'1.2-2' }}</td></ng-container>
                        <ng-container matColumnDef="sellingPrice"><th mat-header-cell *matHeaderCellDef mat-sort-header class="!text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Price</span></th>
                            <td mat-cell *matCellDef="let r" class="!text-right font-semibold">{{ r.sellingPrice | number:'1.2-2' }}</td></ng-container>
                        <ng-container matColumnDef="tax"><th mat-header-cell *matHeaderCellDef class="!text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Tax %</span></th>
                            <td mat-cell *matCellDef="let r" class="!text-right">{{ r.taxRate | number:'1.0-2' }}</td></ng-container>
                        <ng-container matColumnDef="reorder"><th mat-header-cell *matHeaderCellDef class="!text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Reorder</span></th>
                            <td mat-cell *matCellDef="let r" class="!text-right">{{ r.reorderLevel | number:'1.0-2' }}</td></ng-container>
                        <ng-container matColumnDef="active"><th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</span></th>
                            <td mat-cell *matCellDef="let r">
                                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium" [ngClass]="r.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                                    <mat-icon class="icon-size-4 mr-1">{{ r.isActive ? 'check_circle' : 'cancel' }}</mat-icon>{{ r.isActive ? 'Active' : 'Inactive' }}
                                </span>
                            </td></ng-container>
                        <ng-container matColumnDef="actions"><th mat-header-cell *matHeaderCellDef class="pr-4 sm:pr-6 !text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</span></th>
                            <td mat-cell *matCellDef="let r" class="pr-4 sm:pr-6">
                                <div class="flex items-center justify-end space-x-2">
                                    <button mat-icon-button class="text-blue-600" [routerLink]="['../products', r.id]" matTooltip="Edit"><mat-icon class="icon-size-5">edit</mat-icon></button>
                                    <button mat-icon-button class="text-amber-600" (click)="manageOutletPrices(r)" matTooltip="Outlet pricing"><mat-icon class="icon-size-5">price_change</mat-icon></button>
                                    @if (showElectronics()) {
                                        <button mat-icon-button class="text-sky-600" (click)="manageElectronics(r)" matTooltip="Electronics details"><mat-icon class="icon-size-5">memory</mat-icon></button>
                                    }
                                    @if (showPharmacy()) {
                                        <button mat-icon-button class="text-emerald-600" (click)="managePharmacy(r)" matTooltip="Pharmacy details"><mat-icon class="icon-size-5">medication</mat-icon></button>
                                    }
                                    <button mat-icon-button class="text-red-600" (click)="remove(r)" matTooltip="Delete"><mat-icon class="icon-size-5">delete</mat-icon></button>
                                </div>
                            </td></ng-container>
                        <tr mat-header-row *matHeaderRowDef="cols" class="bg-gray-50 dark:bg-gray-700"></tr>
                        <tr mat-row *matRowDef="let row; columns: cols" class="hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors"></tr>
                    </table>

                    <mat-paginator
                        [length]="totalCount()"
                        [pageSize]="pageSize"
                        [pageSizeOptions]="[10, 25, 50, 100]"
                        [pageIndex]="pageIndex"
                        (page)="onPage($event)"
                        showFirstLastButtons></mat-paginator>
                </div>
                <div *ngIf="!loading() && rows().length === 0" class="flex flex-col items-center justify-center p-12">
                    <div class="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center mb-6 shadow-lg"><mat-icon class="icon-size-16 text-gray-400">inventory_2</mat-icon></div>
                    <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">No products found</h3>
                    <button *ngIf="!search && !categoryFilter" mat-flat-button color="primary" routerLink="../products/create"><mat-icon class="icon-size-5 mr-2">add_circle</mat-icon><span>Add Product</span></button>
                </div>
            </div>
        </div>
    </div>
</div>
    `,
})
export class ProductListComponent implements OnInit {
    private readonly api = inject(ProductsService);
    private readonly cats = inject(CategoriesService);
    private readonly brds = inject(BrandsService);
    private readonly dialog = inject(MatDialog);
    private readonly tenantInfo = inject(TenantInfoService);

    showPharmacy = (): boolean => this.tenantInfo.isVertical('Pharmacy');
    showElectronics = (): boolean => this.tenantInfo.isVertical('Electronics');

    @ViewChild(MatPaginator) paginator?: MatPaginator;
    @ViewChild(MatSort) sort?: MatSort;

    rows = signal<ProductDto[]>([]);
    categories = signal<CategoryDto[]>([]);
    brands = signal<BrandDto[]>([]);
    loading = signal(true);
    totalCount = signal(0);

    search = '';
    categoryFilter = '';

    pageIndex = 0;
    pageSize = 25;
    private orderBy?: string[];

    cols = ['sku', 'name', 'costPrice', 'sellingPrice', 'tax', 'reorder', 'active', 'actions'];
    searchChanged = new Subject<string>();

    categoryName(id?: string): string { return id ? this.categories().find(c => c.id === id)?.name ?? '' : ''; }
    brandName(id?: string): string { return id ? this.brands().find(b => b.id === id)?.name ?? '' : '—'; }

    ngOnInit(): void {
        this.searchChanged.pipe(debounceTime(300)).subscribe(() => this.resetAndLoad());
        this.load();
        this.cats.getAll().subscribe(d => this.categories.set(d));
        this.brds.getAll().subscribe(d => this.brands.set(d));
    }

    private buildRequest(): SearchProductsRequest {
        return {
            pageNumber: this.pageIndex + 1,
            pageSize: this.pageSize,
            orderBy: this.orderBy,
            keyword: this.search.trim() || undefined,
            categoryId: this.categoryFilter || undefined,
        };
    }

    load(): void {
        this.loading.set(true);
        this.api.search(this.buildRequest()).subscribe({
            next: r => { this.rows.set(r.data); this.totalCount.set(r.totalCount); this.loading.set(false); },
            error: () => this.loading.set(false),
        });
    }

    resetAndLoad(): void { this.pageIndex = 0; this.load(); }
    onPage(e: PageEvent): void { this.pageIndex = e.pageIndex; this.pageSize = e.pageSize; this.load(); }
    onSort(s: Sort): void { this.orderBy = toOrderBy(s.active, s.direction); this.resetAndLoad(); }

    remove(r: ProductDto): void {
        if (!confirm(`Delete product "${r.name}"?`)) return;
        this.api.delete(r.id).subscribe(() => this.load());
    }

    manageOutletPrices(r: ProductDto): void {
        this.dialog.open(ProductPricingDialogComponent, {
            width: '640px',
            data: { product: r },
        });
    }

    managePharmacy(r: ProductDto): void {
        this.dialog.open(ProductPharmacyDialogComponent, {
            width: '640px',
            data: { product: r },
        });
    }

    manageElectronics(r: ProductDto): void {
        this.dialog.open(ProductElectronicsDialogComponent, {
            width: '640px',
            data: { product: r },
        });
    }

    openImport(): void {
        const config: ImportDialogConfig = {
            title: 'Import products',
            subtitle: 'Bulk-create or update SKUs from an Excel file. Categories / brands / units auto-create when missing.',
            templateUrl: this.api.importTemplateUrl(),
            showModeSelector: true,
            icon: 'cube',
            submit: (file, mode) => this.api.import(file, mode),
        };
        const ref = this.dialog.open(ImportDialogComponent, { width: '640px', data: config, disableClose: true });
        ref.afterClosed().subscribe(result => { if (result) this.load(); });
    }
}
