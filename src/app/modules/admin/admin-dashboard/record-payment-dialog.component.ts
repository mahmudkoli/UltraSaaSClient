import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { RecordPaymentRequest, TenantPaymentMethod } from '../../../core/billing/billing.types';

export interface RecordPaymentDialogData {
    tenantId: string;
    tenantName: string;
}

@Component({
    selector: 'record-payment-dialog',
    templateUrl: './record-payment-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatDialogModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
    ],
})
export class RecordPaymentDialogComponent {
    form: FormGroup;

    constructor(
        private _fb: FormBuilder,
        public dialogRef: MatDialogRef<RecordPaymentDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: RecordPaymentDialogData,
    ) {
        const today = new Date();
        const periodEnd = new Date(today);
        periodEnd.setDate(periodEnd.getDate() + 30);
        this.form = this._fb.group({
            amount: [null, [Validators.required, Validators.min(1)]],
            method: ['BankTransfer' as TenantPaymentMethod, Validators.required],
            paidOn: [today.toISOString().slice(0, 10), Validators.required],
            periodStart: [today.toISOString().slice(0, 10), Validators.required],
            periodEnd: [periodEnd.toISOString().slice(0, 10), Validators.required],
            reference: [''],
            notes: [''],
        });
    }

    submit(): void {
        if (this.form.invalid) return;
        const v = this.form.value;
        const req: RecordPaymentRequest = {
            tenantId: this.data.tenantId,
            amount: Number(v.amount),
            method: v.method,
            paidOn: new Date(v.paidOn).toISOString(),
            periodStart: new Date(v.periodStart).toISOString(),
            periodEnd: new Date(v.periodEnd).toISOString(),
            reference: v.reference || undefined,
            notes: v.notes || undefined,
        };
        this.dialogRef.close(req);
    }

    cancel(): void {
        this.dialogRef.close(null);
    }
}
