import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { ProductsService } from 'app/core/catalog/catalog.service';
import { ProductDto } from 'app/core/catalog/catalog.types';
import { StocksService } from 'app/core/inventory/inventory.service';
import { StockDto } from 'app/core/inventory/inventory.types';
import { CurrentOutletService } from 'app/core/outlets/current-outlet.service';
import { OutletsService } from 'app/core/outlets/outlets.service';
import { OutletDto } from 'app/core/outlets/outlets.types';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { StockAdjustmentsService } from 'app/core/inventory/inventory.service';
import { ImportDialogComponent, ImportDialogConfig } from 'app/core/import/import-dialog.component';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';

interface StockRow {
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    reorderLevel: number;
    lastMovementOn?: string;
    isBelow: boolean;
}

@Component({
    selector: 'app-stock-list',
    standalone: true,
    imports: [
        CommonModule, FormsModule, RouterModule,
        MatButtonModule, MatDialogModule, MatFormFieldModule, MatIconModule, MatInputModule,
        MatSelectModule, MatTableModule, MatTooltipModule,
        TranslocoModule,
    ],
    template: `
<div class="flex flex-col flex-auto min-w-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 relative">
    <div class="absolute inset-0 opacity-5 dark:opacity-10"><div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, rgba(0,0,0,0.1) 1px, transparent 0); background-size: 20px 20px;"></div></div>
    <div class="relative z-10 flex flex-col flex-auto min-w-0">
        <div class="flex flex-col sm:flex-row space-y-16 sm:space-y-0 flex-0 sm:items-center sm:justify-between p-2 sm:py-3 sm:px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
            <div class="flex items-center space-x-4">
                <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl shadow-lg"><mat-icon class="text-white">inventory</mat-icon></div>
                <div>
                    <h2 class="text-3xl font-bold tracking-tight leading-7 sm:leading-10 truncate bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">{{ 'INVENTORY.STOCK.LIST.TITLE' | transloco }}</h2>
                    <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">{{ 'INVENTORY.STOCK.LIST.SUBTITLE' | transloco }}</p>
                </div>
            </div>
            <div class="flex flex-col w-full sm:w-auto sm:flex-row space-y-16 sm:space-y-0 flex-1 sm:flex-none sm:items-center sm:justify-end gap-4">
                <mat-form-field class="w-full sm:w-auto sm:min-w-72" appearance="outline" subscriptSizing="dynamic">
                    <mat-label>{{ 'INVENTORY.STOCK.LIST.SEARCH_LABEL' | transloco }}</mat-label>
                    <input matInput [(ngModel)]="search" [placeholder]="'INVENTORY.STOCK.LIST.SEARCH_PLACEHOLDER' | transloco">
                    <mat-icon matSuffix class="text-gray-400">search</mat-icon>
                </mat-form-field>
                <mat-form-field class="w-full sm:w-auto sm:min-w-48" appearance="outline" subscriptSizing="dynamic">
                    <mat-label>{{ 'INVENTORY.STOCK.LIST.OUTLET_LABEL' | transloco }}</mat-label>
                    <mat-select [(ngModel)]="outletId" (ngModelChange)="onOutletChange()">
                        @for (o of outlets(); track o.id) { <mat-option [value]="o.id">{{ o.name }}</mat-option> }
                    </mat-select>
                </mat-form-field>
                <mat-form-field class="w-full sm:w-auto sm:min-w-48" appearance="outline" subscriptSizing="dynamic">
                    <mat-label>{{ 'INVENTORY.STOCK.LIST.SHOW_LABEL' | transloco }}</mat-label>
                    <mat-select [(ngModel)]="showFilter">
                        <mat-option value="all">{{ 'INVENTORY.STOCK.LIST.SHOW_ALL' | transloco }}</mat-option>
                        <mat-option value="below">{{ 'INVENTORY.STOCK.LIST.SHOW_BELOW' | transloco }}</mat-option>
                        <mat-option value="zero">{{ 'INVENTORY.STOCK.LIST.SHOW_ZERO' | transloco }}</mat-option>
                        <mat-option value="positive">{{ 'INVENTORY.STOCK.LIST.SHOW_POSITIVE' | transloco }}</mat-option>
                    </mat-select>
                </mat-form-field>
                <button mat-stroked-button class="!h-12 !px-4" (click)="openImport()" [matTooltip]="'INVENTORY.STOCK.LIST.IMPORT_TOOLTIP' | transloco">
                    <mat-icon class="icon-size-5 mr-1">cloud_upload</mat-icon><span>{{ 'INVENTORY.STOCK.LIST.IMPORT_BUTTON' | transloco }}</span>
                </button>
            </div>
        </div>
        <div class="flex-auto p-4 sm:p-6">
            <!-- Onboarding nudge: products exist but nobody has loaded stock at this outlet yet.
                 Disappears once any stock row at this outlet is non-zero. -->
            @if (!loading() && needsOpeningBalance()) {
                <div class="mb-4 rounded-2xl border-2 border-dashed border-indigo-300 dark:border-indigo-700 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-5 flex items-start gap-4">
                    <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <mat-icon class="text-white">rocket_launch</mat-icon>
                    </div>
                    <div class="flex-1">
                        <h3 class="text-base font-semibold text-gray-900 dark:text-white">{{ 'INVENTORY.STOCK.LIST.NUDGE_TITLE' | transloco }}</h3>
                        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            @if (products().length === 1) {
                                {{ 'INVENTORY.STOCK.LIST.NUDGE_BODY_ONE' | transloco:{ count: products().length, outlet: currentOutletName() } }}
                            } @else {
                                {{ 'INVENTORY.STOCK.LIST.NUDGE_BODY_MANY' | transloco:{ count: products().length, outlet: currentOutletName() } }}
                            }
                        </p>
                        <div class="flex items-center gap-2 mt-3">
                            <button mat-flat-button color="primary" (click)="openImport()">
                                <mat-icon class="icon-size-5 mr-1">cloud_upload</mat-icon><span>{{ 'INVENTORY.STOCK.LIST.NUDGE_IMPORT_BUTTON' | transloco }}</span>
                            </button>
                            <button mat-stroked-button routerLink="/stock-adjustments/create">
                                <mat-icon class="icon-size-5 mr-1">edit</mat-icon><span>{{ 'INVENTORY.STOCK.LIST.NUDGE_ADJUSTMENT_BUTTON' | transloco }}</span>
                            </button>
                        </div>
                    </div>
                </div>
            }
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div class="relative overflow-x-auto">
                    <table mat-table [dataSource]="filtered()" class="w-full">
                        <ng-container matColumnDef="sku"><th mat-header-cell *matHeaderCellDef class="pl-4 sm:pl-6"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'INVENTORY.STOCK.LIST.COL_SKU' | transloco }}</span></th>
                            <td mat-cell *matCellDef="let r" class="pl-4 sm:pl-6 font-mono text-xs">{{ r.sku }}</td></ng-container>
                        <ng-container matColumnDef="name"><th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'INVENTORY.STOCK.LIST.COL_PRODUCT' | transloco }}</span></th>
                            <td mat-cell *matCellDef="let r" class="font-medium">{{ r.productName }}</td></ng-container>
                        <ng-container matColumnDef="qty"><th mat-header-cell *matHeaderCellDef class="!text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'INVENTORY.STOCK.LIST.COL_ON_HAND' | transloco }}</span></th>
                            <td mat-cell *matCellDef="let r" class="!text-right font-semibold"
                                [ngClass]="{ 'text-rose-600 dark:text-rose-400': r.quantity <= 0, 'text-amber-600 dark:text-amber-400': r.quantity > 0 && r.isBelow }">
                                {{ r.quantity | number:'1.0-3' }}
                            </td></ng-container>
                        <ng-container matColumnDef="reorder"><th mat-header-cell *matHeaderCellDef class="!text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'INVENTORY.STOCK.LIST.COL_REORDER' | transloco }}</span></th>
                            <td mat-cell *matCellDef="let r" class="!text-right text-gray-500">{{ r.reorderLevel | number:'1.0-2' }}</td></ng-container>
                        <ng-container matColumnDef="last"><th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'INVENTORY.STOCK.LIST.COL_LAST_MOVEMENT' | transloco }}</span></th>
                            <td mat-cell *matCellDef="let r" class="text-gray-600 dark:text-gray-400">{{ r.lastMovementOn ? (r.lastMovementOn | date:'short') : '—' }}</td></ng-container>
                        <ng-container matColumnDef="status"><th mat-header-cell *matHeaderCellDef class="pr-4 sm:pr-6"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'INVENTORY.STOCK.LIST.COL_STATUS' | transloco }}</span></th>
                            <td mat-cell *matCellDef="let r" class="pr-4 sm:pr-6">
                                @if (r.quantity <= 0) {
                                    <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"><mat-icon class="icon-size-4 mr-1">cancel</mat-icon>{{ 'INVENTORY.STOCK.LIST.STATUS_OUT' | transloco }}</span>
                                } @else if (r.isBelow) {
                                    <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"><mat-icon class="icon-size-4 mr-1">warning</mat-icon>{{ 'INVENTORY.STOCK.LIST.STATUS_LOW' | transloco }}</span>
                                } @else {
                                    <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"><mat-icon class="icon-size-4 mr-1">check_circle</mat-icon>{{ 'INVENTORY.STOCK.LIST.STATUS_OK' | transloco }}</span>
                                }
                            </td></ng-container>
                        <tr mat-header-row *matHeaderRowDef="cols" class="bg-gray-50 dark:bg-gray-700"></tr>
                        <tr mat-row *matRowDef="let row; columns: cols" class="hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors"></tr>
                    </table>
                </div>
                <div *ngIf="!loading() && filtered().length === 0" class="flex flex-col items-center justify-center p-12">
                    <div class="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center mb-6 shadow-lg"><mat-icon class="icon-size-16 text-gray-400">inventory</mat-icon></div>
                    <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">{{ 'INVENTORY.STOCK.LIST.EMPTY_TITLE' | transloco }}</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400">{{ 'INVENTORY.STOCK.LIST.EMPTY_SUBTITLE' | transloco }}</p>
                </div>
            </div>
        </div>
    </div>
</div>
    `,
})
export class StockListComponent implements OnInit {
    private readonly stocksApi = inject(StocksService);
    private readonly stockAdjustmentsApi = inject(StockAdjustmentsService);
    private readonly productsApi = inject(ProductsService);
    private readonly outletsApi = inject(OutletsService);
    private readonly currentOutlet = inject(CurrentOutletService);
    private readonly dialog = inject(MatDialog);
    private readonly _transloco = inject(TranslocoService);

