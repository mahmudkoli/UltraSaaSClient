import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { debounceTime, Subject } from 'rxjs';
import { toOrderBy } from 'app/core/common/pagination.types';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { PrescriptionsService, SearchPrescriptionsRequest } from 'app/core/pharmacy/pharmacy.service';
import { PrescriptionDto } from 'app/core/pharmacy/pharmacy.types';

@Component({
    selector: 'app-prescriptions-list',
    standalone: true,
    imports: [
        CommonModule, FormsModule, RouterModule, TranslocoModule,
        MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule,
        MatPaginatorModule, MatSelectModule, MatSnackBarModule, MatSortModule, MatTableModule, MatTooltipModule,
    ],
    template: `
<div class="flex flex-col flex-auto min-w-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 relative">
    <div class="absolute inset-0 opacity-5 dark:opacity-10"><div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, rgba(0,0,0,0.1) 1px, transparent 0); background-size: 20px 20px;"></div></div>
    <div class="relative z-10 flex flex-col flex-auto min-w-0">
        <div class="flex flex-col sm:flex-row space-y-16 sm:space-y-0 flex-0 sm:items-center sm:justify-between p-2 sm:py-3 sm:px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
            <div class="flex items-center space-x-4">
                <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-teal-500 to-emerald-600 rounded-xl shadow-lg"><mat-icon class="text-white">prescriptions</mat-icon></div>
                <div>
                    <h2 class="text-3xl font-bold tracking-tight leading-7 sm:leading-10 truncate bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">{{ 'PHARMACY.PRESCRIPTIONS.LIST.TITLE' | transloco }}</h2>
                    <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">{{ 'PHARMACY.PRESCRIPTIONS.LIST.SUBTITLE' | transloco }}</p>
                </div>
            </div>
            <div class="flex flex-col w-full sm:w-auto sm:flex-row space-y-16 sm:space-y-0 flex-1 sm:flex-none sm:items-center sm:justify-end gap-4">
                <mat-form-field class="w-full sm:w-auto sm:min-w-72" appearance="outline" subscriptSizing="dynamic">
                    <mat-label>{{ 'PHARMACY.PRESCRIPTIONS.LIST.SEARCH_LABEL' | transloco }}</mat-label>
                    <input matInput [(ngModel)]="search" (ngModelChange)="searchChanged.next($event)" [placeholder]="'PHARMACY.PRESCRIPTIONS.LIST.SEARCH_PLACEHOLDER' | transloco">
                    <mat-icon matSuffix class="text-gray-400">search</mat-icon>
                </mat-form-field>
                <mat-form-field class="w-full sm:w-auto sm:min-w-44" appearance="outline" subscriptSizing="dynamic">
                    <mat-label>{{ 'PHARMACY.PRESCRIPTIONS.LIST.PHONE_LABEL' | transloco }}</mat-label>
                    <input matInput [(ngModel)]="phoneFilter" (ngModelChange)="phoneChanged.next($event)">
                </mat-form-field>
                <mat-form-field class="w-full sm:w-auto sm:min-w-44" appearance="outline" subscriptSizing="dynamic">
                    <mat-label>{{ 'PHARMACY.PRESCRIPTIONS.LIST.STATUS_LABEL' | transloco }}</mat-label>
                    <mat-select [(ngModel)]="statusFilter" (ngModelChange)="resetAndLoad()">
                        <mat-option value="all">{{ 'PHARMACY.PRESCRIPTIONS.LIST.STATUS_ALL' | transloco }}</mat-option>
                        <mat-option value="Active">{{ 'PHARMACY.PRESCRIPTIONS.LIST.STATUS_ACTIVE' | transloco }}</mat-option>
                        <mat-option value="Dispensed">{{ 'PHARMACY.PRESCRIPTIONS.LIST.STATUS_DISPENSED' | transloco }}</mat-option>
                        <mat-option value="Expired">{{ 'PHARMACY.PRESCRIPTIONS.LIST.STATUS_EXPIRED' | transloco }}</mat-option>
                        <mat-option value="Cancelled">{{ 'PHARMACY.PRESCRIPTIONS.LIST.STATUS_CANCELLED' | transloco }}</mat-option>
                    </mat-select>
                </mat-form-field>
                <button mat-fab color="primary" routerLink="create" [matTooltip]="'PHARMACY.PRESCRIPTIONS.LIST.ADD_TOOLTIP' | transloco"><mat-icon>add</mat-icon></button>
            </div>
        </div>
        <div class="flex-auto p-4 sm:p-6">
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div class="relative overflow-x-auto">
                    <table mat-table matSort [dataSource]="rows()" (matSortChange)="onSort($event)" class="w-full">
                        <ng-container matColumnDef="prescriptionNumber"><th mat-header-cell *matHeaderCellDef mat-sort-header class="pl-4 sm:pl-6"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'PHARMACY.PRESCRIPTIONS.LIST.COL_RX' | transloco }}</span></th>
                            <td mat-cell *matCellDef="let r" class="pl-4 sm:pl-6 font-mono text-sm">{{ r.prescriptionNumber }}</td></ng-container>
                        <ng-container matColumnDef="prescriptionDate"><th mat-header-cell *matHeaderCellDef mat-sort-header><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'PHARMACY.PRESCRIPTIONS.LIST.COL_DATE' | transloco }}</span></th>
                            <td mat-cell *matCellDef="let r">{{ r.prescriptionDate | date:'shortDate' }}</td></ng-container>
                        <ng-container matColumnDef="doctor"><th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'PHARMACY.PRESCRIPTIONS.LIST.COL_DOCTOR' | transloco }}</span></th>
                            <td mat-cell *matCellDef="let r">
                                <div class="flex flex-col">
                                    <span class="text-sm font-medium">{{ r.doctorName }}</span>
                                    <span class="text-xs text-gray-500">{{ r.hospital || r.doctorPhone || '—' }}</span>
                                </div>
                            </td></ng-container>
                        <ng-container matColumnDef="patient"><th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'PHARMACY.PRESCRIPTIONS.LIST.COL_PATIENT' | transloco }}</span></th>
                            <td mat-cell *matCellDef="let r">
                                <div class="flex flex-col">
                                    <span class="text-sm font-medium">{{ r.patientName }}</span>
                                    <span class="text-xs text-gray-500">{{ r.patientPhone || '—' }}{{ r.patientAge ? ' · ' + r.patientAge + 'y' : '' }}</span>
                                </div>
                            </td></ng-container>
                        <ng-container matColumnDef="validUntil"><th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'PHARMACY.PRESCRIPTIONS.LIST.COL_VALID_UNTIL' | transloco }}</span></th>
                            <td mat-cell *matCellDef="let r" class="text-gray-600 dark:text-gray-400">{{ r.validUntil ? (r.validUntil | date:'shortDate') : '—' }}</td></ng-container>
                        <ng-container matColumnDef="status"><th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'PHARMACY.PRESCRIPTIONS.LIST.COL_STATUS' | transloco }}</span></th>
                            <td mat-cell *matCellDef="let r">
                                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium" [ngClass]="badgeClass(r.status)">
                                    <mat-icon class="icon-size-4 mr-1">{{ statusIcon(r.status) }}</mat-icon>{{ statusLabel(r.status) | transloco }}
                                </span>
                            </td></ng-container>
                        <ng-container matColumnDef="actions"><th mat-header-cell *matHeaderCellDef class="pr-4 sm:pr-6 !text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'PHARMACY.PRESCRIPTIONS.LIST.COL_ACTIONS' | transloco }}</span></th>
                            <td mat-cell *matCellDef="let r" class="pr-4 sm:pr-6">
                                <div class="flex items-center justify-end space-x-2">
                                    <button mat-icon-button class="text-blue-600"
                                            (click)="view(r); $event.stopPropagation()"
                                            [matTooltip]="'PHARMACY.PRESCRIPTIONS.LIST.VIEW_TOOLTIP' | transloco">
                                        <mat-icon class="icon-size-5">visibility</mat-icon>
                                    </button>
                                    <button mat-icon-button class="text-red-600"
                                            (click)="cancel(r); $event.stopPropagation()"
                                            [matTooltip]="'PHARMACY.PRESCRIPTIONS.LIST.CANCEL_TOOLTIP' | transloco"
                                            [disabled]="r.status !== 'Active'">
                                        <mat-icon class="icon-size-5">cancel</mat-icon>
                                    </button>
                                </div>
                            </td></ng-container>
                        <tr mat-header-row *matHeaderRowDef="cols" class="bg-gray-50 dark:bg-gray-700"></tr>
                        <tr mat-row *matRowDef="let row; columns: cols"
                            class="hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors cursor-pointer"
                            (click)="view(row)"></tr>
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
                    <div class="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center mb-6 shadow-lg"><mat-icon class="icon-size-16 text-gray-400">prescriptions</mat-icon></div>
                    <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">{{ 'PHARMACY.PRESCRIPTIONS.LIST.EMPTY_TITLE' | transloco }}</h3>
                    <button mat-flat-button color="primary" routerLink="create"><mat-icon class="icon-size-5 mr-2">add_circle</mat-icon><span>{{ 'PHARMACY.PRESCRIPTIONS.LIST.RECORD_BUTTON' | transloco }}</span></button>
                </div>
            </div>
        </div>
    </div>
</div>
    `,
})
export class PrescriptionsListComponent implements OnInit {
    private readonly api = inject(PrescriptionsService);
    private readonly snack = inject(MatSnackBar);
    private readonly router = inject(Router);
    private readonly _confirm = inject(FuseConfirmationService);
    private readonly _transloco = inject(TranslocoService);

