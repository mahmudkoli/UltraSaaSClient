import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
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
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { BrandDto, CategoryDto, ProductDto } from 'app/core/catalog/catalog.types';
import { TenantInfoService } from 'app/core/auth/tenant-info.service';
import { CurrentOutletService } from 'app/core/outlets/current-outlet.service';
import { ProductPricingDialogComponent } from './product-pricing-dialog.component';
import { ProductPharmacyDialogComponent } from './product-pharmacy-dialog.component';
import { ProductElectronicsDialogComponent } from './product-electronics-dialog.component';
import { ImportDialogComponent, ImportDialogConfig } from 'app/core/import/import-dialog.component';
import { PrintLabelsDialogComponent, PrintLabelsDialogData } from 'app/core/barcode/print-labels-dialog.component';

@Component({
    selector: 'app-product-list',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, MatButtonModule, MatCheckboxModule, MatDialogModule, MatFormFieldModule, MatIconModule, MatInputModule, MatPaginatorModule, MatSelectModule, MatSortModule, MatTableModule, MatTooltipModule],
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
                @if (selectedCount() > 0) {
                    <button mat-stroked-button class="!h-12 !px-4 !text-teal-700 !border-teal-300 !bg-teal-50 dark:!bg-teal-900/20"
                            (click)="printLabelsForSelected()"
                            matTooltip="Print barcode labels for the selected products">
                        <mat-icon class="icon-size-5 mr-1">qr_code_2</mat-icon>
                        <span>Print labels ({{ selectedCount() }})</span>
                    </button>
                }
                <button mat-stroked-button class="!h-12 !px-4" (click)="openImport()" matTooltip="Bulk-import products from .xlsx"><mat-icon class="icon-size-5 mr-1">cloud_upload</mat-icon><span>Import</span></button>
                <button mat-fab color="primary" routerLink="../products/create" matTooltip="Add new product"><mat-icon>add</mat-icon></button>
            </div>
        </div>
        <div class="flex-auto p-4 sm:p-6">
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div class="relative overflow-x-auto">
                    <table mat-table matSort [dataSource]="rows()" (matSortChange)="onSort($event)" class="w-full">
                        <ng-container matColumnDef="select">
                            <th mat-header-cell *matHeaderCellDef class="pl-4 sm:pl-6 !w-10">
                                <mat-checkbox
                                    [checked]="allOnPageSelected()"
                                    [indeterminate]="someOnPageSelected()"
                                    (change)="togglePageSelection($event.checked)"
                                    matTooltip="Select all on this page"></mat-checkbox>
                            </th>
                            <td mat-cell *matCellDef="let r" class="pl-4 sm:pl-6 !w-10">
                                <mat-checkbox
                                    [checked]="isSelected(r.id)"
                                    (change)="toggleSelection(r.id, $event.checked)"></mat-checkbox>
                            </td>
                        </ng-container>
                        <ng-container matColumnDef="sku"><th mat-header-cell *matHeaderCellDef mat-sort-header><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</span></th>
                            <td mat-cell *matCellDef="let r" class="font-mono text-xs">{{ r.sku }}</td></ng-container>
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
                            <td mat-cell *matCellDef="let r" class="!text-right">
                                @if (r.isOutletPriceOverride && r.outletSellingPrice != null) {
                                    <div class="flex flex-col items-end leading-tight">
                                        <span class="text-sm font-semibold text-emerald-700 dark:text-emerald-400">{{ r.outletSellingPrice | number:'1.2-2' }}</span>
                                        @if (r.isOfferActive && r.offerPrice != null) {
                                            <span class="text-[10px] text-amber-600 line-through">{{ r.offerPrice | number:'1.2-2' }}</span>
                                        }
                                        <span class="text-[10px] text-gray-500 line-through">{{ r.sellingPrice | number:'1.2-2' }}</span>
                                    </div>
                                } @else if (r.isOfferActive && r.offerPrice != null) {
                                    <div class="flex flex-col items-end leading-tight">
                                        <span class="text-sm font-semibold text-amber-700 dark:text-amber-400">{{ r.offerPrice | number:'1.2-2' }}</span>
                                        <span class="text-[10px] text-gray-500 line-through">{{ r.sellingPrice | number:'1.2-2' }}</span>
                                    </div>
                                } @else {
                                    <span class="text-sm font-semibold">{{ r.sellingPrice | number:'1.2-2' }}</span>
                                }
                            </td></ng-container>
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
                                    <button mat-icon-button class="text-teal-600" (click)="printLabels(r)" matTooltip="Print barcode labels"><mat-icon class="icon-size-5">qr_code_2</mat-icon></button>
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
    private readonly _confirm = inject(FuseConfirmationService);
    private readonly brds = inject(BrandsService);
    private readonly dialog = inject(MatDialog);
    private readonly tenantInfo = inject(TenantInfoService);
    private readonly currentOutlet = inject(CurrentOutletService);

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

    cols = ['select', 'sku', 'name', 'costPrice', 'sellingPrice', 'tax', 'reorder', 'active', 'actions'];
    searchChanged = new Subject<string>();

    /** IDs of products checked across pages — survives pagination so users can
     * pick across pages and bulk-print in one shot. */
    selectedIds = signal(new Set<string>());
    selectedCount = computed(() => this.selectedIds().size);

    isSelected = (id: string): boolean => this.selectedIds().has(id);

    toggleSelection(id: string, checked: boolean): void {
        const next = new Set(this.selectedIds());
        if (checked) next.add(id); else next.delete(id);
        this.selectedIds.set(next);
    }

    /** True when every row currently rendered is in the selection. */
    allOnPageSelected = computed(() => {
        const ids = this.selectedIds();
        const r = this.rows();
        return r.length > 0 && r.every(p => ids.has(p.id));
    });

    /** True when some — but not all — rows on the page are selected. */
    someOnPageSelected = computed(() => {
        const ids = this.selectedIds();
        const r = this.rows();
        const n = r.filter(p => ids.has(p.id)).length;
        return n > 0 && n < r.length;
    });

    togglePageSelection(checkAll: boolean): void {
        const next = new Set(this.selectedIds());
        for (const p of this.rows()) {
            if (checkAll) next.add(p.id); else next.delete(p.id);
        }
        this.selectedIds.set(next);
    }

    categoryName(id?: string): string { return id ? this.categories().find(c => c.id === id)?.name ?? '' : ''; }
    brandName(id?: string): string { return id ? this.brands().find(b => b.id === id)?.name ?? '' : '—'; }

    ngOnInit(): void {
        this.searchChanged.pipe(debounceTime(300)).subscribe(() => this.resetAndLoad());
        this.load();
        this.cats.getAll().subscribe(d => this.categories.set(d));
        this.brds.getAll().subscribe(d => this.brands.set(d));
    }

    private buildRequest(): SearchProductsRequest {
        // When an outlet is set in the session (from POS, Sales, GR, etc.),
        // pass it so the API stamps each ProductDto with the outlet-resolved
        // price. The Print Labels dialog reads OutletSellingPrice +
        // IsOutletPriceOverride to honor the "Use outlet price" toggle —
        // without this, every label falls back to the catalog base.
        const outletId = this.currentOutlet.outletId() || undefined;
        return {
            pageNumber: this.pageIndex + 1,
            pageSize: this.pageSize,
            orderBy: this.orderBy,
            keyword: this.search.trim() || undefined,
            categoryId: this.categoryFilter || undefined,
            outletId,
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
        this._confirm.open({
            title: 'Delete product',
            message: `Delete product "${r.name}"?`,
            icon: { show: true, name: 'heroicons_outline:exclamation-triangle', color: 'warn' },
            actions: { confirm: { label: 'Delete', color: 'warn' }, cancel: { label: 'Cancel' } },
        }).afterClosed().subscribe(result => {
            if (result !== 'confirmed') return;
            this.api.delete(r.id).subscribe(() => this.load());
        });
    }

    manageOutletPrices(r: ProductDto): void {
        const ref = this.dialog.open(ProductPricingDialogComponent, {
            width: '640px',
            data: { product: r },
        });
        // The dialog mutates outlet pricing for this product — re-fetch on close
        // so the Price column shows the updated outlet-resolved price (or
        // restores to base if the override was removed). Also picks up any
        // changes to other outlets the user might have edited in the same
        // session.
        ref.afterClosed().subscribe(() => this.load());
    }

    managePharmacy(r: ProductDto): void {
        const ref = this.dialog.open(ProductPharmacyDialogComponent, {
            width: '640px',
            data: { product: r },
        });
        ref.afterClosed().subscribe(() => this.load());
    }

    manageElectronics(r: ProductDto): void {
        const ref = this.dialog.open(ProductElectronicsDialogComponent, {
            width: '640px',
            data: { product: r },
        });
        ref.afterClosed().subscribe(() => this.load());
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

    printLabels(r: ProductDto): void {
        const data: PrintLabelsDialogData = { product: r };
        this.dialog.open(PrintLabelsDialogComponent, { width: '520px', data });
    }

    /**
     * Bulk-print labels for every checked product across pages. The selection
     * survives pagination, so we resolve IDs from the current rows() (loaded
     * page) plus an extra fetch for any IDs not on this page. Keeps it simple:
     * fetch unfiltered list once, filter to selected IDs.
     */
    printLabelsForSelected(): void {
        const ids = this.selectedIds();
        if (ids.size === 0) return;
        // Most picks come from the page that's already loaded — fast path first.
        const onPage = this.rows().filter(p => ids.has(p.id));
        if (onPage.length === ids.size) {
            this.openBulkDialog(onPage);
            return;
        }
        // Mixed pages — hit the unfiltered endpoint and pick the rest.
        this.api.getAll().subscribe(all => {
            const picked = all.filter(p => ids.has(p.id));
            this.openBulkDialog(picked);
        });
    }

    private openBulkDialog(products: ProductDto[]): void {
        const data: PrintLabelsDialogData = { products };
        const ref = this.dialog.open(PrintLabelsDialogComponent, { width: '560px', data });
        ref.afterClosed().subscribe(printed => {
            if (printed) this.selectedIds.set(new Set());
        });
    }
}
