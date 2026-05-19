import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, inject, signal } from '@angular/core';
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
import { Router, RouterModule } from '@angular/router';
import { debounceTime, Subject } from 'rxjs';
import { toOrderBy } from 'app/core/common/pagination.types';
import { SalesService, SearchSalesRequest } from 'app/core/sales/sales.service';
import { SaleDto } from 'app/core/sales/sales.types';
import { OutletsService } from 'app/core/outlets/outlets.service';
import { OutletDto } from 'app/core/outlets/outlets.types';
import { CurrentOutletService } from 'app/core/outlets/current-outlet.service';

@Component({
    selector: 'app-sales-list',
    standalone: true,
    imports: [
        CommonModule, FormsModule, RouterModule,
        MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule,
        MatPaginatorModule, MatSelectModule, MatSortModule, MatTableModule, MatTooltipModule,
    ],
    template: `
<div class="flex flex-col flex-auto min-w-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 relative">
    <div class="absolute inset-0 opacity-5 dark:opacity-10"><div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, rgba(0,0,0,0.1) 1px, transparent 0); background-size: 20px 20px;"></div></div>
    <div class="relative z-10 flex flex-col flex-auto min-w-0">
        <div class="flex flex-col sm:flex-row space-y-16 sm:space-y-0 flex-0 sm:items-center sm:justify-between p-2 sm:py-3 sm:px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
            <div class="flex items-center space-x-4">
                <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl shadow-lg"><mat-icon class="text-white">receipt_long</mat-icon></div>
                <div>
                    <h2 class="text-3xl font-bold tracking-tight leading-7 sm:leading-10 truncate bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Sales</h2>
                    <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">Finalized invoices, refunds, and voided sales</p>
                </div>
            </div>
            <div class="flex flex-col w-full sm:w-auto sm:flex-row space-y-16 sm:space-y-0 flex-1 sm:flex-none sm:items-center sm:justify-end gap-4">
                <mat-form-field class="w-full sm:w-auto sm:min-w-72" appearance="outline" subscriptSizing="dynamic">
                    <mat-label>Search invoices</mat-label>
                    <input #searchInput matInput
                           [(ngModel)]="search"
                           (ngModelChange)="searchChanged.next($event)"
                           (keyup.enter)="onSearchEnter()"
                           placeholder="Invoice / customer · scan barcode">
                    <mat-icon matSuffix class="text-gray-400" matTooltip="Tip: scan a receipt's barcode here — exact invoice match jumps straight to the sale detail.">qr_code_scanner</mat-icon>
                </mat-form-field>
                <mat-form-field class="w-full sm:w-auto sm:min-w-48" appearance="outline" subscriptSizing="dynamic">
                    <mat-label>Outlet</mat-label>
                    <mat-select [(ngModel)]="outletFilter" (ngModelChange)="resetAndLoad()">
                        <mat-option [value]="''">All outlets</mat-option>
                        @for (o of outlets(); track o.id) {
                            <mat-option [value]="o.id">{{ o.name }}</mat-option>
                        }
                    </mat-select>
                </mat-form-field>
                <mat-form-field class="w-full sm:w-auto sm:min-w-44" appearance="outline" subscriptSizing="dynamic">
                    <mat-label>Status</mat-label>
                    <mat-select [(ngModel)]="statusFilter" (ngModelChange)="resetAndLoad()">
                        <mat-option value="all">All Status</mat-option>
                        <mat-option value="Finalized">Finalized</mat-option>
                        <mat-option value="Voided">Voided</mat-option>
                        <mat-option value="Draft">Draft</mat-option>
                    </mat-select>
                </mat-form-field>
                <button mat-fab color="primary" routerLink="/pos" matTooltip="Open POS"><mat-icon>point_of_sale</mat-icon></button>
            </div>
        </div>

        <div class="flex-auto p-4 sm:p-6">
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div class="relative overflow-x-auto">
                    <table mat-table matSort [dataSource]="rows()" (matSortChange)="onSort($event)" class="w-full">
                        <ng-container matColumnDef="invoiceNumber"><th mat-header-cell *matHeaderCellDef mat-sort-header class="pl-4 sm:pl-6"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</span></th>
                            <td mat-cell *matCellDef="let r" class="pl-4 sm:pl-6 font-mono text-sm">{{ r.invoiceNumber }}</td></ng-container>
                        <ng-container matColumnDef="saleDate"><th mat-header-cell *matHeaderCellDef mat-sort-header><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Date</span></th>
                            <td mat-cell *matCellDef="let r">{{ r.saleDate | date:'short' }}</td></ng-container>
                        <ng-container matColumnDef="customerName"><th mat-header-cell *matHeaderCellDef mat-sort-header><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</span></th>
                            <td mat-cell *matCellDef="let r">
                                <div class="flex flex-col">
                                    <span class="text-sm font-medium text-gray-900 dark:text-white">{{ r.customerName || 'Walk-in' }}</span>
                                    <span class="text-xs text-gray-500">{{ r.customerPhone || '—' }}</span>
                                </div>
                            </td></ng-container>
                        <ng-container matColumnDef="items"><th mat-header-cell *matHeaderCellDef class="!text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Items</span></th>
                            <td mat-cell *matCellDef="let r" class="!text-right">{{ r.items.length }}</td></ng-container>
                        <ng-container matColumnDef="total"><th mat-header-cell *matHeaderCellDef mat-sort-header class="!text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Total</span></th>
                            <td mat-cell *matCellDef="let r" class="!text-right font-semibold">{{ r.total | number:'1.2-2' }}</td></ng-container>
                        <ng-container matColumnDef="status"><th mat-header-cell *matHeaderCellDef mat-sort-header><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</span></th>
                            <td mat-cell *matCellDef="let r">
                                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                                      [ngClass]="{
                                        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': r.status === 'Finalized',
                                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200': r.status === 'Voided',
                                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200': r.status === 'Draft'
                                      }">
                                    <mat-icon class="icon-size-4 mr-1">{{ statusIcon(r.status) }}</mat-icon>{{ r.status }}
                                </span>
                            </td></ng-container>
                        <ng-container matColumnDef="actions"><th mat-header-cell *matHeaderCellDef class="pr-4 sm:pr-6 !text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</span></th>
                            <td mat-cell *matCellDef="let r" class="pr-4 sm:pr-6">
                                <div class="flex items-center justify-end space-x-2">
                                    <button mat-icon-button class="text-blue-600" (click)="$event.stopPropagation(); view(r)" matTooltip="View"><mat-icon class="icon-size-5">visibility</mat-icon></button>
                                </div>
                            </td></ng-container>
                        <tr mat-header-row *matHeaderRowDef="cols" class="bg-gray-50 dark:bg-gray-700"></tr>
                        <tr mat-row *matRowDef="let row; columns: cols" class="hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors cursor-pointer" (click)="view(row)"></tr>
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
                    <div class="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center mb-6 shadow-lg"><mat-icon class="icon-size-16 text-gray-400">receipt_long</mat-icon></div>
                    <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">No sales yet</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">Open the POS to ring up your first sale.</p>
                    <button mat-flat-button color="primary" routerLink="/pos"><mat-icon class="icon-size-5 mr-2">point_of_sale</mat-icon><span>Open POS</span></button>
                </div>
            </div>
        </div>
    </div>
</div>
    `,
})
export class SalesListComponent implements OnInit, AfterViewInit {
    private readonly api = inject(SalesService);
    private readonly outletsApi = inject(OutletsService);
    private readonly currentOutlet = inject(CurrentOutletService);
    private readonly router = inject(Router);

