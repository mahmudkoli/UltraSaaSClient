import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PlansService } from 'app/core/billing/billing.service';
import { PlanDto } from 'app/core/billing/billing.types';
import { PlanFormDialogComponent, PlanFormDialogData } from './plan-form-dialog.component';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';

@Component({
    selector: 'app-plans-list',
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatDialogModule, MatIconModule, MatTableModule, MatTooltipModule, TranslocoModule],
    template: `
<div class="flex flex-col flex-auto min-w-0 p-4 sm:p-6">
    <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                <mat-icon class="text-white">card_membership</mat-icon>
            </div>
            <div>
                <h1 class="text-2xl font-bold">{{ 'ADMIN.PLAN.LIST.TITLE' | transloco }}</h1>
                <p class="text-sm text-gray-500">{{ 'ADMIN.PLAN.LIST.SUBTITLE' | transloco }}</p>
            </div>
        </div>
        <button mat-flat-button color="primary" (click)="openForm()">
            <mat-icon class="icon-size-5 mr-1">add</mat-icon><span>{{ 'ADMIN.PLAN.LIST.NEW_BUTTON' | transloco }}</span>
        </button>
    </div>

    @if (loading()) {
        <div class="flex items-center gap-3 text-gray-500"><mat-icon class="icon-size-5 animate-spin">progress_activity</mat-icon><span>{{ 'ADMIN.PLAN.LIST.LOADING' | transloco }}</span></div>
    } @else {
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table mat-table [dataSource]="plans()" class="w-full">
                <ng-container matColumnDef="name">
                    <th mat-header-cell *matHeaderCellDef class="pl-5"><span class="text-xs font-medium text-gray-500 uppercase">{{ 'ADMIN.PLAN.LIST.COL_PLAN' | transloco }}</span></th>
                    <td mat-cell *matCellDef="let p" class="pl-5">
                        <div class="font-medium">{{ p.name }}</div>
                        <div class="text-xs text-gray-500 font-mono">{{ p.code }}</div>
                    </td>
                </ng-container>
                <ng-container matColumnDef="fee">
                    <th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase">{{ 'ADMIN.PLAN.LIST.COL_MONTHLY' | transloco }}</span></th>
                    <td mat-cell *matCellDef="let p"><span class="font-semibold">{{ 'ADMIN.PLAN.LIST.FEE_FORMAT' | transloco:{ fee: (p.monthlyFeeBDT | number:'1.0-2') } }}</span></td>
                </ng-container>
                <ng-container matColumnDef="trial">
                    <th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase">{{ 'ADMIN.PLAN.LIST.COL_TRIAL' | transloco }}</span></th>
                    <td mat-cell *matCellDef="let p">{{ 'ADMIN.PLAN.LIST.TRIAL_DAYS_FORMAT' | transloco:{ days: p.trialDays } }}</td>
                </ng-container>
                <ng-container matColumnDef="limits">
                    <th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase">{{ 'ADMIN.PLAN.LIST.COL_LIMITS' | transloco }}</span></th>
                    <td mat-cell *matCellDef="let p"><span class="text-sm">{{ 'ADMIN.PLAN.LIST.LIMITS_FORMAT' | transloco:{ outlets: p.maxOutlets, users: p.maxUsers } }}</span></td>
                </ng-container>
                <ng-container matColumnDef="flags">
                    <th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase">{{ 'ADMIN.PLAN.LIST.COL_FEATURES' | transloco }}</span></th>
                    <td mat-cell *matCellDef="let p">
                        @if (flagsOf(p).length === 0) {
                            <span class="text-xs text-gray-400">—</span>
                        }
                        @for (f of flagsOf(p); track f) {
                            <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 mr-1">{{ f }}</span>
                        }
                    </td>
                </ng-container>
                <ng-container matColumnDef="active">
                    <th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase">{{ 'ADMIN.PLAN.LIST.COL_ACTIVE' | transloco }}</span></th>
                    <td mat-cell *matCellDef="let p">
                        <span *ngIf="p.isActive" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">{{ 'ADMIN.PLAN.LIST.ACTIVE' | transloco }}</span>
                        <span *ngIf="!p.isActive" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200">{{ 'ADMIN.PLAN.LIST.INACTIVE' | transloco }}</span>
                    </td>
                </ng-container>
                <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef class="pr-5 !text-right"><span class="text-xs font-medium text-gray-500 uppercase">{{ 'ADMIN.PLAN.LIST.COL_ACTION' | transloco }}</span></th>
                    <td mat-cell *matCellDef="let p" class="pr-5 !text-right">
                        <button mat-stroked-button (click)="openForm(p)">
                            <mat-icon class="icon-size-4 mr-1">edit</mat-icon>{{ 'ADMIN.PLAN.LIST.EDIT' | transloco }}
                        </button>
                    </td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="cols" class="bg-gray-50 dark:bg-gray-700"></tr>
                <tr mat-row *matRowDef="let row; columns: cols"></tr>
            </table>
            @if (plans().length === 0) {
                <div class="p-6 text-center text-gray-500 text-sm">{{ 'ADMIN.PLAN.LIST.EMPTY' | transloco }}</div>
            }
        </div>
    }
</div>
    `,
})
export class PlansListComponent implements OnInit {
    private readonly api = inject(PlansService);
    private readonly dialog = inject(MatDialog);
    private readonly snack = inject(MatSnackBar);
    private readonly _transloco = inject(TranslocoService);

    plans = signal<PlanDto[]>([]);
    loading = signal(true);
    cols = ['name', 'fee', 'trial', 'limits', 'flags', 'active', 'actions'];

    ngOnInit(): void { this.reload(); }

    reload(): void {
        this.loading.set(true);
        this.api.getAll(false).subscribe({
            next: list => { this.plans.set(list ?? []); this.loading.set(false); },
            error: () => this.loading.set(false),
        });
    }

    /** Parse the JSON array; tolerate malformed input rather than crashing the table. */
    flagsOf(p: PlanDto): string[] {
        try {
            const arr = JSON.parse(p.featureFlagsJson || '[]');
            return Array.isArray(arr) ? arr.map(x => String(x)) : [];
        } catch { return []; }
    }

    openForm(existing?: PlanDto): void {
        const data: PlanFormDialogData = existing ? { mode: 'edit', plan: existing } : { mode: 'create' };
        this.dialog.open(PlanFormDialogComponent, { width: '520px', data }).afterClosed().subscribe(ok => {
            if (ok) {
                this.snack.open(this._transloco.translate(existing ? 'ADMIN.PLAN.FORM.TOAST_UPDATED' : 'ADMIN.PLAN.FORM.TOAST_CREATED'), this._transloco.translate('COMMON.YES'), { duration: 2500 });
                this.reload();
            }
        });
    }
}