    outlets = signal<OutletDto[]>([]);
    products = signal<ProductDto[]>([]);
    stocks = signal<StockDto[]>([]);
    loading = signal(true);
    outletId: string | null = null;
    search = '';
    showFilter: 'all' | 'below' | 'zero' | 'positive' = 'all';
    cols = ['sku', 'name', 'qty', 'reorder', 'last', 'status'];

    rows = computed<StockRow[]>(() => {
        const stockMap = new Map(this.stocks().map(s => [s.productId, s]));
        return this.products().filter(p => p.isActive).map<StockRow>(p => {
            const s = stockMap.get(p.id);
            const qty = s?.quantity ?? 0;
            const reorder = p.reorderLevel ?? 0;
            return {
                productId: p.id,
                productName: p.name,
                sku: p.sku,
                quantity: qty,
                reorderLevel: reorder,
                lastMovementOn: s?.lastMovementOn,
                isBelow: reorder > 0 && qty < reorder,
            };
        });
    });

    filtered = computed<StockRow[]>(() => {
        const q = this.search.trim().toLowerCase();
        return this.rows().filter(r => {
            if (this.showFilter === 'below' && !r.isBelow) return false;
            if (this.showFilter === 'zero' && r.quantity > 0) return false;
            if (this.showFilter === 'positive' && r.quantity <= 0) return false;
            if (q && !r.productName.toLowerCase().includes(q) && !r.sku.toLowerCase().includes(q)) return false;
            return true;
        });
    });

