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
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductDto } from 'app/core/catalog/catalog.types';
import { ProductPharmacyService } from 'app/core/pharmacy/pharmacy.service';
import { ProductPharmacyDto } from 'app/core/pharmacy/pharmacy.types';

export interface PharmacyDialogData {
    product: ProductDto;
}

@Component({
    selector: 'app-product-pharmacy-dialog',
    standalone: true,
    imports: [
        CommonModule, FormsModule,
        MatButtonModule, MatCheckboxModule, MatDialogModule, MatFormFieldModule,
        MatIconModule, MatInputModule, MatProgressSpinnerModule, MatSelectModule, MatSnackBarModule,
    ],
    template: `
<div class="p-1">
    <div class="flex items-center space-x-3 px-4 pt-4 pb-2">
        <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow">
            <mat-icon class="text-white">medication</mat-icon>
        </div>
        <div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Pharmacy Details</h2>
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ data.product.name }} · {{ data.product.sku }}</p>
        </div>
    </div>
    <mat-dialog-content class="!p-4">
        @if (loading()) {
            <div class="flex items-center justify-center py-8"><mat-spinner [diameter]="32"></mat-spinner></div>
        } @else {
            <p class="text-xs text-gray-500 mb-3">Set the medication metadata used by FEFO batch picking and prescription validation. Leave fields blank if not applicable.</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <mat-form-field appearance="outline" subscriptSizing="dynamic">
                    <mat-label>Generic name</mat-label>
                    <input matInput [(ngModel)]="form.genericName" placeholder="e.g. Paracetamol">
                </mat-form-field>
                <mat-form-field appearance="outline" subscriptSizing="dynamic">
                    <mat-label>Active ingredient</mat-label>
                    <input matInput [(ngModel)]="form.activeIngredient">
                </mat-form-field>
                <mat-form-field appearance="outline" subscriptSizing="dynamic">
                    <mat-label>Strength</mat-label>
                    <input matInput [(ngModel)]="form.strength" placeholder="e.g. 500 mg">
                </mat-form-field>
                <mat-form-field appearance="outline" subscriptSizing="dynamic">
                    <mat-label>Dosage form</mat-label>
                    <mat-select [(ngModel)]="form.dosageForm">
                        <mat-option [value]="undefined">—</mat-option>
                        <mat-option value="Tablet">Tablet</mat-option>
                        <mat-option value="Capsule">Capsule</mat-option>
                        <mat-option value="Syrup">Syrup</mat-option>
                        <mat-option value="Suspension">Suspension</mat-option>
                        <mat-option value="Injection">Injection</mat-option>
                        <mat-option value="Cream">Cream / Ointment</mat-option>
                        <mat-option value="Drops">Drops</mat-option>
                        <mat-option value="Inhaler">Inhaler</mat-option>
                        <mat-option value="Other">Other</mat-option>
                    </mat-select>
                </mat-form-field>
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="sm:col-span-2">
                    <mat-label>Manufacturer</mat-label>
                    <input matInput [(ngModel)]="form.manufacturer">
                </mat-form-field>
            </div>

            <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                <mat-checkbox [(ngModel)]="form.requiresBatch">
                    <span class="text-sm">Requires batch tracking</span>
                    <span class="block text-xs text-gray-500">Sales must pick a batch (FEFO by default). Goods receipts upsert batches.</span>
                </mat-checkbox>
                <mat-checkbox [(ngModel)]="form.requiresPrescription">
                    <span class="text-sm">Requires prescription</span>
                    <span class="block text-xs text-gray-500">POS will prompt for a prescription # when this product is sold.</span>
                </mat-checkbox>
                <mat-checkbox [(ngModel)]="form.controlledSubstance">
                    <span class="text-sm">Controlled substance</span>
                    <span class="block text-xs text-gray-500">Flagged on receipts and reports for regulatory tracking.</span>
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
export class ProductPharmacyDialogComponent implements OnInit {
    private readonly api = inject(ProductPharmacyService);
    private readonly snack = inject(MatSnackBar);
    private readonly dialogRef = inject(MatDialogRef<ProductPharmacyDialogComponent>);

    loading = signal(true);
    saving = signal(false);

    form: Partial<ProductPharmacyDto> = {
        genericName: '',
        activeIngredient: '',
        strength: '',
        dosageForm: undefined,
        manufacturer: '',
        requiresBatch: false,
        requiresPrescription: false,
        controlledSubstance: false,
    };

    constructor(@Inject(MAT_DIALOG_DATA) public data: PharmacyDialogData) {}

    ngOnInit(): void {
        this.api.get(this.data.product.id).subscribe({
            next: existing => {
                if (existing) {
                    this.form = {
                        genericName: existing.genericName ?? '',
                        activeIngredient: existing.activeIngredient ?? '',
                        strength: existing.strength ?? '',
                        dosageForm: existing.dosageForm,
                        manufacturer: existing.manufacturer ?? '',
                        requiresBatch: existing.requiresBatch,
                        requiresPrescription: existing.requiresPrescription,
                        controlledSubstance: existing.controlledSubstance,
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
            genericName: this.form.genericName?.trim() || undefined,
            activeIngredient: this.form.activeIngredient?.trim() || undefined,
            strength: this.form.strength?.trim() || undefined,
            dosageForm: this.form.dosageForm || undefined,
            manufacturer: this.form.manufacturer?.trim() || undefined,
            requiresBatch: !!this.form.requiresBatch,
            requiresPrescription: !!this.form.requiresPrescription,
            controlledSubstance: !!this.form.controlledSubstance,
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
