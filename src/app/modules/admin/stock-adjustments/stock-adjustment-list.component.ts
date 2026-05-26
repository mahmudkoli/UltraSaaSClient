import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { toOrderBy } from 'app/core/common/pagination.types';
import { SearchStockAdjustmentsRequest, StockAdjustmentsService } from 'app/core/inventory/inventory.service';
import { StockAdjustmentDto } from 'app/core/inventory/inventory.types';
import { OutletsService } from 'app/core/outlets/outlets.service';
import { OutletDto } from 'app/core/outlets/outlets.types';
import { CurrentOutletService } from 'app/core/outlets/current-outlet.service';
import { ProductsService } from 'app/core/catalog/catalog.service';
import { ProductDto } from 'app/core/catalog/catalog.types';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ImportDialogComponent, ImportDialogConfig } from 'app/core/import/import-dialog.component';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';

@Component({
    selector: 'app-stock-adjustment-list',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, MatButtonModule, MatDialogModule, MatFormFieldModule, MatIconModule, MatPaginatorModule, MatSelectModule, MatSortModule, MatTableModule, MatTooltipModule, TranslocoModule],
    template: `
<div class="flex flex-col flex-auto min-w-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 relative">
    <div class="absolute inset-0 opacity-5 dark:opacity-10"><div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, rgba(0,0,0,0.1) 1px, transparent 0); background-size: 20px 20px;"></div></div>
    <div class="relative z-10 flex flex-col flex-auto min-w-0">
        <div class="flex flex-col sm:flex-row space-y-16 sm:space-y-0 flex-0 sm:items-center sm:justify-between p-2 sm:py-3 sm:px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
            <div class="flex items-center space-x-4">
                <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl shadow-lg"><mat-icon class="text-white">tune</mat-icon></div>
                <div>
                    <h2 class="text-3xl font-bold tracking-tight leading-7 sm:leading-10 truncate bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">{{ 'INVENTORY.ADJUSTMENTS.LIST.TITLE' | transloco }}</h2>
                    <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">{{ 'INVENTORY.ADJUSTMENTS.LIST.SUBTITLE' | transloco }}</p>
                </div>
            </div>
            <div class="flex items-center gap-3">
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-48">
                    <mat-label>{{ 'INVENTORY.ADJUSTMENTS.LIST.OUTLET_LABEL' | transloco }}</mat-label>
                    <mat-select [(ngModel)]="outletFilter" (ngModelChange)="resetAndLoad()">
                        <mat-option [value]="''">{{ 'INVENTORY.ADJUSTMENTS.LIST.OUTLET_ALL' | transloco }}</mat-option>
                        @for (o of outlets(); track o.id) { <mat-option [value]="o.id">{{ o.name }}</mat-option> }
                    </mat-select>
                </mat-form-field>
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-44">
                    <mat-label>{{ 'INVENTORY.ADJUSTMENTS.LIST.REASON_LABEL' | transloco }}</mat-label>
                    <mat-select [(ngModel)]="reasonFilter" (ngModelChange)="resetAndLoad()">
                        <mat-option value="all">{{ 'INVENTORY.ADJUSTMENTS.LIST.REASON_ALL' | transloco }}</mat-option>
                        <mat-option value="PhysicalCount">{{ 'INVENTORY.ADJUSTMENTS.LIST.REASON_PHYSICAL_COUNT' | transloco }}</mat-option>
                        <mat-option value="Damage">{{ 'INVENTORY.ADJUSTMENTS.LIST.REASON_DAMAGE' | transloco }}</mat-option>
                        <mat-option value="Loss">{{ 'INVENTORY.ADJUSTMENTS.LIST.REASON_LOSS' | transloco }}</mat-option>
                        <mat-option value="Expiry">{{ 'INVENTORY.ADJUSTMENTS.LIST.REASON_EXPIRY' | transloco }}</mat-option>
                        <mat-option value="Correction">{{ 'INVENTORY.ADJUSTMENTS.LIST.REASON_CORRECTION' | transloco }}</mat-option>
                        <mat-option value="OpeningBalance">{{ 'INVENTORY.ADJUSTMENTS.LIST.REASON_OPENING_BALANCE' | transloco }}</mat-option>
                        <mat-option value="Other">{{ 'INVENTORY.ADJUSTMENTS.LIST.REASON_OTHER' | transloco }}</mat-option>
                    </mat-select>
                </mat-form-field>
                <button mat-stroked-button class="!h-12 !px-4" (click)="openImport()" [matTooltip]="'INVENTORY.ADJUSTMENTS.LIST.IMPORT_TOOLTIP' | transloco"><mat-icon class="icon-size-5 mr-1">cloud_upload</mat-icon><span>{{ 'INVENTORY.ADJUSTMENTS.LIST.IMPORT_BUTTON' | transloco }}</span></button>
                <button mat-fab color="primary" routerLink="create" [matTooltip]="'INVENTORY.ADJUSTMENTS.LIST.ADD_TOOLTIP' | transloco"><mat-icon>add</mat-icon></button>
            </div>
        </div>

        <div class="flex-auto p-4 sm:p-6">
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div class="relative overflow-x-auto">
                    <table mat-table matSort [dataSource]="rows()" (matSortChange)="onSort($event)" class="w-full">
                        <ng-container matColumnDef="adjustedOn"><th mat-header-cell *matHeaderCellDef mat-sort-header class="pl-4 sm:pl-6"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'INVENTORY.ADJUSTMENTS.LIST.COL_WHEN' | transloco }}</span></th>
                            <td mat-cell *matCellDef="let r" class="pl-4 sm:pl-6">{{ r.adjustedOn | date:'short' }}</td></ng-container>
                        <ng-container matColumnDef="product"><th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'INVENTORY.ADJUSTMENTS.LIST.COL_PRODUCT' | transloco }}</span></th>
                            <td mat-cell *matCellDef="let r">{{ productName(r.productId) }}</td></ng-container>
                        <ng-container matColumnDef="outlet"><th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'INVENTORY.ADJUSTMENTS.LIST.COL_OUTLET' | transloco }}</span></th>
                            <td mat-cell *matCellDef="let r">{{ outletName(r.outletId) }}</td></ng-container>
                        <ng-container matColumnDef="reason"><th mat-header-cell *matHeaderCellDef mat-sort-header><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'INVENTORY.ADJUSTMENTS.LIST.COL_REASON' | transloco }}</span></th>
                            <td mat-cell *matCellDef="let r">{{ reasonLabel(r.reason) | transloco }}</td></ng-container>
                        <ng-container matColumnDef="oldQuantity"><th mat-header-cell *matHeaderCellDef class="!text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'INVENTORY.ADJUSTMENTS.LIST.COL_FROM' | transloco }}</span></th>
                            <td mat-cell *matCellDef="let r" class="!text-right">{{ r.oldQuantity | number:'1.0-3' }}</td></ng-container>
                        <ng-container matColumnDef="newQuantity"><th mat-header-cell *matHeaderCellDef class="!text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'INVENTORY.ADJUSTMENTS.LIST.COL_TO' | transloco }}</span></th>
                            <td mat-cell *matCellDef="let r" class="!text-right">{{ r.newQuantity | number:'1.0-3' }}</td></ng-container>
                        <ng-container matColumnDef="delta"><th mat-header-cell *matHeaderCellDef class="!text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'INVENTORY.ADJUSTMENTS.LIST.COL_DELTA' | transloco }}</span></th>
                            <td mat-cell *matCellDef="let r" class="!text-right font-semibold" [class.text-emerald-700]="r.delta >= 0" [class.text-rose-700]="r.delta < 0">
                                {{ r.delta > 0 ? '+' : '' }}{{ r.delta | number:'1.0-3' }}
                            </td></ng-container>
                        <ng-container matColumnDef="notes"><th mat-header-cell *matHeaderCellDef class="pr-4 sm:pr-6"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'INVENTORY.ADJUSTMENTS.LIST.COL_NOTES' | transloco }}</span></th>
                            <td mat-cell *matCellDef="let r" class="pr-4 sm:pr-6 text-xs text-gray-500">{{ r.notes || '—' }}</td></ng-container>
                        <tr mat-header-row *matHeaderRowDef="cols" class="bg-gray-50 dark:bg-gray-700"></tr>
                        <tr mat-row *matRowDef="let row; columns: cols"></tr>
                    </table>

                    <mat-paginator
                        [length]="totalCount()"
                        [pageSize]="pageSize"
                        [pageSizeOptions]="[10, 25, 50, 100]"
                        [pageIndex]="pageIndex"
                        (page)="onPage($event)"
                        showFirstLastButtons></mat-paginator>
                </div>
                <div *ngIf="rows().length === 0" class="flex flex-col items-center justify-center p-12">
                    <div class="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6 shadow-lg"><mat-icon class="icon-size-16 text-gray-400">tune</mat-icon></div>
                    <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">{{ 'INVENTORY.ADJUSTMENTS.LIST.EMPTY_TITLE' | transloco }}</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400">{{ 'INVENTORY.ADJUSTMENTS.LIST.EMPTY_SUBTITLE' | transloco }}</p>
                </div>
            </div>
        </div>
    </div>
</div>
    `,
})
export class StockAdjustmentListComponent implements OnInit {
    private readonly api = inject(StockAdjustmentsService);
    private readonly outletsApi = inject(OutletsService);
    private readonly productsApi = inject(ProductsService);
    private readonly currentOutlet = inject(CurrentOutletService);
    private readonly dialog = inject(MatDialog);
    private readonly _transloco = inject(TranslocoService);

