import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { OutletsService } from 'app/core/outlets/outlets.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { OutletDto, OutletStatus, OutletType } from 'app/core/outlets/outlets.types';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';

@Component({
    selector: 'app-outlet-list',
    standalone: true,
    imports: [
        CommonModule, FormsModule, RouterModule,
        MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule,
        MatSelectModule, MatTableModule, MatTooltipModule,
        TranslocoModule,
    ],
    template: `
<div class="flex flex-col flex-auto min-w-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 relative">
    <div class="absolute inset-0 opacity-5 dark:opacity-10"><div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, rgba(0,0,0,0.1) 1px, transparent 0); background-size: 20px 20px;"></div></div>
    <div class="relative z-10 flex flex-col flex-auto min-w-0">

        <div class="flex flex-col sm:flex-row space-y-16 sm:space-y-0 flex-0 sm:items-center sm:justify-between p-2 sm:py-3 sm:px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
            <div class="flex items-center space-x-4">
                <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
                    <mat-icon class="text-white">storefront</mat-icon>
                </div>
                <div>
                    <h2 class="text-3xl font-bold tracking-tight leading-7 sm:leading-10 truncate bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">{{ 'ADMIN.OUTLET.LIST.TITLE' | transloco }}</h2>
                    <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">{{ 'ADMIN.OUTLET.LIST.SUBTITLE' | transloco }}</p>
                </div>
            </div>
            <div class="flex flex-col w-full sm:w-auto sm:flex-row space-y-16 sm:space-y-0 flex-1 sm:flex-none sm:items-center sm:justify-end gap-4">
                <mat-form-field class="w-full sm:w-auto sm:min-w-72" appearance="outline" subscriptSizing="dynamic">
                    <mat-label>{{ 'ADMIN.OUTLET.LIST.SEARCH_LABEL' | transloco }}</mat-label>
                    <input matInput [ngModel]="search()" (ngModelChange)="search.set($event)" [placeholder]="'ADMIN.OUTLET.LIST.SEARCH_PLACEHOLDER' | transloco">
                    <mat-icon matSuffix class="text-gray-400">search</mat-icon>
                </mat-form-field>
                <mat-form-field class="w-full sm:w-auto sm:min-w-44" appearance="outline" subscriptSizing="dynamic">
                    <mat-label>{{ 'ADMIN.OUTLET.LIST.TYPE_LABEL' | transloco }}</mat-label>
                    <mat-select [ngModel]="typeFilter()" (ngModelChange)="typeFilter.set($event)">
                        <mat-option value="all">{{ 'ADMIN.OUTLET.LIST.TYPE_ALL' | transloco }}</mat-option>
                        <mat-option value="Retail">{{ 'ADMIN.OUTLET.LIST.TYPE_RETAIL' | transloco }}</mat-option>
                        <mat-option value="Warehouse">{{ 'ADMIN.OUTLET.LIST.TYPE_WAREHOUSE' | transloco }}</mat-option>
                        <mat-option value="HQ">{{ 'ADMIN.OUTLET.LIST.TYPE_HQ' | transloco }}</mat-option>
                    </mat-select>
                </mat-form-field>
                <mat-form-field class="w-full sm:w-auto sm:min-w-44" appearance="outline" subscriptSizing="dynamic">
                    <mat-label>{{ 'ADMIN.OUTLET.LIST.STATUS_LABEL' | transloco }}</mat-label>
                    <mat-select [ngModel]="statusFilter()" (ngModelChange)="statusFilter.set($event)">
                        <mat-option value="all">{{ 'ADMIN.OUTLET.LIST.STATUS_ALL' | transloco }}</mat-option>
                        <mat-option value="Active">{{ 'ADMIN.OUTLET.LIST.STATUS_ACTIVE' | transloco }}</mat-option>
                        <mat-option value="Suspended">{{ 'ADMIN.OUTLET.LIST.STATUS_SUSPENDED' | transloco }}</mat-option>
                        <mat-option value="Archived">{{ 'ADMIN.OUTLET.LIST.STATUS_ARCHIVED' | transloco }}</mat-option>
                    </mat-select>
                </mat-form-field>
                <button mat-fab color="primary" routerLink="create" [matTooltip]="'ADMIN.OUTLET.LIST.ADD_TOOLTIP' | transloco"><mat-icon>add</mat-icon></button>
            </div>
        </div>

        <div class="flex-auto p-4 sm:p-6">
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div class="relative overflow-x-auto">
                    <table mat-table [dataSource]="filtered()" class="w-full">
                        <ng-container matColumnDef="code">
                            <th mat-header-cell *matHeaderCellDef class="pl-4 sm:pl-6"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'ADMIN.OUTLET.LIST.COL_CODE' | transloco }}</span></th>
                            <td mat-cell *matCellDef="let r" class="pl-4 sm:pl-6 font-mono text-xs">{{ r.code }}</td>
                        </ng-container>
                        <ng-container matColumnDef="name">
                            <th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'ADMIN.OUTLET.LIST.COL_NAME' | transloco }}</span></th>
                            <td mat-cell *matCellDef="let r">
                                <div class="flex flex-col">
                                    <span class="text-sm font-medium text-gray-900 dark:text-white">{{ r.name }}</span>
                                    <span class="text-xs text-gray-500">{{ r.contactEmail || r.contactPhone || '—' }}</span>
                                </div>
                            </td>
                        </ng-container>
                        <ng-container matColumnDef="type">
                            <th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'ADMIN.OUTLET.LIST.COL_TYPE' | transloco }}</span></th>
                            <td mat-cell *matCellDef="let r">
                                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                                      [ngClass]="{
                                        'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200': r.type === 'Retail',
                                        'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200': r.type === 'Warehouse',
                                        'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200': r.type === 'HQ'
                                      }">{{ typeLabel(r.type) | transloco }}</span>
                            </td>
                        </ng-container>
                        <ng-container matColumnDef="city">
                            <th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'ADMIN.OUTLET.LIST.COL_CITY' | transloco }}</span></th>
                            <td mat-cell *matCellDef="let r">{{ r.city || '—' }}</td>
                        </ng-container>
                        <ng-container matColumnDef="status">
                            <th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'ADMIN.OUTLET.LIST.COL_STATUS' | transloco }}</span></th>
                            <td mat-cell *matCellDef="let r">
                                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                                      [ngClass]="{
                                        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': r.status === 'Active',
                                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200': r.status === 'Suspended',
                                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200': r.status === 'Archived'
                                      }">
                                    <mat-icon class="icon-size-4 mr-1">{{ statusIcon(r.status) }}</mat-icon>{{ statusLabel(r.status) | transloco }}
                                </span>
                            </td>
                        </ng-container>
                        <ng-container matColumnDef="actions">
                            <th mat-header-cell *matHeaderCellDef class="pr-4 sm:pr-6 !text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'ADMIN.OUTLET.LIST.COL_ACTIONS' | transloco }}</span></th>
                            <td mat-cell *matCellDef="let r" class="pr-4 sm:pr-6">
                                <div class="flex items-center justify-end space-x-2">
                                    <button mat-icon-button class="text-blue-600" [routerLink]="[r.id]" [matTooltip]="'ADMIN.OUTLET.LIST.EDIT_TOOLTIP' | transloco"><mat-icon class="icon-size-5">edit</mat-icon></button>
                                    <button *ngIf="r.status === 'Active'" mat-icon-button class="text-amber-600" (click)="suspend(r)" [matTooltip]="'ADMIN.OUTLET.LIST.SUSPEND_TOOLTIP' | transloco"><mat-icon class="icon-size-5">pause_circle</mat-icon></button>
                                    <button *ngIf="r.status !== 'Active'" mat-icon-button class="text-green-600" (click)="reactivate(r)" [matTooltip]="'ADMIN.OUTLET.LIST.REACTIVATE_TOOLTIP' | transloco"><mat-icon class="icon-size-5">play_circle</mat-icon></button>
                                    <button mat-icon-button class="text-red-600" (click)="remove(r)" [matTooltip]="'ADMIN.OUTLET.LIST.DELETE_TOOLTIP' | transloco"><mat-icon class="icon-size-5">delete</mat-icon></button>
                                </div>
                            </td>
                        </ng-container>
                        <tr mat-header-row *matHeaderRowDef="cols" class="bg-gray-50 dark:bg-gray-700"></tr>
                        <tr mat-row *matRowDef="let row; columns: cols" class="hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors"></tr>
                    </table>
                </div>

                <div *ngIf="!loading() && filtered().length === 0" class="flex flex-col items-center justify-center p-12">
                    <div class="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center mb-6 shadow-lg"><mat-icon class="icon-size-16 text-gray-400">storefront</mat-icon></div>
                    <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">{{ 'ADMIN.OUTLET.LIST.EMPTY_TITLE' | transloco }}</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">{{ (search() || typeFilter() !== 'all' || statusFilter() !== 'all' ? 'ADMIN.OUTLET.LIST.EMPTY_FILTERED' : 'ADMIN.OUTLET.LIST.EMPTY_DEFAULT') | transloco }}</p>
                    <button *ngIf="!search() && typeFilter() === 'all' && statusFilter() === 'all'" mat-flat-button color="primary" routerLink="create"><mat-icon class="icon-size-5 mr-2">add_circle</mat-icon><span>{{ 'ADMIN.OUTLET.LIST.ADD_BUTTON' | transloco }}</span></button>
                </div>
            </div>
        </div>
    </div>
</div>
    `,
})
export class OutletListComponent implements OnInit {
    private readonly api = inject(OutletsService);
    private readonly _confirm = inject(FuseConfirmationService);
    private readonly _transloco = inject(TranslocoService);
    rows = signal<OutletDto[]>([]);
    loading = signal(true);
    search = signal('');
    typeFilter = signal<'all' | OutletType>('all');
    statusFilter = signal<'all' | OutletStatus>('all');
    cols = ['code', 'name', 'type', 'city', 'status', 'actions'];

