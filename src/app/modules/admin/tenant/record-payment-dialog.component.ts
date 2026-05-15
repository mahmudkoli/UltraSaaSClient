import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TenantPaymentsService } from 'app/core/billing/billing.service';
import { TenantPaymentMethod } from 'app/core/billing/billing.types';

export interface RecordPaymentDialogData {
    tenantId: string;
    tenantName: string;
    /** Current ValidUpto — used to pre-fill PeriodStart so paying ahead chains naturally. */
    currentValidUpto?: string;
}

const METHODS: TenantPaymentMethod[] = ['Bkash', 'Nagad', 'BankTransfer', 'Cash', 'Cheque', 'Other'];

/**
 * Platform-admin dialog to record a manual subscription payment against a
 * tenant. The form pre-fills sensible defaults: PeriodStart = max(today,
 * current ValidUpto) so paying ahead extends rather than overlaps; PeriodEnd
 * = PeriodStart + 30 days. The backend's RecordPayment handler does the heavy
 * lifting — bumps ValidUpto, flips PaymentStatus, drops a notification.
 */
@Component({
    selector: 'app-record-payment-dialog',
    standalone: true,
    imports: [
        CommonModule, FormsModule, MatButtonModule, MatDatepickerModule, MatDialogModule,
        MatFormFieldModule, MatIconModule, MatInputModule, MatNativeDateModule, MatSelectModule,
    ],
    template: `
<div class="p-6 min-w-[480px] max-w-[560px]">
    <div class="flex items-center gap-3 mb-4">
        <div class="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
            <mat-icon class="text-emerald-600">payments</mat-icon>
        </div>
        <div>
            <h2 class="text-lg font-semibold">Record payment</h2>
            <p class="text-xs text-gray-500">{{ data.tenantName }} — extends ValidUpto + inserts notification</p>
        </div>
    </div>

    <div class="grid grid-cols-2 gap-3">
        <mat-form-field appearance="outline">
            <mat-label>Amount (BDT)</mat-label>
            <input matInput type="number" min="0" step="0.01" [(ngModel)]="amount">
        </mat-form-field>
        <mat-form-field appearance="outline">
            <mat-label>Method</mat-label>
            <mat-select [(ngModel)]="method">
                @for (m of methods; track m) {
                    <mat-option [value]="m">{{ m }}</mat-option>
                }
            </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" class="col-span-2">
            <mat-label>Reference (bKash trxID / cheque number)</mat-label>
            <input matInput [(ngModel)]="reference" placeholder="e.g. BKA8X9Z1Q3">
        </mat-form-field>
        <mat-form-field appearance="outline">
            <mat-label>Paid on</mat-label>
            <input matInput [matDatepicker]="paidPicker" [(ngModel)]="paidOn">
            <mat-datepicker-toggle matIconSuffix [for]="paidPicker"></mat-datepicker-toggle>
            <mat-datepicker #paidPicker></mat-datepicker>
        </mat-form-field>
        <div></div>
        <mat-form-field appearance="outline">
            <mat-label>Period start</mat-label>
            <input matInput [matDatepicker]="startPicker" [(ngModel)]="periodStart">
            <mat-datepicker-toggle matIconSuffix [for]="startPicker"></mat-datepicker-toggle>
            <mat-datepicker #startPicker></mat-datepicker>
        </mat-form-field>
        <mat-form-field appearance="outline">
            <mat-label>Period end</mat-label>
            <input matInput [matDatepicker]="endPicker" [(ngModel)]="periodEnd">
            <mat-datepicker-toggle matIconSuffix [for]="endPicker"></mat-datepicker-toggle>
            <mat-datepicker #endPicker></mat-datepicker>
        </mat-form-field>
        <mat-form-field appearance="outline" class="col-span-2">
            <mat-label>Notes (internal)</mat-label>
            <textarea matInput rows="2" [(ngModel)]="notes"></textarea>
        </mat-form-field>
    </div>

    @if (errorMsg()) {
        <p class="text-xs text-rose-600 mt-1">{{ errorMsg() }}</p>
    }

    <div class="flex justify-end gap-2 mt-4">
        <button mat-button (click)="ref.close()" [disabled]="busy()">Cancel</button>
        <button mat-flat-button color="primary" (click)="submit()" [disabled]="busy() || !valid()">
            <mat-icon class="icon-size-5 mr-1">check</mat-icon>
            <span>{{ busy() ? 'Recording…' : 'Record payment' }}</span>
        </button>
    </div>
</div>
    `,
})
export class RecordPaymentDialogComponent implements OnInit {
    private readonly api = inject(TenantPaymentsService);
    private readonly snack = inject(MatSnackBar);

    readonly methods = METHODS;
    amount: number | null = null;
    method: TenantPaymentMethod = 'Bkash';
    reference = '';
    paidOn: Date = new Date();
    periodStart: Date = new Date();
    periodEnd: Date = new Date();
    notes = '';

    busy = signal(false);
    errorMsg = signal<string | null>(null);

    constructor(
        public ref: MatDialogRef<RecordPaymentDialogComponent, boolean>,
        @Inject(MAT_DIALOG_DATA) public data: RecordPaymentDialogData,
    ) {}

    ngOnInit(): void {
        // Pre-fill: PeriodStart = max(today, current ValidUpto), so paying ahead
        // chains naturally rather than overlapping. PeriodEnd = PeriodStart + 30.
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let start = today;
        if (this.data.currentValidUpto) {
            const upto = new Date(this.data.currentValidUpto);
            if (upto > today) start = upto;
        }
        this.periodStart = new Date(start);
        const end = new Date(start);
        end.setDate(end.getDate() + 30);
        this.periodEnd = end;
        this.paidOn = today;
    }

    valid(): boolean {
        return !!this.amount && this.amount > 0
            && !!this.periodStart && !!this.periodEnd
            && this.periodEnd.getTime() > this.periodStart.getTime();
    }

    submit(): void {
        if (!this.valid()) return;
        this.busy.set(true);
        this.errorMsg.set(null);
        this.api.record(this.data.tenantId, {
            amount: this.amount!,
            method: this.method,
            reference: this.reference?.trim() || undefined,
            paidOn: this.paidOn.toISOString(),
            periodStart: this.periodStart.toISOString(),
            periodEnd: this.periodEnd.toISOString(),
            notes: this.notes?.trim() || undefined,
        }).subscribe({
            next: () => {
                this.busy.set(false);
                const upto = this.periodEnd.toLocaleDateString();
                this.snack.open(`Payment recorded — subscription extended to ${upto}.`, 'OK', { duration: 4000 });
                this.ref.close(true);
            },
            error: err => {
                this.busy.set(false);
                this.errorMsg.set(err?.error?.exception ?? err?.error?.title ?? err?.message ?? 'Failed to record payment.');
            },
        });
    }
}