    @ViewChild(MatPaginator) paginator?: MatPaginator;
    @ViewChild(MatSort) sort?: MatSort;

    rows = signal<PrescriptionDto[]>([]);
    loading = signal(true);
    totalCount = signal(0);

    search = '';
    phoneFilter = '';
    statusFilter: 'all' | 'Active' | 'Dispensed' | 'Expired' | 'Cancelled' = 'all';

    pageIndex = 0;
    pageSize = 25;
    private orderBy?: string[];

    cols = ['prescriptionNumber', 'prescriptionDate', 'doctor', 'patient', 'validUntil', 'status', 'actions'];
    searchChanged = new Subject<string>();
    phoneChanged = new Subject<string>();

    statusIcon(s: PrescriptionDto['status']): string {
        switch (s) {
            case 'Active': return 'check_circle';
            case 'Dispensed': return 'inventory';
            case 'Cancelled': return 'cancel';
            case 'Expired': return 'event_busy';
            default: return 'help';
        }
    }

    statusLabel(s: PrescriptionDto['status']): string {
        switch (s) {
            case 'Active': return 'PHARMACY.PRESCRIPTIONS.LIST.STATUS_ACTIVE';
            case 'Dispensed': return 'PHARMACY.PRESCRIPTIONS.LIST.STATUS_DISPENSED';
            case 'Cancelled': return 'PHARMACY.PRESCRIPTIONS.LIST.STATUS_CANCELLED';
            case 'Expired': return 'PHARMACY.PRESCRIPTIONS.LIST.STATUS_EXPIRED';
            default: return '';
        }
    }

