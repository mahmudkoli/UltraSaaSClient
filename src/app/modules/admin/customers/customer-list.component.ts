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
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { debounceTime, Subject } from 'rxjs';
import { toOrderBy } from 'app/core/common/pagination.types';
import { CustomersService, SearchCustomersRequest } from 'app/core/sales/sales.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { CustomerDto } from 'app/core/sales/sales.types';
import { LoyaltyAdjustDialogComponent } from './loyalty-adjust-dialog.component';

@Component({
    selector: 'app-customer-list',
    standalone: true,
    imports: [
        CommonModule, FormsModule, RouterModule, TranslocoModule,
        MatButtonModule, MatDialogModule, MatFormFieldModule, MatIconModule, MatInputModule,
        MatPaginatorModule, MatSelectModule, MatSortModule, MatTableModule, MatTooltipModule,
    ],
    template: `
<div class="flex flex-col flex-auto min-w-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 relative">
    <div class="absolute inset-0 opacity-5 dark:opacity-10">
        <div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, rgba(0,0,0,0.1) 1px, transparent 0); background-size: 20px 20px;"></div>
    </div>
    <div class="relative z-10 flex flex-col flex-auto min-w-0">

        <div class="flex flex-col sm:flex-row space-y-16 sm:space-y-0 flex-0 sm:items-center sm:justify-between p-2 sm:py-3 sm:px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
            <div class="flex items-center space-x-4">
                <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
                    <mat-icon class="text-white">groups</mat-icon>
                </div>
                <div>
                    <h2 class="text-3xl font-bold tracking-tight leading-7 sm:leading-10 truncate bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">{{ 'CUSTOMERS.LIST.TITLE' | transloco }}</h2>
                    <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">{{ 'CUSTOMERS.LIST.SUBTITLE' | transloco }}</p>
                </div>
            </div>
            <div class="flex flex-col w-full sm:w-auto sm:flex-row space-y-16 sm:space-y-0 flex-1 sm:flex-none sm:items-center sm:justify-end gap-4">
                <mat-form-field class="w-full sm:w-auto sm:min-w-72" appearance="outline" subscriptSizing="dynamic">
                    <mat-label>{{ 'CUSTOMERS.LIST.SEARCH_LABEL' | transloco }}</mat-label>
                    <input matInput [(ngModel)]="search" (ngModelChange)="searchChanged.next($event)" [placeholder]="'CUSTOMERS.LIST.SEARCH_PLACEHOLDER' | transloco">
                    <mat-icon matSuffix class="text-gray-400">search</mat-icon>
                </mat-form-field>
                <mat-form-field class="w-full sm:w-auto sm:min-w-48" appearance="outline" subscriptSizing="dynamic">
                    <mat-label>{{ 'CUSTOMERS.LIST.TYPE_LABEL' | transloco }}</mat-label>
                    <mat-select [(ngModel)]="typeFilter" (ngModelChange)="resetAndLoad()">
                        <mat-option value="all">{{ 'CUSTOMERS.LIST.TYPE_ALL' | transloco }}</mat-option>
                        <mat-option value="Retail">{{ 'CUSTOMERS.LIST.TYPE_RETAIL' | transloco }}</mat-option>
                        <mat-option value="Wholesale">{{ 'CUSTOMERS.LIST.TYPE_WHOLESALE' | transloco }}</mat-option>
                        <mat-option value="Corporate">{{ 'CUSTOMERS.LIST.TYPE_CORPORATE' | transloco }}</mat-option>
                    </mat-select>
                </mat-form-field>
                <button mat-fab color="primary" routerLink="create" [matTooltip]="'CUSTOMERS.LIST.ADD_TOOLTIP' | transloco">
                    <mat-icon>add</mat-icon>
                </button>
            </div>
        </div>

        <div class="flex-auto p-4 sm:p-6">
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div class="relative overflow-x-auto">
                    <table mat-table matSort [dataSource]="rows()" (matSortChange)="onSort($event)" class="w-full">
                        <ng-container matColumnDef="name">
                            <th mat-header-cell *matHeaderCellDef mat-sort-header class="pl-4 sm:pl-6"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'CUSTOMERS.LIST.COL_NAME' | transloco }}</span></th>
                            <td mat-cell *matCellDef="let r" class="pl-4 sm:pl-6">
                                <div class="flex flex-col">
                                    <span class="text-sm font-medium text-gray-900 dark:text-white">{{ r.name }}</span>
                                    <span class="text-xs text-gray-500">{{ r.phone || r.email || '—' }}</span>
                                </div>
                            </td>
                        </ng-container>
                        <ng-container matColumnDef="email">
                            <th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'CUSTOMERS.LIST.COL_EMAIL' | transloco }}</span></th>
                            <td mat-cell *matCellDef="let r">{{ r.email || '—' }}</td>
                        </ng-container>
                        <ng-container matColumnDef="type">
                            <th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'CUSTOMERS.LIST.COL_TYPE' | transloco }}</span></th>
                            <td mat-cell *matCellDef="let r">
                                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                                      [ngClass]="{
                                        'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200': r.customerType === 'Retail',
                                        'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200': r.customerType === 'Wholesale',
                                        'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200': r.customerType === 'Corporate'
                                      }">{{ customerTypeLabel(r.customerType) | transloco }}</span>
                            </td>
                        </ng-container>
                        <ng-container matColumnDef="loyalty">
                            <th mat-header-cell *matHeaderCellDef class="!text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'CUSTOMERS.LIST.COL_POINTS' | transloco }}</span></th>
                            <td mat-cell *matCellDef="let r" class="!text-right font-medium">{{ r.loyaltyPoints | number:'1.0-2' }}</td>
                        </ng-container>
                        <ng-container matColumnDef="balance">
                            <th mat-header-cell *matHeaderCellDef class="!text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'CUSTOMERS.LIST.COL_BALANCE' | transloco }}</span></th>
                            <td mat-cell *matCellDef="let r" class="!text-right font-medium">{{ r.currentBalance | number:'1.2-2' }}</td>
                        </ng-container>
                        <ng-container matColumnDef="actions">
                            <th mat-header-cell *matHeaderCellDef class="pr-4 sm:pr-6 !text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'CUSTOMERS.LIST.COL_ACTIONS' | transloco }}</span></th>
                            <td mat-cell *matCellDef="let r" class="pr-4 sm:pr-6">
                                <div class="flex items-center justify-end space-x-2">
                                    <button mat-icon-button class="text-blue-600" [routerLink]="[r.id]" [matTooltip]="'CUSTOMERS.LIST.EDIT_TOOLTIP' | transloco"><mat-icon class="icon-size-5">edit</mat-icon></button>
                                    <button mat-icon-button class="text-rose-600" (click)="adjustLoyalty(r)" [matTooltip]="'CUSTOMERS.LIST.ADJUST_LOYALTY_TOOLTIP' | transloco"><mat-icon class="icon-size-5">redeem</mat-icon></button>
                                    <button mat-icon-button class="text-red-600" (click)="remove(r)" [matTooltip]="'CUSTOMERS.LIST.DELETE_TOOLTIP' | transloco"><mat-icon class="icon-size-5">delete</mat-icon></button>
                                </div>
                            </td>
                        </ng-container>
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
                    <div class="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center mb-6 shadow-lg">
                        <mat-icon class="icon-size-16 text-gray-400">groups</mat-icon>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">{{ 'CUSTOMERS.LIST.EMPTY_TITLE' | transloco }}</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">{{ (search || typeFilter !== 'all' ? 'CUSTOMERS.LIST.EMPTY_SUBTITLE_FILTERED' : 'CUSTOMERS.LIST.EMPTY_SUBTITLE_DEFAULT') | transloco }}</p>
                    <button *ngIf="!search && typeFilter === 'all'" mat-flat-button color="primary" routerLink="create"><mat-icon class="icon-size-5 mr-2">add_circle</mat-icon><span>{{ 'CUSTOMERS.LIST.ADD_BUTTON' | transloco }}</span></button>
                </div>
            </div>
        </div>
    </div>
</div>
    `,
})
export class CustomerListComponent implements OnInit {
    private readonly api = inject(CustomersService);
    private readonly dialog = inject(MatDialog);
    private readonly _confirm = inject(FuseConfirmationService);
    private readonly _transloco = inject(TranslocoService);

