import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { TranslocoModule } from '@ngneat/transloco';
import { ShiftsService } from 'app/core/sales/shifts.service';
import { ShiftDto } from 'app/core/sales/shifts.types';

// ── Open shift dialog ────────────────────────────────────────────────────

export interface OpenShiftDialogData {
    outletId: string;
    outletName: string;
}

@Component({
    selector: 'app-open-shift-dialog',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslocoModule, MatButtonModule, MatDialogModule, MatFormFieldModule, MatIconModule, MatInputModule],
    template: `
<div class="p-1">
    <div class="flex items-center space-x-3 px-4 pt-4 pb-2">
        <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow">
            <mat-icon class="text-white">point_of_sale</mat-icon>
        </div>
        <div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">{{ 'SHIFTS.OPEN_DIALOG.TITLE' | transloco }}</h2>
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ data.outletName }}</p>
        </div>
    </div>
    <mat-dialog-content class="!p-4">
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">{{ 'SHIFTS.OPEN_DIALOG.INTRO' | transloco }}</p>
        <mat-form-field class="w-full" appearance="outline">
            <mat-label>{{ 'SHIFTS.OPEN_DIALOG.OPENING_FLOAT_LABEL' | transloco }}</mat-label>
            <input matInput type="number" min="0" step="0.01" [(ngModel)]="openingFloat" autofocus>
            <mat-icon matSuffix>payments</mat-icon>
        </mat-form-field>
        <mat-form-field class="w-full" appearance="outline">
            <mat-label>{{ 'SHIFTS.OPEN_DIALOG.NOTES_LABEL' | transloco }}</mat-label>
            <input matInput [(ngModel)]="notes">
        </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="!px-4 !pb-4">
        <button mat-button (click)="close()" [disabled]="saving()">{{ 'SHIFTS.OPEN_DIALOG.CANCEL_BUTTON' | transloco }}</button>
        <button mat-flat-button color="primary" (click)="submit()" [disabled]="saving()">
            <mat-icon class="icon-size-5 mr-2">play_arrow</mat-icon>{{ (saving() ? 'SHIFTS.OPEN_DIALOG.OPENING' : 'SHIFTS.OPEN_DIALOG.OPEN_BUTTON') | transloco }}
        </button>
    </mat-dialog-actions>
</div>
    `,
})
export class OpenShiftDialogComponent {
    private readonly api = inject(ShiftsService);
    private readonly dialogRef = inject(MatDialogRef<OpenShiftDialogComponent>);

    openingFloat = 0;
    notes = '';
    saving = signal(false);

    constructor(@Inject(MAT_DIALOG_DATA) public data: OpenShiftDialogData) {}

    submit(): void {
        this.saving.set(true);
        this.api.open({
            outletId: this.data.outletId,
            openingFloat: Number(this.openingFloat) || 0,
            notes: this.notes || undefined,
        }).subscribe({
            next: id => { this.saving.set(false); this.dialogRef.close(id); },
            error: () => this.saving.set(false),
        });
    }

    close(): void { this.dialogRef.close(null); }
}

// ── Close shift dialog ───────────────────────────────────────────────────

export interface CloseShiftDialogData {
    shift: ShiftDto;
    outletName: string;
}