    filtered = computed(() => {
        const q = this.search().trim().toLowerCase();
        const type = this.typeFilter();
        const status = this.statusFilter();
        return this.rows().filter(r =>
            (type === 'all' || r.type === type)
            && (status === 'all' || r.status === status)
            && (!q
                || r.code.toLowerCase().includes(q)
                || r.name.toLowerCase().includes(q)
                || (r.city ?? '').toLowerCase().includes(q))
        );
    });

    statusIcon(s: OutletStatus): string {
        return s === 'Active' ? 'check_circle' : s === 'Suspended' ? 'pause_circle' : 'archive';
    }

    typeLabel(t: OutletType): string {
        if (t === 'Retail') return 'ADMIN.OUTLET.LIST.TYPE_RETAIL';
        if (t === 'Warehouse') return 'ADMIN.OUTLET.LIST.TYPE_WAREHOUSE';
        return 'ADMIN.OUTLET.LIST.TYPE_HQ';
    }

    statusLabel(s: OutletStatus): string {
        if (s === 'Active') return 'ADMIN.OUTLET.LIST.STATUS_ACTIVE';
        if (s === 'Suspended') return 'ADMIN.OUTLET.LIST.STATUS_SUSPENDED';
        return 'ADMIN.OUTLET.LIST.STATUS_ARCHIVED';
    }

    ngOnInit(): void { this.load(); }
    load(): void {
        this.loading.set(true);
        this.api.getAll().subscribe({
            next: d => { this.rows.set(d); this.loading.set(false); },
            error: () => this.loading.set(false),
        });
    }
    suspend(r: OutletDto): void {
        this.api.suspend(r.id).subscribe(() => this.load());
    }
    reactivate(r: OutletDto): void {
        this.api.reactivate(r.id).subscribe(() => this.load());
    }
    remove(r: OutletDto): void {
        this._confirm.open({
            title: this._transloco.translate('ADMIN.OUTLET.DELETE_TITLE'),
            message: this._transloco.translate('ADMIN.OUTLET.DELETE_CONFIRM', { name: r.name }),
            icon: { show: true, name: 'heroicons_outline:exclamation-triangle', color: 'warn' },
            actions: {
                confirm: { label: this._transloco.translate('COMMON.DELETE'), color: 'warn' },
                cancel: { label: this._transloco.translate('COMMON.CANCEL') },
            },
        }).afterClosed().subscribe(result => {
            if (result !== 'confirmed') return;
            this.api.delete(r.id).subscribe(() => this.load());
        });
    }
}
