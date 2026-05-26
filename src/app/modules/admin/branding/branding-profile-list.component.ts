import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { BrandingProfilesService } from 'app/core/branding/branding.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { BrandingProfileDto, PAPER_FORMAT_LABELS } from 'app/core/branding/branding.types';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';

@Component({
    selector: 'app-branding-profile-list',
    standalone: true,
    imports: [
        CommonModule, FormsModule, RouterModule,
        MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule,
        MatTableModule, MatTooltipModule,
        TranslocoModule,
    ],
    template: `
<div class="flex flex-col flex-auto min-w-0 bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30 dark:from-gray-900 dark:via-indigo-900/20 dark:to-purple-900/20 relative">
    <div class="relative z-10 flex flex-col flex-auto min-w-0">
        <div class="flex flex-col sm:flex-row space-y-16 sm:space-y-0 flex-0 sm:items-center sm:justify-between p-2 sm:py-3 sm:px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
            <div class="flex items-center space-x-4">
                <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                    <mat-icon class="text-white">receipt_long</mat-icon>
                </div>
                <div>
                    <h2 class="text-3xl font-bold tracking-tight leading-7 sm:leading-10 truncate bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">{{ 'ADMIN.BRANDING.LIST.TITLE' | transloco }}</h2>
                    <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">{{ 'ADMIN.BRANDING.LIST.SUBTITLE' | transloco }}</p>
                </div>
            </div>
            <div class="flex flex-col w-full sm:w-auto sm:flex-row space-y-16 sm:space-y-0 flex-1 sm:flex-none sm:items-center sm:justify-end gap-4">
                <mat-form-field class="w-full sm:w-auto sm:min-w-72" appearance="outline" subscriptSizing="dynamic">
                    <mat-label>{{ 'ADMIN.BRANDING.LIST.SEARCH_LABEL' | transloco }}</mat-label>
                    <input matInput [(ngModel)]="searchTerm" [placeholder]="'ADMIN.BRANDING.LIST.SEARCH_PLACEHOLDER' | transloco">
                    <mat-icon matSuffix class="text-gray-400">search</mat-icon>
                </mat-form-field>
                <button mat-fab color="primary" routerLink="create" [matTooltip]="'ADMIN.BRANDING.LIST.ADD_TOOLTIP' | transloco">
                    <mat-icon>add</mat-icon>
                </button>
            </div>
        </div>

        <div class="flex-auto p-4 sm:p-6">
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div class="relative overflow-x-auto">
                    <table mat-table [dataSource]="filtered()" class="w-full">
                        <ng-container matColumnDef="name">
                            <th mat-header-cell *matHeaderCellDef class="pl-4 sm:pl-6"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'ADMIN.BRANDING.LIST.COL_PROFILE' | transloco }}</span></th>
                            <td mat-cell *matCellDef="let r" class="pl-4 sm:pl-6 py-3">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center justify-center overflow-hidden flex-shrink-0">
                                        @if (r.hasLogo) {
                                            <img [src]="logoUrl(r.id)" alt="" class="max-w-full max-h-full object-contain">
                                        } @else {
                                            <mat-icon class="icon-size-5 text-gray-300">image</mat-icon>
                                        }
                                    </div>
                                    <div class="flex flex-col">
                                        <span class="text-sm font-medium text-gray-900 dark:text-white">{{ r.name }}</span>
                                        @if (r.taxId) {
                                            <span class="text-xs text-gray-500">{{ r.taxId }}</span>
                                        }
                                    </div>
                                </div>
                            </td>
                        </ng-container>
                        <ng-container matColumnDef="format">
                            <th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'ADMIN.BRANDING.LIST.COL_FORMAT' | transloco }}</span></th>
                            <td mat-cell *matCellDef="let r">
                                <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                                    {{ paperLabel(r.paperFormat) }}
                                </span>
                            </td>
                        </ng-container>
                        <ng-container matColumnDef="color">
                            <th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'ADMIN.BRANDING.LIST.COL_BRAND' | transloco }}</span></th>
                            <td mat-cell *matCellDef="let r">
                                @if (r.primaryColor) {
                                    <div class="flex items-center gap-2">
                                        <span class="w-5 h-5 rounded-full border border-gray-200" [style.background]="r.primaryColor"></span>
                                        <span class="text-xs font-mono text-gray-500">{{ r.primaryColor }}</span>
                                    </div>
                                } @else {
                                    <span class="text-xs text-gray-400">—</span>
                                }
                            </td>
                        </ng-container>
                        <ng-container matColumnDef="active">
                            <th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'ADMIN.BRANDING.LIST.COL_STATUS' | transloco }}</span></th>
                            <td mat-cell *matCellDef="let r">
                                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                                      [ngClass]="r.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'">
                                    <mat-icon class="icon-size-4 mr-1">{{ r.isActive ? 'check_circle' : 'pause_circle' }}</mat-icon>
                                    {{ (r.isActive ? 'ADMIN.BRANDING.LIST.ACTIVE' : 'ADMIN.BRANDING.LIST.INACTIVE') | transloco }}
                                </span>
                            </td>
                        </ng-container>
                        <ng-container matColumnDef="actions">
                            <th mat-header-cell *matHeaderCellDef class="pr-4 sm:pr-6 !text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'ADMIN.BRANDING.LIST.COL_ACTIONS' | transloco }}</span></th>
                            <td mat-cell *matCellDef="let r" class="pr-4 sm:pr-6">
                                <div class="flex items-center justify-end space-x-2">
                                    <button mat-icon-button class="text-blue-600" [routerLink]="[r.id]" [matTooltip]="'ADMIN.BRANDING.LIST.EDIT_TOOLTIP' | transloco"><mat-icon class="icon-size-5">edit</mat-icon></button>
                                    <button mat-icon-button class="text-red-600" (click)="remove(r)" [matTooltip]="'ADMIN.BRANDING.LIST.DELETE_TOOLTIP' | transloco"><mat-icon class="icon-size-5">delete</mat-icon></button>
                                </div>
                            </td>
                        </ng-container>
                        <tr mat-header-row *matHeaderRowDef="cols" class="bg-gray-50 dark:bg-gray-700"></tr>
                        <tr mat-row *matRowDef="let row; columns: cols" class="hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-colors"></tr>
                    </table>
                </div>

                @if (!loading() && filtered().length === 0) {
                    <div class="flex flex-col items-center justify-center p-12">
                        <div class="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-full flex items-center justify-center mb-6 shadow-lg">
                            <mat-icon class="icon-size-16 text-indigo-400">receipt_long</mat-icon>
                        </div>
                        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                            {{ (rows().length === 0 ? 'ADMIN.BRANDING.LIST.EMPTY_TITLE' : 'ADMIN.BRANDING.LIST.EMPTY_NO_MATCH') | transloco }}
                        </h3>
                        <p class="text-sm text-gray-500 mb-4 max-w-md text-center">
                            {{ 'ADMIN.BRANDING.LIST.EMPTY_HINT' | transloco }}
                        </p>
                        @if (rows().length === 0) {
                            <button mat-flat-button color="primary" routerLink="create"><mat-icon class="icon-size-5 mr-2">add_circle</mat-icon><span>{{ 'ADMIN.BRANDING.LIST.ADD_BUTTON' | transloco }}</span></button>
                        }
                    </div>
                }
            </div>
        </div>
    </div>
</div>
    `,
})
export class BrandingProfileListComponent implements OnInit {
    private readonly api = inject(BrandingProfilesService);
    private readonly _confirm = inject(FuseConfirmationService);
    private readonly _transloco = inject(TranslocoService);

