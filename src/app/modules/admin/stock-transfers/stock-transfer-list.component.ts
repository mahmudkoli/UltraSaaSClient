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
import { Router, RouterModule } from '@angular/router';
import { toOrderBy } from 'app/core/common/pagination.types';
import { OutletsService } from 'app/core/outlets/outlets.service';
import { OutletDto } from 'app/core/outlets/outlets.types';
import { SearchStockTransfersRequest, StockTransfersService } from 'app/core/inventory/inventory.service';
import { StockTransferDto, StockTransferStatus } from 'app/core/inventory/inventory.types';

@Component({
    selector: 'app-stock-transfer-list',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, MatButtonModule, MatFormFieldModule, MatIconModule, MatPaginatorModule, MatSelectModule, MatSortModule, MatTableModule, MatTooltipModule],
    template: `
<div class="flex flex-col flex-auto min-w-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 relative">
    <div class="absolute inset-0 opacity-5 dark:opacity-10"><div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, rgba(0,0,0,0.1) 1px, transparent 0); background-size: 20px 20px;"></div></div>
    <div class="relative z-10 flex flex-col flex-auto min-w-0">
        <div class="flex flex-col sm:flex-row space-y-16 sm:space-y-0 flex-0 sm:items-center sm:justify-between p-2 sm:py-3 sm:px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
            <div class="flex items-center space-x-4">
                <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl shadow-lg"><mat-icon class="text-white">sync_alt</mat-icon></div>
                <div>
                    <h2 class="text-3xl font-bold tracking-tight leading-7 sm:leading-10 truncate bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Stock Transfers</h2>
                    <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">Inter-outlet stock moves: dispatch, receive, reconcile</p>
                </div>
            </div>
            <div class="flex items-center gap-3">
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-44">
                    <mat-label>From outlet</mat-label>
                    <mat-select [(ngModel)]="filterFromId" (ngModelChange)="resetAndLoad()">
                        <mat-option [value]="''">All</mat-option>
                        @for (o of outlets(); track o.id) { <mat-option [value]="o.id">{{ o.name }}</mat-option> }
                    </mat-select>
                </mat-form-field>
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-44">
                    <mat-label>Status</mat-label>
                    <mat-select [(ngModel)]="statusFilter" (ngModelChange)="resetAndLoad()">
                        <mat-option value="all">All</mat-option>
                        <mat-option value="Draft">Draft</mat-option>
                        <mat-option value="InTransit">In Transit</mat-option>
                        <mat-option value="Received">Received</mat-option>
                        <mat-option value="Cancelled">Cancelled</mat-option>
                    </mat-select>
                </mat-form-field>
                <button mat-fab color="primary" routerLink="create" matTooltip="New transfer"><mat-icon>add</mat-icon></button>
            </div>
        </div>

        <div class="flex-auto p-4 sm:p-6">
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div class="relative overflow-x-auto">
                    <table mat-table matSort [dataSource]="rows()" (matSortChange)="onSort($event)" class="w-full">
                        <ng-container matColumnDef="transferNumber"><th mat-header-cell *matHeaderCellDef mat-sort-header class="pl-4 sm:pl-6"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Transfer #</span></th>
                            <td mat-cell *matCellDef="let r" class="pl-4 sm:pl-6 font-mono text-sm">{{ r.transferNumber }}</td></ng-container>
                        <ng-container matColumnDef="from"><th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">From</span></th>
                            <td mat-cell *matCellDef="let r">{{ outletName(r.fromOutletId) }}</td></ng-container>
                        <ng-container matColumnDef="to"><th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">To</span></th>
                            <td mat-cell *matCellDef="let r">{{ outletName(r.toOutletId) }}</td></ng-container>
                        <ng-container matColumnDef="createdOnUtc"><th mat-header-cell *matHeaderCellDef mat-sort-header><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Created</span></th>
                            <td mat-cell *matCellDef="let r">{{ r.createdOnUtc | date:'short' }}</td></ng-container>
                        <ng-container matColumnDef="items"><th mat-header-cell *matHeaderCellDef class="!text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Items</span></th>
                            <td mat-cell *matCellDef="let r" class="!text-right">{{ r.items.length }}</td></ng-container>
                        <ng-container matColumnDef="status"><th mat-header-cell *matHeaderCellDef mat-sort-header><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</span></th>
                            <td mat-cell *matCellDef="let r">
                                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium" [ngClass]="statusClass(r.status)">
                                    <mat-icon class="icon-size-4 mr-1">{{ statusIcon(r.status) }}</mat-icon>{{ r.status }}
                                </span>
                            </td></ng-container>
                        <ng-container matColumnDef="actions"><th mat-header-cell *matHeaderCellDef class="pr-4 sm:pr-6 !text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</span></th>
                            <td mat-cell *matCellDef="let r" class="pr-4 sm:pr-6">
                                <div class="flex items-center justify-end space-x-2">
                                    <button mat-icon-button class="text-blue-600" (click)="$event.stopPropagation(); open(r)" matTooltip="View"><mat-icon class="icon-size-5">visibility</mat-icon></button>
                                </div>
                            </td></ng-container>
                        <tr mat-header-row *matHeaderRowDef="cols" class="bg-gray-50 dark:bg-gray-700"></tr>
                        <tr mat-row *matRowDef="let row; columns: cols" class="hover:bg-blue-50 dark:hover:bg-blue-900/10 cursor-pointer" (click)="open(row)"></tr>
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
                    <div class="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6 shadow-lg"><mat-icon class="icon-size-16 text-gray-400">sync_alt</mat-icon></div>
                    <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">No transfers yet</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Create a transfer to move stock between outlets.</p>
                </div>
            </div>
        </div>
    </div>
</div>
    `,
})
export class StockTransferListComponent implements OnInit {
    private readonly api = inject(StockTransfersService);
    private readonly outletsApi = inject(OutletsService);
    private readonly router = inject(Router);