    @ViewChild(MatPaginator) paginator?: MatPaginator;
    @ViewChild(MatSort) sort?: MatSort;

    rows = signal<CustomerDto[]>([]);
    loading = signal(true);
    totalCount = signal(0);

    search = '';
    typeFilter: 'all' | 'Retail' | 'Wholesale' | 'Corporate' = 'all';

    pageIndex = 0;
    pageSize = 25;
    private orderBy?: string[];

    cols = ['name', 'email', 'type', 'loyalty', 'balance', 'actions'];
    searchChanged = new Subject<string>();

    customerTypeLabel(t: string): string {
        switch (t) {
            case 'Retail': return 'CUSTOMERS.LIST.TYPE_RETAIL';
            case 'Wholesale': return 'CUSTOMERS.LIST.TYPE_WHOLESALE';
            case 'Corporate': return 'CUSTOMERS.LIST.TYPE_CORPORATE';
            default: return '';
        }
    }

    ngOnInit(): void {
        this.searchChanged.pipe(debounceTime(300)).subscribe(() => this.resetAndLoad());
        this.load();
    }

    private buildRequest(): SearchCustomersRequest {
        return {
            pageNumber: this.pageIndex + 1,
            pageSize: this.pageSize,
            orderBy: this.orderBy,
            keyword: this.search.trim() || undefined,
            customerType: this.typeFilter === 'all' ? undefined : this.typeFilter,
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

    remove(r: CustomerDto): void {
        this._confirm.open({
            title: this._transloco.translate('CUSTOMERS.DELETE_TITLE'),
            message: this._transloco.translate('CUSTOMERS.DELETE_CONFIRM', { name: r.name }),
            icon: { show: true, name: 'heroicons_outline:exclamation-triangle', color: 'warn' },
            actions: {
                confirm: { label: this._transloco.translate('CUSTOMERS.DELETE_LABEL'), color: 'warn' },
                cancel: { label: this._transloco.translate('CUSTOMERS.CANCEL_LABEL') },
            },
        }).afterClosed().subscribe(result => {
            if (result !== 'confirmed') return;
            this.api.delete(r.id).subscribe(() => this.load());
        });
    }

    adjustLoyalty(r: CustomerDto): void {
        const ref = this.dialog.open(LoyaltyAdjustDialogComponent, {
            width: '720px',
            data: { customer: r },
        });
        ref.afterClosed().subscribe(saved => { if (saved) this.load(); });
    }
}