    ngOnInit(): void {
        this.outletsApi.getAll().subscribe(o => {
            this.outlets.set(o);
            const remembered = this.currentOutlet.outletId();
            this.outletId = (remembered && o.some(x => x.id === remembered)) ? remembered : (o[0]?.id ?? null);
            this.productsApi.getAll({ isActive: true }).subscribe(p => {
                this.products.set(p);
                this.load();
            });
        });
    }

    onOutletChange(): void {
        this.currentOutlet.set(this.outletId);
        this.load();
    }

    load(): void {
        if (!this.outletId) { this.loading.set(false); return; }
        this.loading.set(true);
        this.stocksApi.byOutlet(this.outletId).subscribe({
            next: d => { this.stocks.set(d); this.loading.set(false); },
            error: () => this.loading.set(false),
        });
    }

    /** True when the tenant has products but no stock has been loaded for this
     * outlet yet — the natural state on day 1 of onboarding. Drives the
     * empty-state nudge. */
    needsOpeningBalance = computed(() =>
        this.products().length > 0 && this.stocks().every(s => s.quantity <= 0)
    );

    currentOutletName = computed(() =>
        this.outlets().find(o => o.id === this.outletId)?.name ?? this._transloco.translate('INVENTORY.STOCK.LIST.THIS_OUTLET_FALLBACK')
    );

    openImport(): void {
        const config: ImportDialogConfig = {
            title: this._transloco.translate('INVENTORY.STOCK.LIST.IMPORT_DIALOG_TITLE'),
            subtitle: this._transloco.translate('INVENTORY.STOCK.LIST.IMPORT_DIALOG_SUBTITLE'),
            templateUrl: this.stockAdjustmentsApi.importTemplateUrl(),
            showModeSelector: false,
            icon: 'archive_box',
            submit: (file) => this.stockAdjustmentsApi.importInitialStock(file),
        };
        const ref = this.dialog.open(ImportDialogComponent, { width: '640px', data: config, disableClose: true });
        ref.afterClosed().subscribe(result => { if (result) this.load(); });
    }
}