    rows = signal<BrandingProfileDto[]>([]);
    loading = signal(true);
    searchTerm = '';

    cols = ['name', 'format', 'color', 'active', 'actions'];

    filtered = computed(() => {
        const t = this.searchTerm.trim().toLowerCase();
        if (!t) return this.rows();
        return this.rows().filter(r =>
            r.name.toLowerCase().includes(t)
            || (r.taxId ?? '').toLowerCase().includes(t)
            || r.paperFormat.toLowerCase().includes(t),
        );
    });

    ngOnInit(): void {
        this.load();
    }

    load(): void {
        this.loading.set(true);
        this.api.getAll().subscribe({
            next: rows => { this.rows.set(rows ?? []); this.loading.set(false); },
            error: () => this.loading.set(false),
        });
    }

    paperLabel(f: BrandingProfileDto['paperFormat']): string {
        return PAPER_FORMAT_LABELS[f] ?? f;
    }

    logoUrl(id: string): string {
        return this.api.logoUrl(id);
    }

    remove(r: BrandingProfileDto): void {
        this._confirm.open({
            title: this._transloco.translate('ADMIN.BRANDING.LIST.DELETE_TITLE'),
            message: this._transloco.translate('ADMIN.BRANDING.LIST.DELETE_CONFIRM', { name: r.name }),
            icon: { show: true, name: 'heroicons_outline:exclamation-triangle', color: 'warn' },
            actions: {
                confirm: { label: this._transloco.translate('COMMON.DELETE'), color: 'warn' },
                cancel: { label: this._transloco.translate('COMMON.CANCEL') },
            },
        }).afterClosed().subscribe(result => {
            if (result !== 'confirmed') return;
            this.api.delete(r.id).subscribe({
                next: () => this.load(),
                error: err => {
                    const fallback = this._transloco.translate('ADMIN.BRANDING.LIST.DELETE_FAILED_TITLE');
                    const msg = err?.error?.exception ?? err?.error ?? err?.message ?? fallback;
                    this._confirm.open({
                        title: fallback,
                        message: typeof msg === 'string' ? msg : fallback,
                        icon: { show: true, name: 'heroicons_outline:x-circle', color: 'warn' },
                        actions: { confirm: { label: this._transloco.translate('COMMON.YES') }, cancel: { show: false, label: '' } },
                    });
                },
            });
        });
    }
}