    @ViewChild(MatPaginator) paginator?: MatPaginator;
    @ViewChild(MatSort) sort?: MatSort;

    rows = signal<StockAdjustmentDto[]>([]);
    outlets = signal<OutletDto[]>([]);
    products = signal<ProductDto[]>([]);
    totalCount = signal(0);

    outletFilter = '';
    reasonFilter: 'all' | string = 'all';

    pageIndex = 0;
    pageSize = 25;
    private orderBy?: string[];
    cols = ['adjustedOn', 'product', 'outlet', 'reason', 'oldQuantity', 'newQuantity', 'delta', 'notes'];

    outletName(id: string): string { return this.outlets().find(o => o.id === id)?.name ?? '—'; }
    productName(id: string): string { return this.products().find(p => p.id === id)?.name ?? '—'; }

    reasonLabel(r: string): string {
        switch (r) {
            case 'PhysicalCount': return 'INVENTORY.ADJUSTMENTS.LIST.REASON_PHYSICAL_COUNT';
            case 'Damage': return 'INVENTORY.ADJUSTMENTS.LIST.REASON_DAMAGE';
            case 'Loss': return 'INVENTORY.ADJUSTMENTS.LIST.REASON_LOSS';
            case 'Expiry': return 'INVENTORY.ADJUSTMENTS.LIST.REASON_EXPIRY';
            case 'Correction': return 'INVENTORY.ADJUSTMENTS.LIST.REASON_CORRECTION';
            case 'OpeningBalance': return 'INVENTORY.ADJUSTMENTS.LIST.REASON_OPENING_BALANCE';
            case 'Other': return 'INVENTORY.ADJUSTMENTS.LIST.REASON_OTHER';
            default: return 'INVENTORY.ADJUSTMENTS.LIST.REASON_OTHER';
        }
    }

