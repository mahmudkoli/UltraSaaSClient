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
import { debounceTime, Subject } from 'rxjs';
import { toOrderBy } from 'app/core/common/pagination.types';
import { PromotionsService, SearchPromotionsRequest } from 'app/core/marketing/marketing.service';
import { PromotionDto } from 'app/core/marketing/marketing.types';

@Component({
    selector: 'app-promotion-list',
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
                <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-pink-500 to-fuchsia-600 rounded-xl shadow-lg"><mat-icon class="text-white">local_offer</mat-icon></div>
                <div>
                    <h2 class="text-3xl font-bold tracking-tight leading-7 sm:leading-10 truncate bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Promotions</h2>
                    <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">Discount codes, BOGO, cart and product offers</p>
                </div>
            </div>
            <div class="flex flex-col w-full sm:w-auto sm:flex-row space-y-16 sm:space-y-0 flex-1 sm:flex-none sm:items-center sm:justify-end gap-4">
                <mat-form-field class="w-full sm:w-auto sm:min-w-72" appearance="outline" subscriptSizing="dynamic">
                    <mat-label>Search</mat-label>
                    <input matInput [(ngModel)]="search" (ngModelChange)="searchChanged.next($event)" placeholder="Code or name">
                    <mat-icon matSuffix class="text-gray-400">search</mat-icon>
                </mat-form-field>
                <mat-form-field class="w-full sm:w-auto sm:min-w-44" appearance="outline" subscriptSizing="dynamic">
                    <mat-label>Status</mat-label>
                    <mat-select [(ngModel)]="statusFilter" (ngModelChange)="resetAndLoad()">
                        <mat-option value="all">All</mat-option>
                        <mat-option value="active">Active only</mat-option>
                        <mat-option value="inactive">Inactive only</mat-option>
                    </mat-select>
                </mat-form-field>
                <mat-form-field class="w-full sm:w-auto sm:min-w-44" appearance="outline" subscriptSizing="dynamic">
                    <mat-label>Type</mat-label>
                    <mat-select [(ngModel)]="typeFilter" (ngModelChange)="resetAndLoad()">
                        <mat-option value="all">All</mat-option>
                        <mat-option value="PercentageOff">% Off</mat-option>
                        <mat-option value="FixedAmountOff">Fixed Off</mat-option>
                        <mat-option value="BuyXGetY">BOGO</mat-option>
                    </mat-select>
                </mat-form-field>
                <button mat-fab color="primary" routerLink="create" matTooltip="New promotion"><mat-icon>add</mat-icon></button>
            </div>
        </div>

        <div class="flex-auto p-4 sm:p-6">
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div class="relative overflow-x-auto">
                    <table mat-table matSort [dataSource]="rows()" (matSortChange)="onSort($event)" class="w-full">
                        <ng-container matColumnDef="code"><th mat-header-cell *matHeaderCellDef mat-sort-header class="pl-4 sm:pl-6"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Code</span></th>
                            <td mat-cell *matCellDef="let r" class="pl-4 sm:pl-6 font-mono text-sm font-semibold">{{ r.code }}</td></ng-container>
                        <ng-container matColumnDef="name"><th mat-header-cell *matHeaderCellDef mat-sort-header><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Name</span></th>
                            <td mat-cell *matCellDef="let r">
                                <div class="flex flex-col">
                                    <span class="text-sm font-medium text-gray-900 dark:text-white">{{ r.name }}</span>
                                    <span class="text-xs text-gray-500" *ngIf="r.description">{{ r.description }}</span>
                                </div>
                            </td></ng-container>
                        <ng-container matColumnDef="type"><th mat-header-cell *matHeaderCellDef mat-sort-header><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Type</span></th>
                            <td mat-cell *matCellDef="let r">
                                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200">{{ r.type }}</span>
                            </td></ng-container>
                        <ng-container matColumnDef="scope"><th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Scope</span></th>
                            <td mat-cell *matCellDef="let r">{{ r.scope }}</td></ng-container>
                        <ng-container matColumnDef="value"><th mat-header-cell *matHeaderCellDef class="!text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Value</span></th>
                            <td mat-cell *matCellDef="let r" class="!text-right font-medium">{{ valueLabel(r) }}</td></ng-container>
                        <ng-container matColumnDef="window"><th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Window</span></th>
                            <td mat-cell *matCellDef="let r" class="text-xs text-gray-600 dark:text-gray-400">
                                {{ r.startDate ? (r.startDate | date:'shortDate') : '—' }} → {{ r.endDate ? (r.endDate | date:'shortDate') : '—' }}
                            </td></ng-container>
                        <ng-container matColumnDef="usage"><th mat-header-cell *matHeaderCellDef class="!text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Used</span></th>
                            <td mat-cell *matCellDef="let r" class="!text-right">{{ r.usageCount }}{{ r.usageLimit ? ' / ' + r.usageLimit : '' }}</td></ng-container>
                        <ng-container matColumnDef="status"><th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</span></th>
                            <td mat-cell *matCellDef="let r">
                                <span *ngIf="r.isCurrentlyValid" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"><mat-icon class="icon-size-4 mr-1">check_circle</mat-icon>Valid</span>
                                <span *ngIf="!r.isCurrentlyValid" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"><mat-icon class="icon-size-4 mr-1">block</mat-icon>Inactive</span>
                            </td></ng-container>
                        <ng-container matColumnDef="actions"><th mat-header-cell *matHeaderCellDef class="pr-4 sm:pr-6 !text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</span></th>
                            <td mat-cell *matCellDef="let r" class="pr-4 sm:pr-6">
                                <div class="flex items-center justify-end space-x-2">
                                    <button mat-icon-button class="text-blue-600" [routerLink]="[r.id]" matTooltip="Edit"><mat-icon class="icon-size-5">edit</mat-icon></button>
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
                    <div class="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center mb-6 shadow-lg"><mat-icon class="icon-size-16 text-gray-400">local_offer</mat-icon></div>
                    <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">No promotions yet</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">Create a promotion to offer discounts at checkout.</p>
                    <button mat-flat-button color="primary" routerLink="create"><mat-icon class="icon-size-5 mr-2">add_circle</mat-icon><span>New Promotion</span></button>
                </div>
            </div>
        </div>
    </div>
</div>
    `,
})
export class PromotionListComponent implements OnInit {
    private readonly api = inject(PromotionsService);

    @ViewChild(MatPaginator) paginator?: MatPaginator;
    @ViewChild(MatSort) sort?: MatSort;

    rows = signal<PromotionDto[]>([]);
    loading = signal(true);
    totalCount = signal(0);

    search = '';
    statusFilter: 'all' | 'active' | 'inactive' = 'all';
    typeFilter: 'all' | 'PercentageOff' | 'FixedAmountOff' | 'BuyXGetY' = 'all';

    pageIndex = 0;
    pageSize = 25;
    private orderBy?: string[];

    cols = ['code', 'name', 'type', 'scope', 'value', 'window', 'usage', 'status', 'actions'];
    searchChanged = new Subject<string>();

    valueLabel(p: PromotionDto): string {
        if (p.type === 'PercentageOff') return `${p.value}%`;
        if (p.type === 'FixedAmountOff') return p.value.toFixed(2);
        return `Buy ${p.buyQty} get ${p.getQty}`;
    }

    ngOnInit(): void {
        this.searchChanged.pipe(debounceTime(300)).subscribe(() => this.resetAndLoad());
        this.load();
    }

    private buildRequest(): SearchPromotionsRequest {
        return {
            pageNumber: this.pageIndex + 1,
            pageSize: this.pageSize,
            orderBy: this.orderBy,
            keyword: this.search.trim() || undefined,
            isActive: this.statusFilter === 'all' ? undefined : this.statusFilter === 'active',
            type: this.typeFilter === 'all' ? undefined : this.typeFilter,
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

    remove(r: PromotionDto): void {
        if (!confirm(`Delete promotion "${r.code}"?`)) return;
        this.api.delete(r.id).subscribe(() => this.load());
    }
}