@Component({
    selector: 'app-close-shift-dialog',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslocoModule, MatButtonModule, MatDialogModule, MatFormFieldModule, MatIconModule, MatInputModule],
    template: `
<div class="p-1">
    <div class="flex items-center space-x-3 px-4 pt-4 pb-2">
        <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-rose-500 to-orange-600 shadow">
            <mat-icon class="text-white">stop_circle</mat-icon>
        </div>
        <div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">{{ 'SHIFTS.CLOSE_DIALOG.TITLE' | transloco }}</h2>
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ 'SHIFTS.CLOSE_DIALOG.SUBTITLE' | transloco:{ outlet: data.outletName, when: (data.shift.openedAt | date:'short') } }}</p>
        </div>
    </div>
    <mat-dialog-content class="!p-4">
        <div class="text-sm space-y-1 mb-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700">
            <div class="flex justify-between"><span class="text-gray-600 dark:text-gray-400">{{ 'SHIFTS.CLOSE_DIALOG.OPENING_FLOAT' | transloco }}</span><span class="font-medium">{{ data.shift.openingFloat | number:'1.2-2' }}</span></div>
        </div>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">{{ 'SHIFTS.CLOSE_DIALOG.INTRO' | transloco }}</p>
        <mat-form-field class="w-full" appearance="outline">
            <mat-label>{{ 'SHIFTS.CLOSE_DIALOG.CLOSING_FLOAT_LABEL' | transloco }}</mat-label>
            <input matInput type="number" min="0" step="0.01" [(ngModel)]="closingFloat" autofocus>
            <mat-icon matSuffix>payments</mat-icon>
        </mat-form-field>
        <mat-form-field class="w-full" appearance="outline">
            <mat-label>{{ 'SHIFTS.CLOSE_DIALOG.NOTES_LABEL' | transloco }}</mat-label>
            <input matInput [(ngModel)]="notes">
        </mat-form-field>
        @if (closedShift(); as c) {
            <div class="text-sm space-y-1 mt-2 p-3 rounded-lg" [class.bg-emerald-50]="(c.variance ?? 0) === 0" [class.bg-amber-50]="(c.variance ?? 0) !== 0">
                <div class="flex justify-between"><span class="text-gray-600">{{ 'SHIFTS.CLOSE_DIALOG.EXPECTED_CASH' | transloco }}</span><span class="font-medium">{{ c.expectedCash | number:'1.2-2' }}</span></div>
                <div class="flex justify-between"><span class="text-gray-600">{{ 'SHIFTS.CLOSE_DIALOG.COUNTED' | transloco }}</span><span class="font-medium">{{ c.closingFloat | number:'1.2-2' }}</span></div>
                <div class="flex justify-between font-semibold"><span>{{ 'SHIFTS.CLOSE_DIALOG.VARIANCE' | transloco }}</span><span [class.text-rose-700]="(c.variance ?? 0) < 0" [class.text-emerald-700]="(c.variance ?? 0) >= 0">{{ c.variance | number:'1.2-2' }}</span></div>
            </div>
        }
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="!px-4 !pb-4">
        <button mat-button (click)="close()" [disabled]="saving()">{{ (closedShift() ? 'SHIFTS.CLOSE_DIALOG.DONE_BUTTON' : 'SHIFTS.CLOSE_DIALOG.CANCEL_BUTTON') | transloco }}</button>
        <button mat-flat-button color="warn" (click)="submit()" [disabled]="saving() || !!closedShift()">
            <mat-icon class="icon-size-5 mr-2">stop_circle</mat-icon>{{ (saving() ? 'SHIFTS.CLOSE_DIALOG.CLOSING' : 'SHIFTS.CLOSE_DIALOG.CLOSE_BUTTON') | transloco }}
        </button>
    </mat-dialog-actions>
</div>
    `,
})
export class CloseShiftDialogComponent {
    private readonly api = inject(ShiftsService);
    private readonly dialogRef = inject(MatDialogRef<CloseShiftDialogComponent>);

    closingFloat = 0;
    notes = '';
    saving = signal(false);
    closedShift = signal<ShiftDto | null>(null);

    constructor(@Inject(MAT_DIALOG_DATA) public data: CloseShiftDialogData) {}

    submit(): void {
        this.saving.set(true);
        this.api.close(this.data.shift.id, {
            id: this.data.shift.id,
            closingFloat: Number(this.closingFloat) || 0,
            notes: this.notes || undefined,
        }).subscribe({
            next: c => { this.saving.set(false); this.closedShift.set(c); },
            error: () => this.saving.set(false),
        });
    }

    close(): void { this.dialogRef.close(this.closedShift()); }
}