    ngOnInit(): void {
        this.outletsApi.getAll().subscribe(o => {
            this.outlets.set(o);
            const remembered = this.currentOutlet.outletId();
            if (remembered && o.some(x => x.id === remembered)) this.outletFilter = remembered;
            this.load();
        });
        this.productsApi.getAll({ isActive: true }).subscribe(p => this.products.set(p));
    }

    private buildRequest(): SearchStockAdjustmentsRequest {
        return {
            pageNumber: this.pageIndex + 1,
            pageSize: this.pageSize,
            orderBy: this.orderBy,
            outletId: this.outletFilter || undefined,
            reason: this.reasonFilter === 'all' ? undefined : this.reasonFilter,
        };
    }

    load(): void {
        this.api.search(this.buildRequest()).subscribe(r => {
            this.rows.set(r.data);
            this.totalCount.set(r.totalCount);
        });
    }

    resetAndLoad(): void { this.pageIndex = 0; this.load(); }
    onPage(e: PageEvent): void { this.pageIndex = e.pageIndex; this.pageSize = e.pageSize; this.load(); }
    onSort(s: Sort): void { this.orderBy = toOrderBy(s.active, s.direction); this.resetAndLoad(); }

    openImport(): void {
        const config: ImportDialogConfig = {
            title: this._transloco.translate('INVENTORY.ADJUSTMENTS.LIST.IMPORT_DIALOG_TITLE'),
            subtitle: this._transloco.translate('INVENTORY.ADJUSTMENTS.LIST.IMPORT_DIALOG_SUBTITLE'),
            templateUrl: this.api.importTemplateUrl(),
            showModeSelector: false,
            icon: 'archive_box',
            submit: (file) => this.api.importInitialStock(file),
        };
        const ref = this.dialog.open(ImportDialogComponent, { width: '640px', data: config, disableClose: true });
        ref.afterClosed().subscribe(result => { if (result) this.load(); });
    }
}