    @ViewChild(MatPaginator) paginator?: MatPaginator;
    @ViewChild(MatSort) sort?: MatSort;
    @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;
    /** Set right before a load() so we can auto-navigate to a single-match
     *  scan result. Reset after navigation or once the user types again. */
    private pendingScanQuery: string | null = null;

    outlets = signal<OutletDto[]>([]);
    rows = signal<SaleDto[]>([]);
    loading = signal(true);
    totalCount = signal(0);

    outletFilter = '';
    search = '';
    statusFilter: 'all' | 'Draft' | 'Finalized' | 'Voided' = 'all';

    pageIndex = 0;
    pageSize = 25;
    private orderBy?: string[];

    cols = ['invoiceNumber', 'saleDate', 'customerName', 'items', 'total', 'status', 'actions'];

    /** Debounce keystrokes so we don't fire a request per character. */
    searchChanged = new Subject<string>();

    statusIcon(s: string): string {
        return s === 'Finalized' ? 'check_circle' : s === 'Voided' ? 'cancel' : 'schedule';
    }

    ngOnInit(): void {
        this.searchChanged.pipe(debounceTime(300)).subscribe(() => {
            // Typing resets the scan-jump intent — only Enter / paste a barcode triggers single-match navigation.
            this.pendingScanQuery = null;
            this.resetAndLoad();
        });
        this.outletsApi.getAll().subscribe(o => {
            this.outlets.set(o);
            const remembered = this.currentOutlet.outletId();
            if (remembered && o.some(x => x.id === remembered)) this.outletFilter = remembered;
            this.load();
        });
    }

