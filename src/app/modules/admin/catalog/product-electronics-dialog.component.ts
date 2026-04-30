import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductDto } from 'app/core/catalog/catalog.types';
import { ProductElectronicsService } from 'app/core/inventory/inventory.service';
import { ProductElectronicsDto } from 'app/core/inventory/inventory.types';

export interface ElectronicsDialogData {
    product: ProductDto;
}

@Component({
    selector: 'app-product-electronics-dialog',
    standalone: true,
    imports: [
        CommonModule, FormsModule,
        MatButtonModule, MatCheckboxModule, MatDialogModule, MatFormFieldModule,
        MatIconModule, MatInputModule, MatProgressSpinnerModule, MatSnackBarModule,
    ],
    template: `
<div class="p-1">
    <div class="flex items-center space-x-3 px-4 pt-4 pb-2">
        <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 shadow">
            <mat-icon class="text-white">memory</mat-icon>
        </div>
        <div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Electronics Details</h2>
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ data.product.name }} · {{ data.product.sku }}</p>
        </div>
    </div>
    <mat-dialog-content class="!p-4">
        @if (loading()) {
            <div class="flex items-center justify-center py-8"><mat-spinner [diameter]="32"></mat-spinner></div>
        } @else {
            <p class="text-xs text-gray-500 mb-3">Set the serial-tracking and warranty metadata. Goods receipts auto-create StockSerials when "Requires serial" is on.</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <mat-form-field appearance="outline" subscriptSizing="dynamic">
                    <mat-label>Model number</mat-label>
                    <input matInput [(ngModel)]="form.modelNumber">
                </mat-form-field>
                <mat-form-field appearance="outline" subscriptSizing="dynamic">
                    <mat-label>Warranty (months)</mat-label>
                    <input matInput type="number" min="0" step="1" [(ngModel)]="form.warrantyMonths">
                </mat-form-field>
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="sm:col-span-2">
                    <mat-label>Warranty terms</mat-label>
                    <textarea matInput rows="3" [(ngModel)]="form.warrantyTerms"></textarea>
                </mat-form-field>
            </div>

            <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                <mat-checkbox [(ngModel)]="form.requiresSerial">
                    <span class="text-sm">Requires serial number</span>
                    <span class="block text-xs text-gray-500">Goods receipts open the serial-entry rows; sales must capture a serial.</span>
                </mat-checkbox>
                <mat-checkbox [(ngModel)]="form.isIMEIRequired" [disabled]="!form.requiresSerial">
                    <span class="text-sm">IMEI required</span>
                    <span class="block text-xs text-gray-500">For phones / cellular devices. Captured alongside serial.</span>
                </mat-checkbox>
            </div>
        }
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="!px-4 !pb-4">
        <button mat-button (click)="close()" [disabled]="saving()">Cancel</button>
        <button mat-flat-button color="primary" (click)="save()" [disabled]="loading() || saving()">
            <mat-icon class="icon-size-5 mr-2">save</mat-icon>{{ saving() ? 'Saving…' : 'Save' }}
        </button>
    </mat-dialog-actions>
</div>
    `,
})
export class ProductElectronicsDialogComponent implements OnInit {
    private readonly api = inject(ProductElectronicsService);
    private readonly snack = inject(MatSnackBar);
    private readonly dialogRef = inject(MatDialogRef<ProductElectronicsDialogComponent>);

    loading = signal(true);
    saving = signal(false);

    form: Partial<ProductElectronicsDto> = {
        modelNumber: '',
        warrantyMonths: 0,
        warrantyTerms: '',
        requiresSerial: false,
        isIMEIRequired: false,
    };

    constructor(@Inject(MAT_DIALOG_DATA) public data: ElectronicsDialogData) {}

    ngOnInit(): void {
        this.api.get(this.data.product.id).subscribe({
            next: existing => {
                if (existing) {
                    this.form = {
                        modelNumber: existing.modelNumber ?? '',
                        warrantyMonths: existing.warrantyMonths ?? 0,
                        warrantyTerms: existing.warrantyTerms ?? '',
                        requiresSerial: existing.requiresSerial,
                        isIMEIRequired: existing.isIMEIRequired,
                    };
                }
                this.loading.set(false);
            },
            error: () => this.loading.set(false),
        });
    }

    save(): void {
        this.saving.set(true);
        this.api.upsert(this.data.product.id, {
            modelNumber: this.form.modelNumber?.trim() || undefined,
            warrantyMonths: Number(this.form.warrantyMonths ?? 0),
            warrantyTerms: this.form.warrantyTerms?.trim() || undefined,
            requiresSerial: !!this.form.requiresSerial,
            isIMEIRequired: !!this.form.requiresSerial && !!this.form.isIMEIRequired,
        }).subscribe({
            next: () => { this.saving.set(false); this.dialogRef.close(true); },
            error: err => {
                this.saving.set(false);
                const msg = err?.error?.exception ?? err?.error?.title ?? err?.message ?? 'Save failed';
                this.snack.open(msg, 'OK', { duration: 6000 });
            },
        });
    }

    close(): void { this.dialogRef.close(false); }
}
