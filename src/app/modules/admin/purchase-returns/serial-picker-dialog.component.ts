import { CommonModule } from '@angular/common';
import { Component, Inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { TranslocoModule } from '@ngneat/transloco';

export interface SerialPickerDialogData {
    productName: string;
    sku: string;
    availableSerials: string[];
    initialSelected: string[];
}

/**
 * Bulk-friendly serial picker. Used by purchase-return-form when a GR item
 * has more available serials than the inline-row threshold (currently 5).
 * Scrollable checkbox list with search/scan, select-all-filtered, clear-all.
 */
@Component({
    selector: 'app-serial-picker-dialog',
    standalone: true,
    imports: [
        CommonModule, FormsModule, TranslocoModule, MatButtonModule, MatCheckboxModule,
        MatDialogModule, MatFormFieldModule, MatIconModule, MatInputModule,
    ],
    template: `
<div class="flex items-center gap-3 px-6 pt-5 pb-3 border-b border-gray-200 dark:border-gray-700">
    <div class="w-9 h-9 rounded-lg bg-violet-100 dark:bg-violet-900 flex items-center justify-center">
        <mat-icon class="text-violet-600 dark:text-violet-400">inventory_2</mat-icon>
    </div>
    <div class="flex-1 min-w-0">
        <h2 class="text-base font-semibold text-gray-900 dark:text-white truncate">{{ data.productName }}</h2>
        <p class="text-xs font-mono text-gray-500 truncate">{{ data.sku }}</p>
    </div>
    <span class="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 flex-shrink-0">
        {{ 'PURCHASING.SERIAL_PICKER.PICKED_BADGE' | transloco:{ picked: selected().length, total: data.availableSerials.length } }}
    </span>
</div>

<div class="px-6 py-3 border-b border-gray-200 dark:border-gray-700 flex flex-wrap items-center gap-2">
    <mat-form-field appearance="outline" subscriptSizing="dynamic" class="flex-1 min-w-[200px]">
        <mat-icon matPrefix class="icon-size-5 mr-1 text-gray-400">search</mat-icon>
        <input matInput [(ngModel)]="search" [placeholder]="'PURCHASING.SERIAL_PICKER.SEARCH_PLACEHOLDER' | transloco"
               (keyup.enter)="tickOnExactMatch()" cdkFocusInitial>
    </mat-form-field>
    <button type="button" mat-stroked-button (click)="selectAllVisible()" [disabled]="filtered().length === 0">
        {{ (search ? 'PURCHASING.SERIAL_PICKER.TICK_ALL_FILTERED' : 'PURCHASING.SERIAL_PICKER.TICK_ALL') | transloco }}
    </button>
    <button type="button" mat-stroked-button (click)="clearAll()" [disabled]="selected().length === 0">
        {{ 'PURCHASING.SERIAL_PICKER.CLEAR_ALL' | transloco }}
    </button>
</div>

<div class="max-h-[60vh] overflow-y-auto px-6 py-3">
    @if (filtered().length === 0) {
        <p class="text-sm text-gray-500 text-center py-8">{{ 'PURCHASING.SERIAL_PICKER.NO_MATCH' | transloco:{ q: search } }}</p>
    } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-1">
            @for (s of filtered(); track s) {
                <label class="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                    <mat-checkbox [checked]="isSelected(s)" (change)="toggle(s)"></mat-checkbox>
                    <span class="text-sm font-mono text-gray-700 dark:text-gray-200">{{ s }}</span>
                </label>
            }
        </div>
    }
</div>

<div class="px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
    <button type="button" mat-stroked-button (click)="cancel()">{{ 'PURCHASING.SERIAL_PICKER.CANCEL' | transloco }}</button>
    <button type="button" mat-flat-button color="primary" (click)="apply()">
        {{ 'PURCHASING.SERIAL_PICKER.APPLY' | transloco:{ count: selected().length } }}
    </button>
</div>
    `,
})
export class SerialPickerDialogComponent {
    search = '';
    selected = signal<string[]>([]);

    constructor(
        public dialogRef: MatDialogRef<SerialPickerDialogComponent, string[] | null>,
        @Inject(MAT_DIALOG_DATA) public data: SerialPickerDialogData,
    ) {
        this.selected.set([...data.initialSelected]);
    }

    filtered(): string[] {
        const q = (this.search ?? '').trim().toLowerCase();
        if (!q) return this.data.availableSerials;
        return this.data.availableSerials.filter(s => s.toLowerCase().includes(q));
    }

    isSelected(s: string): boolean {
        return this.selected().includes(s);
    }

    toggle(s: string): void {
        const cur = this.selected();
        this.selected.set(cur.includes(s) ? cur.filter(x => x !== s) : [...cur, s]);
    }

    selectAllVisible(): void {
        const merged = new Set([...this.selected(), ...this.filtered()]);
        this.selected.set([...merged]);
    }

    clearAll(): void {
        this.selected.set([]);
    }

    /**
     * Scan flow: type/scan a full serial, hit Enter → tick that serial and
     * clear the search box so the next scan lands on a fresh field.
     */
    tickOnExactMatch(): void {
        const q = (this.search ?? '').trim();
        if (!q) return;
        const exact = this.data.availableSerials.find(s => s.toLowerCase() === q.toLowerCase());
        if (exact && !this.isSelected(exact)) {
            this.toggle(exact);
            this.search = '';
        }
    }

    apply(): void {
        this.dialogRef.close(this.selected());
    }

    cancel(): void {
        this.dialogRef.close(null);
    }
}