    /**
     * Auto-focus the search field on page load so a handheld barcode scanner
     * can fire straight into it without the cashier having to click first.
     * Mirrors the existing POS toolbar pattern.
     */
    ngAfterViewInit(): void {
        setTimeout(() => this.searchInput?.nativeElement.focus(), 0);
    }

    /**
     * Barcode scanners emit a fast keystroke burst terminated by Enter.
     * On Enter we (1) skip the 300ms debounce and search immediately, and
     * (2) flag the load so a single-row exact-invoice match auto-navigates
     * to that sale's detail — closing the receipt-barcode → sale-detail loop.
     */
    onSearchEnter(): void {
        const q = this.search.trim();
        if (!q) return;
        this.pendingScanQuery = q;
        this.resetAndLoad();
    }

    private buildRequest(): SearchSalesRequest {
        return {
            pageNumber: this.pageIndex + 1,
            pageSize: this.pageSize,
            orderBy: this.orderBy,
            keyword: this.search.trim() || undefined,
            outletId: this.outletFilter || undefined,
            status: this.statusFilter === 'all' ? undefined : this.statusFilter,
        };
    }

    load(): void {
        this.loading.set(true);
        const scanQuery = this.pendingScanQuery;
        this.pendingScanQuery = null; // one-shot — clear before request resolves
        this.api.search(this.buildRequest()).subscribe({
            next: r => {
                this.rows.set(r.data);
                this.totalCount.set(r.totalCount);
                this.loading.set(false);
                // Scan close-the-loop: if Enter was pressed and exactly one
                // result with an exact invoice match, jump straight to it.
                // Case-insensitive — invoice numbers are uppercase anyway.
                if (scanQuery && r.data.length === 1) {
                    const only = r.data[0];
                    if (only.invoiceNumber?.toUpperCase() === scanQuery.toUpperCase()) {
                        this.router.navigate(['/sales', only.id]);
                    }
                }
            },
            error: () => this.loading.set(false),
        });
    }

    resetAndLoad(): void {
        this.pageIndex = 0;
        this.load();
    }

    onPage(e: PageEvent): void {
        this.pageIndex = e.pageIndex;
        this.pageSize = e.pageSize;
        this.load();
    }

    onSort(s: Sort): void {
        this.orderBy = toOrderBy(s.active, s.direction);
        this.resetAndLoad();
    }

    view(r: SaleDto): void { this.router.navigate(['/sales', r.id]); }
}
