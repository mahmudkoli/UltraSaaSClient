import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { LoyaltyService } from 'app/core/marketing/marketing.service';
import { LoyaltyTransactionDto } from 'app/core/marketing/marketing.types';
import { CustomerDto } from 'app/core/sales/sales.types';

export interface LoyaltyAdjustDialogData {
    customer: CustomerDto;
}

@Component({
    selector: 'app-loyalty-adjust-dialog',
    standalone: true,
    imports: [
        CommonModule, FormsModule, TranslocoModule,
        MatButtonModule, MatDialogModule, MatFormFieldModule,
        MatIconModule, MatInputModule, MatProgressSpinnerModule,
        MatSnackBarModule, MatTableModule,
    ],
    template: `
<div class="p-1">
    <div class="flex items-center space-x-3 px-4 pt-4 pb-2">
        <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 shadow">
            <mat-icon class="text-white">redeem</mat-icon>
        </div>
        <div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">{{ 'CUSTOMERS.LOYALTY.TITLE' | transloco }}</h2>
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ data.customer.name }} · {{ data.customer.phone || data.customer.email || '—' }}</p>
        </div>
    </div>
    <mat-dialog-content class="!p-4">
        <div class="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border border-pink-200 dark:border-pink-700 mb-4">
            <span class="text-sm text-gray-700 dark:text-gray-300">{{ 'CUSTOMERS.LOYALTY.CURRENT_BALANCE' | transloco }}</span>
            <span class="text-2xl font-semibold text-rose-700 dark:text-rose-300">{{ data.customer.loyaltyPoints | number:'1.0-2' }} {{ 'CUSTOMERS.LOYALTY.POINTS_SUFFIX' | transloco }}</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <mat-form-field appearance="outline" subscriptSizing="dynamic">
                <mat-label>{{ 'CUSTOMERS.LOYALTY.ADJUSTMENT_LABEL' | transloco }}</mat-label>
                <input matInput type="number" step="1" [(ngModel)]="points" [placeholder]="'CUSTOMERS.LOYALTY.ADJUSTMENT_PLACEHOLDER' | transloco">
                <mat-hint>{{ 'CUSTOMERS.LOYALTY.ADJUSTMENT_HINT' | transloco }}</mat-hint>
            </mat-form-field>
            <mat-form-field appearance="outline" subscriptSizing="dynamic">
                <mat-label>{{ 'CUSTOMERS.LOYALTY.NOTES_LABEL' | transloco }}</mat-label>
                <input matInput [(ngModel)]="notes">
            </mat-form-field>
        </div>

        <div class="mt-6">
            <h3 class="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">{{ 'CUSTOMERS.LOYALTY.RECENT_ACTIVITY' | transloco }}</h3>
            @if (loadingTxn()) {
                <div class="flex items-center justify-center py-4"><mat-spinner [diameter]="24"></mat-spinner></div>
            } @else if (transactions().length === 0) {
                <p class="text-sm text-gray-500 py-3 text-center">{{ 'CUSTOMERS.LOYALTY.EMPTY_TRANSACTIONS' | transloco }}</p>
            } @else {
                <div class="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden max-h-64 overflow-y-auto">
                    <table mat-table [dataSource]="transactions()" class="w-full">
                        <ng-container matColumnDef="when"><th mat-header-cell *matHeaderCellDef class="pl-3"><span class="text-xs font-medium text-gray-500">{{ 'CUSTOMERS.LOYALTY.COL_WHEN' | transloco }}</span></th>
                            <td mat-cell *matCellDef="let t" class="pl-3 text-xs">{{ t.occurredOn | date:'short' }}</td></ng-container>
                        <ng-container matColumnDef="type"><th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500">{{ 'CUSTOMERS.LOYALTY.COL_TYPE' | transloco }}</span></th>
                            <td mat-cell *matCellDef="let t" class="text-xs">{{ t.type }}</td></ng-container>
                        <ng-container matColumnDef="points"><th mat-header-cell *matHeaderCellDef class="!text-right pr-3"><span class="text-xs font-medium text-gray-500">{{ 'CUSTOMERS.LOYALTY.COL_POINTS' | transloco }}</span></th>
                            <td mat-cell *matCellDef="let t" class="!text-right pr-3 text-xs font-semibold"
                                [ngClass]="t.points >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'">
                                {{ t.points >= 0 ? '+' : '' }}{{ t.points | number:'1.0-2' }}
                            </td></ng-container>
                        <ng-container matColumnDef="notes"><th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500">{{ 'CUSTOMERS.LOYALTY.COL_NOTES' | transloco }}</span></th>
                            <td mat-cell *matCellDef="let t" class="text-xs text-gray-500">{{ t.notes || '—' }}</td></ng-container>
                        <tr mat-header-row *matHeaderRowDef="cols" class="bg-gray-50 dark:bg-gray-700"></tr>
                        <tr mat-row *matRowDef="let row; columns: cols"></tr>
                    </table>
                </div>
            }
        </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="!px-4 !pb-4">
        <button mat-button (click)="close()" [disabled]="saving()">{{ 'CUSTOMERS.LOYALTY.CLOSE_BUTTON' | transloco }}</button>
        <button mat-flat-button color="primary" (click)="save()" [disabled]="saving() || !canSubmit()">
            <mat-icon class="icon-size-5 mr-2">save</mat-icon>{{ (saving() ? 'CUSTOMERS.LOYALTY.SAVING' : 'CUSTOMERS.LOYALTY.APPLY_BUTTON') | transloco }}
        </button>
    </mat-dialog-actions>
</div>
    `,
})
export class LoyaltyAdjustDialogComponent implements OnInit {
    private readonly api = inject(LoyaltyService);
    private readonly snack = inject(MatSnackBar);
    private readonly dialogRef = inject(MatDialogRef<LoyaltyAdjustDialogComponent>);
    private readonly _transloco = inject(TranslocoService);

    points: number | null = null;
    notes = '';
    saving = signal(false);
    loadingTxn = signal(true);
    transactions = signal<LoyaltyTransactionDto[]>([]);
    cols = ['when', 'type', 'points', 'notes'];

    constructor(@Inject(MAT_DIALOG_DATA) public data: LoyaltyAdjustDialogData) {}

    ngOnInit(): void {
        this.api.transactions(this.data.customer.id).subscribe({
            next: t => { this.transactions.set(t); this.loadingTxn.set(false); },
            error: () => this.loadingTxn.set(false),
        });
    }

    canSubmit(): boolean {
        const n = Number(this.points);
        return Number.isFinite(n) && n !== 0;
    }

    save(): void {
        if (!this.canSubmit()) return;
        this.saving.set(true);
        this.api.adjust({
            customerId: this.data.customer.id,
            points: Number(this.points),
            notes: this.notes.trim() || undefined,
        }).subscribe({
            next: () => { this.saving.set(false); this.dialogRef.close(true); },
            error: err => {
                this.saving.set(false);
                const msg = err?.error?.exception ?? err?.error?.title ?? err?.message ?? this._transloco.translate('CUSTOMERS.LOYALTY.TOAST_FAILED');
                this.snack.open(msg, this._transloco.translate('CUSTOMERS.LOYALTY.TOAST_OK'), { duration: 6000 });
            },
        });
    }

    close(): void { this.dialogRef.close(false); }
}
