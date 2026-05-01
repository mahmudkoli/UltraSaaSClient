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
import { Router, RouterModule } from '@angular/router';
import { debounceTime, Subject } from 'rxjs';
import { toOrderBy } from 'app/core/common/pagination.types';
import { PurchaseReturnsService, SearchPurchaseReturnsRequest } from 'app/core/purchasing/purchasing.service';
import { PurchaseReturnDto, PurchaseReturnStatus } from 'app/core/purchasing/purchasing.types';
import { OutletsService } from 'app/core/outlets/outlets.service';
import { OutletDto } from 'app/core/outlets/outlets.types';
import { CurrentOutletService } from 'app/core/outlets/current-outlet.service';

@Component({
    selector: 'app-purchase-return-list',
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
                <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl shadow-lg"><mat-icon class="text-white">assignment_return</mat-icon></div>
                <div>
                    <h2 class="text-3xl font-bold tracking-tight leading-7 sm:leading-10 truncate bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Purchase Returns</h2>
                    <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">Goods sent back to suppliers — damaged, wrong, expired, or excess</p>
                </div>
            </div>
            <div class="flex flex-col w-full sm:w-auto sm:flex-row space-y-16 sm:space-y-0 flex-1 sm:flex-none sm:items-center sm:justify-end gap-4">
                <mat-form-field class="w-full sm:w-auto sm:min-w-72" appearance="outline" subscriptSizing="dynamic">
                    <mat-label>Search</mat-label>
                    <input matInput [(ngModel)]="search" (ngModelChange)="searchChanged.next($event)" placeholder="PR # / receipt # / PO #">
                    <mat-icon matSuffix class="text-gray-400">search</mat-icon>
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
                        <mat-option value="Draft">Draft</mat-option>
                        <mat-option value="Completed">Completed</mat-option>
                        <mat-option value="Voided">Voided</mat-option>
                    </mat-select>
                </mat-form-field>
                <button mat-fab color="primary" routerLink="/goods-receipts" matTooltip="Pick a receipt to return"><mat-icon>local_shipping</mat-icon></button>
            </div>
        </div>

        <div class="flex-auto p-4 sm:p-6">
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div class="relative overflow-x-auto">
                    <table mat-table matSort [dataSource]="rows()" (matSortChange)="onSort($event)" class="w-full">
                        <ng-container matColumnDef="returnNumber"><th mat-header-cell *matHeaderCellDef mat-sort-header class="pl-4 sm:pl-6"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">PR #</span></th>
                            <td mat-cell *matCellDef="let r" class="pl-4 sm:pl-6 font-mono text-sm">{{ r.returnNumber }}</td></ng-container>
                        <ng-container matColumnDef="receipt"><th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt</span></th>
                            <td mat-cell *matCellDef="let r"><a class="text-blue-600 hover:underline font-mono text-xs" [routerLink]="['/goods-receipts', r.goodsReceiptId]" (click)="$event.stopPropagation()">{{ r.originalReceiptNumber }}</a></td></ng-container>
                        <ng-container matColumnDef="po"><th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">PO</span></th>
                            <td mat-cell *matCellDef="let r" class="font-mono text-xs text-gray-500">{{ r.originalPONumber }}</td></ng-container>
                        <ng-container matColumnDef="returnDate"><th mat-header-cell *matHeaderCellDef mat-sort-header><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Date</span></th>
                            <td mat-cell *matCellDef="let r">{{ r.returnDate | date:'short' }}</td></ng-container>
                        <ng-container matColumnDef="reason"><th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</span></th>
                            <td mat-cell *matCellDef="let r">{{ r.reason }}</td></ng-container>
                        <ng-container matColumnDef="items"><th mat-header-cell *matHeaderCellDef class="!text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Items</span></th>
                            <td mat-cell *matCellDef="let r" class="!text-right">{{ r.items.length }}</td></ng-container>
                        <ng-container matColumnDef="total"><th mat-header-cell *matHeaderCellDef mat-sort-header class="!text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Credit</span></th>
                            <td mat-cell *matCellDef="let r" class="!text-right font-semibold text-orange-600 dark:text-orange-400">{{ r.total | number:'1.2-2' }}</td></ng-container>
                        <ng-container matColumnDef="status"><th mat-header-cell *matHeaderCellDef mat-sort-header><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</span></th>
                            <td mat-cell *matCellDef="let r">
                                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                                      [ngClass]="{
                                        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': r.status === 'Completed',
                                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200': r.status === 'Voided',
                                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200': r.status === 'Draft'
                                      }">
                                    <mat-icon class="icon-size-4 mr-1">{{ r.status === 'Completed' ? 'check_circle' : r.status === 'Voided' ? 'cancel' : 'schedule' }}</mat-icon>{{ r.status }}
                                </span>
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
                    <div class="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center mb-6 shadow-lg"><mat-icon class="icon-size-16 text-gray-400">assignment_return</mat-icon></div>
                    <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">No purchase returns yet</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">Returns are created from a Completed goods receipt. Open a receipt and use "Send back to supplier".</p>
                    <button mat-flat-button color="primary" routerLink="/goods-receipts"><mat-icon class="icon-size-5 mr-2">local_shipping</mat-icon><span>Browse Goods Receipts</span></button>
                </div>
            </div>
        </div>
    </div>
</div>
    `,
})
export class PurchaseReturnListComponent implements OnInit {
    private readonly api = inject(PurchaseReturnsService);
    private readonly outletsApi = inject(OutletsService);
    private readonly currentOutlet = inject(CurrentOutletService);
    private readonly router = inject(Router);

    @ViewChild(MatPaginator) paginator?: MatPaginator;
    @ViewChild(MatSort) sort?: MatSort;

    rows = signal<PurchaseReturnDto[]>([]);
    outlets = signal<OutletDto[]>([]);
    loading = signal(true);
    totalCount = signal(0);

    search = '';
    outletFilter = '';
    statusFilter: 'all' | PurchaseReturnStatus = 'all';

    pageIndex = 0;
    pageSize = 25;
    private orderBy?: string[];

    cols = ['returnNumber', 'receipt', 'po', 'returnDate', 'reason', 'items', 'total', 'status'];
    searchChanged = new Subject<string>();

    ngOnInit(): void {
        this.searchChanged.pipe(debounceTime(300)).subscribe(() => this.resetAndLoad());
        this.outletsApi.getAll().subscribe(o => {
            this.outlets.set(o);
            const remembered = this.currentOutlet.outletId();
            if (remembered && o.some(x => x.id === remembered)) this.outletFilter = remembered;
            this.load();
        });
    }

    private buildRequest(): SearchPurchaseReturnsRequest {
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
        this.api.search(this.buildRequest()).subscribe({
            next: r => { this.rows.set(r.data); this.totalCount.set(r.totalCount); this.loading.set(false); },
            error: () => this.loading.set(false),
        });
    }

    resetAndLoad(): void { this.pageIndex = 0; this.load(); }
    onPage(e: PageEvent): void { this.pageIndex = e.pageIndex; this.pageSize = e.pageSize; this.load(); }
    onSort(s: Sort): void { this.orderBy = toOrderBy(s.active, s.direction); this.resetAndLoad(); }
}