    badgeClass(s: PrescriptionDto['status']): Record<string, boolean> {
        return {
            'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': s === 'Active',
            'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200': s === 'Dispensed',
            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200': s === 'Cancelled',
            'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200': s === 'Expired',
        };
    }

    ngOnInit(): void {
        this.searchChanged.pipe(debounceTime(300)).subscribe(() => this.resetAndLoad());
        this.phoneChanged.pipe(debounceTime(300)).subscribe(() => this.resetAndLoad());
        this.load();
    }

    private buildRequest(): SearchPrescriptionsRequest {
        return {
            pageNumber: this.pageIndex + 1,
            pageSize: this.pageSize,
            orderBy: this.orderBy,
            keyword: this.search.trim() || undefined,
            patientPhone: this.phoneFilter.trim() || undefined,
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

    view(r: PrescriptionDto): void {
        this.router.navigate(['/prescriptions', r.id]);
    }

    cancel(r: PrescriptionDto): void {
        if (r.status !== 'Active') return;
        const ref = this._confirm.open({
            title: this._transloco.translate('PHARMACY.PRESCRIPTIONS.LIST.CANCEL_TITLE'),
            message: this._transloco.translate('PHARMACY.PRESCRIPTIONS.LIST.CANCEL_CONFIRM', { number: r.prescriptionNumber, patient: r.patientName }),
            icon: { show: true, name: 'heroicons_outline:exclamation-triangle', color: 'warn' },
            actions: {
                confirm: { label: this._transloco.translate('PHARMACY.PRESCRIPTIONS.LIST.CANCEL_LABEL'), color: 'warn' },
                cancel: { label: this._transloco.translate('PHARMACY.PRESCRIPTIONS.LIST.KEEP_LABEL') },
            },
        });
        ref.afterClosed().subscribe(result => {
            if (result !== 'confirmed') return;
            this.api.cancel(r.id).subscribe({
                next: () => { this.snack.open(this._transloco.translate('PHARMACY.PRESCRIPTIONS.LIST.TOAST_CANCELLED'), this._transloco.translate('PHARMACY.PRESCRIPTIONS.LIST.TOAST_OK'), { duration: 3000 }); this.load(); },
                error: err => {
                    const msg = err?.error?.exception ?? err?.error?.title ?? err?.message ?? this._transloco.translate('PHARMACY.PRESCRIPTIONS.LIST.TOAST_CANCEL_FAILED');
                    this.snack.open(msg, this._transloco.translate('PHARMACY.PRESCRIPTIONS.LIST.TOAST_OK'), { duration: 6000 });
                },
            });
        });
    }
}