    @ViewChild(MatPaginator) paginator?: MatPaginator;
    @ViewChild(MatSort) sort?: MatSort;

    rows = signal<StockTransferDto[]>([]);
    outlets = signal<OutletDto[]>([]);
    totalCount = signal(0);

    filterFromId = '';
    statusFilter: 'all' | StockTransferStatus = 'all';

    pageIndex = 0;
    pageSize = 25;
    private orderBy?: string[];
    cols = ['transferNumber', 'from', 'to', 'createdOnUtc', 'items', 'status', 'actions'];

    outletName(id: string): string { return this.outlets().find(o => o.id === id)?.name ?? '—'; }

    statusClass(s: StockTransferStatus): Record<string, boolean> {
        return {
            'bg-gray-100 text-gray-800': s === 'Draft',
            'bg-blue-100 text-blue-800': s === 'InTransit',
            'bg-emerald-100 text-emerald-800': s === 'Received',
            'bg-red-100 text-red-800': s === 'Cancelled',
        };
    }
    statusIcon(s: StockTransferStatus): string {
        return s === 'Received' ? 'check_circle'
             : s === 'Cancelled' ? 'cancel'
             : s === 'InTransit' ? 'local_shipping'
             : 'edit';
    }

    ngOnInit(): void {
        this.outletsApi.getAll().subscribe(o => this.outlets.set(o));
        this.load();
    }

    private buildRequest(): SearchStockTransfersRequest {
        return {
            pageNumber: this.pageIndex + 1,
            pageSize: this.pageSize,
            orderBy: this.orderBy,
            fromOutletId: this.filterFromId || undefined,
            status: this.statusFilter === 'all' ? undefined : this.statusFilter,
        };
    }

    load(): void {
        this.api.search(this.buildRequest()).subscribe({
            next: r => { this.rows.set(r.data); this.totalCount.set(r.totalCount); },
        });
    }

    resetAndLoad(): void { this.pageIndex = 0; this.load(); }
    onPage(e: PageEvent): void { this.pageIndex = e.pageIndex; this.pageSize = e.pageSize; this.load(); }
    onSort(s: Sort): void { this.orderBy = toOrderBy(s.active, s.direction); this.resetAndLoad(); }
    open(r: StockTransferDto): void { this.router.navigate(['/stock-transfers', r.id]); }
}
