import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { PrescriptionsService } from 'app/core/pharmacy/pharmacy.service';
import { PrescriptionDto } from 'app/core/pharmacy/pharmacy.types';

interface MedicationRow {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
}

@Component({
    selector: 'app-prescription-form',
    standalone: true,
    imports: [
        CommonModule, FormsModule, RouterModule, TranslocoModule,
        MatButtonModule, MatDatepickerModule, MatNativeDateModule, MatFormFieldModule,
        MatIconModule, MatInputModule, MatSnackBarModule, MatTooltipModule,
    ],
    template: `
<div class="flex flex-col flex-auto min-w-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 relative">
    <div class="absolute inset-0 opacity-5 dark:opacity-10"><div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, rgba(0,0,0,0.1) 1px, transparent 0); background-size: 20px 20px;"></div></div>
    <div class="relative z-10 flex flex-col flex-auto min-w-0">
        <div class="flex flex-col sm:flex-row space-y-16 sm:space-y-0 flex-0 sm:items-center sm:justify-between p-2 sm:py-3 sm:px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
            <div class="flex items-center space-x-4">
                <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-teal-500 to-emerald-600 rounded-xl shadow-lg"><mat-icon class="text-white">prescriptions</mat-icon></div>
                <div>
                    <h2 class="text-3xl font-bold tracking-tight leading-7 sm:leading-10 truncate bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">{{ 'PHARMACY.PRESCRIPTIONS.FORM.TITLE' | transloco }}</h2>
                    <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">{{ 'PHARMACY.PRESCRIPTIONS.FORM.SUBTITLE' | transloco }}</p>
                </div>
            </div>
            <button mat-stroked-button class="h-12 px-6 rounded-lg" routerLink="/prescriptions"><mat-icon class="icon-size-5 mr-2">arrow_back</mat-icon><span>{{ 'PHARMACY.PRESCRIPTIONS.FORM.CANCEL_BUTTON' | transloco }}</span></button>
        </div>

        <div class="flex-auto p-4 sm:p-6">
            <div class="grid grid-cols-1 gap-6">
                <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 class="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">{{ 'PHARMACY.PRESCRIPTIONS.FORM.SECTION_PRESCRIPTION' | transloco }}</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <mat-form-field appearance="outline" class="w-full" hideRequiredMarker>
                            <mat-label>{{ 'PHARMACY.PRESCRIPTIONS.FORM.RX_NUMBER_LABEL' | transloco }} <span class="text-rose-600">*</span></mat-label>
                            <input matInput [(ngModel)]="form.prescriptionNumber" required maxlength="64">
                        </mat-form-field>
                        <mat-form-field appearance="outline" class="w-full">
                            <mat-label>{{ 'PHARMACY.PRESCRIPTIONS.FORM.PRESCRIBED_ON_LABEL' | transloco }}</mat-label>
                            <input matInput [matDatepicker]="d1" [(ngModel)]="prescriptionDate">
                            <mat-datepicker-toggle matIconSuffix [for]="d1"></mat-datepicker-toggle>
                            <mat-datepicker #d1></mat-datepicker>
                        </mat-form-field>
                        <mat-form-field appearance="outline" class="w-full">
                            <mat-label>{{ 'PHARMACY.PRESCRIPTIONS.FORM.VALID_UNTIL_LABEL' | transloco }} <span class="text-gray-400 text-xs">{{ 'PHARMACY.PRESCRIPTIONS.FORM.OPTIONAL_HINT' | transloco }}</span></mat-label>
                            <input matInput [matDatepicker]="d2" [(ngModel)]="validUntil">
                            <mat-datepicker-toggle matIconSuffix [for]="d2"></mat-datepicker-toggle>
                            <mat-datepicker #d2></mat-datepicker>
                        </mat-form-field>
                    </div>
                </div>

                <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 class="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">{{ 'PHARMACY.PRESCRIPTIONS.FORM.SECTION_DOCTOR' | transloco }}</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <mat-form-field appearance="outline" class="w-full" hideRequiredMarker>
                            <mat-label>{{ 'PHARMACY.PRESCRIPTIONS.FORM.DOCTOR_NAME_LABEL' | transloco }} <span class="text-rose-600">*</span></mat-label>
                            <input matInput [(ngModel)]="form.doctorName" required maxlength="150">
                        </mat-form-field>
                        <mat-form-field appearance="outline" class="w-full">
                            <mat-label>{{ 'PHARMACY.PRESCRIPTIONS.FORM.LICENSE_LABEL' | transloco }} <span class="text-gray-400 text-xs">{{ 'PHARMACY.PRESCRIPTIONS.FORM.OPTIONAL_HINT' | transloco }}</span></mat-label>
                            <input matInput [(ngModel)]="form.doctorLicense">
                        </mat-form-field>
                        <mat-form-field appearance="outline" class="w-full">
                            <mat-label>{{ 'PHARMACY.PRESCRIPTIONS.FORM.PHONE_LABEL' | transloco }} <span class="text-gray-400 text-xs">{{ 'PHARMACY.PRESCRIPTIONS.FORM.OPTIONAL_HINT' | transloco }}</span></mat-label>
                            <input matInput [(ngModel)]="form.doctorPhone">
                        </mat-form-field>
                        <mat-form-field appearance="outline" class="w-full">
                            <mat-label>{{ 'PHARMACY.PRESCRIPTIONS.FORM.HOSPITAL_LABEL' | transloco }} <span class="text-gray-400 text-xs">{{ 'PHARMACY.PRESCRIPTIONS.FORM.OPTIONAL_HINT' | transloco }}</span></mat-label>
                            <input matInput [(ngModel)]="form.hospital">
                        </mat-form-field>
                    </div>
                </div>

                <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 class="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">{{ 'PHARMACY.PRESCRIPTIONS.FORM.SECTION_PATIENT' | transloco }}</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <mat-form-field appearance="outline" class="w-full" hideRequiredMarker>
                            <mat-label>{{ 'PHARMACY.PRESCRIPTIONS.FORM.PATIENT_NAME_LABEL' | transloco }} <span class="text-rose-600">*</span></mat-label>
                            <input matInput [(ngModel)]="form.patientName" required maxlength="150">
                        </mat-form-field>
                        <mat-form-field appearance="outline" class="w-full">
                            <mat-label>{{ 'PHARMACY.PRESCRIPTIONS.FORM.PATIENT_PHONE_LABEL' | transloco }} <span class="text-gray-400 text-xs">{{ 'PHARMACY.PRESCRIPTIONS.FORM.OPTIONAL_HINT' | transloco }}</span></mat-label>
                            <input matInput [(ngModel)]="form.patientPhone">
                        </mat-form-field>
                        <mat-form-field appearance="outline" class="w-full">
                            <mat-label>{{ 'PHARMACY.PRESCRIPTIONS.FORM.AGE_LABEL' | transloco }} <span class="text-gray-400 text-xs">{{ 'PHARMACY.PRESCRIPTIONS.FORM.OPTIONAL_HINT' | transloco }}</span></mat-label>
                            <input matInput type="number" min="0" max="150" [(ngModel)]="form.patientAge">
                        </mat-form-field>
                        <mat-form-field appearance="outline" class="w-full sm:col-span-2 lg:col-span-3">
                            <mat-label>{{ 'PHARMACY.PRESCRIPTIONS.FORM.DIAGNOSIS_LABEL' | transloco }} <span class="text-gray-400 text-xs">{{ 'PHARMACY.PRESCRIPTIONS.FORM.OPTIONAL_HINT' | transloco }}</span></mat-label>
                            <textarea matInput rows="2" [(ngModel)]="form.diagnosis"></textarea>
                        </mat-form-field>
                    </div>
                </div>

                <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                    <div class="flex items-center justify-between mb-3">
                        <h3 class="text-sm font-semibold uppercase tracking-wider text-gray-500">{{ 'PHARMACY.PRESCRIPTIONS.FORM.SECTION_MEDICATIONS' | transloco }} <span class="text-gray-400 text-xs normal-case">{{ 'PHARMACY.PRESCRIPTIONS.FORM.OPTIONAL_HINT' | transloco }}</span></h3>
                        <button mat-stroked-button (click)="addMedication()"><mat-icon class="icon-size-5 mr-2">add</mat-icon>{{ 'PHARMACY.PRESCRIPTIONS.FORM.ADD_MEDICATION' | transloco }}</button>
                    </div>
                    <div class="space-y-3">
                        @for (m of medications(); track i; let i = $index) {
                            <div class="grid grid-cols-12 gap-3 items-start">
                                <mat-form-field appearance="outline" class="col-span-12 sm:col-span-5 lg:col-span-4" subscriptSizing="dynamic">
                                    <mat-label>{{ 'PHARMACY.PRESCRIPTIONS.FORM.MEDICATION_LABEL' | transloco }}</mat-label>
                                    <input matInput [(ngModel)]="m.name" [placeholder]="'PHARMACY.PRESCRIPTIONS.FORM.MEDICATION_PLACEHOLDER' | transloco">
                                </mat-form-field>
                                <mat-form-field appearance="outline" class="col-span-6 sm:col-span-3 lg:col-span-3" subscriptSizing="dynamic">
                                    <mat-label>{{ 'PHARMACY.PRESCRIPTIONS.FORM.DOSAGE_LABEL' | transloco }}</mat-label>
                                    <input matInput [(ngModel)]="m.dosage" [placeholder]="'PHARMACY.PRESCRIPTIONS.FORM.DOSAGE_PLACEHOLDER' | transloco">
                                </mat-form-field>
                                <mat-form-field appearance="outline" class="col-span-6 sm:col-span-2 lg:col-span-2" subscriptSizing="dynamic">
                                    <mat-label>{{ 'PHARMACY.PRESCRIPTIONS.FORM.FREQUENCY_LABEL' | transloco }}</mat-label>
                                    <input matInput [(ngModel)]="m.frequency"
                                           placeholder="1+0+1"
                                           [matTooltip]="'PHARMACY.PRESCRIPTIONS.FORM.FREQUENCY_TOOLTIP' | transloco">
                                </mat-form-field>
                                <mat-form-field appearance="outline" class="col-span-10 sm:col-span-1 lg:col-span-2" subscriptSizing="dynamic">
                                    <mat-label>{{ 'PHARMACY.PRESCRIPTIONS.FORM.DURATION_LABEL' | transloco }}</mat-label>
                                    <input matInput [(ngModel)]="m.duration" [placeholder]="'PHARMACY.PRESCRIPTIONS.FORM.DURATION_PLACEHOLDER' | transloco">
                                </mat-form-field>
                                <button mat-icon-button class="col-span-2 sm:col-span-1 text-red-600 justify-self-end mt-1"
                                        (click)="removeMedication(i)"
                                        [disabled]="medications().length === 1"
                                        [matTooltip]="'PHARMACY.PRESCRIPTIONS.FORM.REMOVE_MEDICATION_TOOLTIP' | transloco">
                                    <mat-icon class="icon-size-5">delete</mat-icon>
                                </button>
                            </div>
                        }
                    </div>
                </div>

                <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 class="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">{{ 'PHARMACY.PRESCRIPTIONS.FORM.SECTION_NOTES' | transloco }} <span class="text-gray-400 text-xs normal-case">{{ 'PHARMACY.PRESCRIPTIONS.FORM.OPTIONAL_HINT' | transloco }}</span></h3>
                    <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                        <mat-label>{{ 'PHARMACY.PRESCRIPTIONS.FORM.NOTES_LABEL' | transloco }}</mat-label>
                        <textarea matInput rows="2" [(ngModel)]="form.notes" [placeholder]="'PHARMACY.PRESCRIPTIONS.FORM.NOTES_PLACEHOLDER' | transloco"></textarea>
                    </mat-form-field>
                </div>

                <div class="flex flex-col items-end gap-2">
                    <p class="text-xs text-gray-500 w-full text-left"><span class="text-rose-600">*</span> {{ 'PHARMACY.PRESCRIPTIONS.FORM.REQUIRED_LEGEND' | transloco }}</p>
                    <div class="flex items-center gap-2">
                        <button mat-button routerLink="/prescriptions">{{ 'PHARMACY.PRESCRIPTIONS.FORM.CANCEL_BUTTON' | transloco }}</button>
                        <button mat-flat-button color="primary" class="h-12 px-6 rounded-lg shadow-lg"
                                [disabled]="!canSubmit() || saving"
                                (click)="save()">
                            <mat-icon class="icon-size-5 mr-2">save</mat-icon><span>{{ (saving ? 'PHARMACY.PRESCRIPTIONS.FORM.SAVING' : 'PHARMACY.PRESCRIPTIONS.FORM.SAVE_BUTTON') | transloco }}</span>
                        </button>
                    </div>
                    @if (!canSubmit() && disabledReason()) {
                        <p class="text-xs text-rose-700 dark:text-rose-300">{{ disabledReason() | transloco }}</p>
                    }
                </div>
            </div>
        </div>
    </div>
</div>
    `,
})
export class PrescriptionFormComponent {
    private readonly api = inject(PrescriptionsService);
    private readonly snack = inject(MatSnackBar);
    private readonly router = inject(Router);
    private readonly _transloco = inject(TranslocoService);

    form: Partial<PrescriptionDto> = {
        prescriptionNumber: '',
        doctorName: '',
        doctorLicense: '',
        doctorPhone: '',
        hospital: '',
        patientName: '',
        patientPhone: '',
        patientAge: undefined,
        diagnosis: '',
        notes: '',
    };
    prescriptionDate: Date = new Date();
    validUntil: Date | null = null;
    medications = signal<MedicationRow[]>([{ name: '', dosage: '', frequency: '', duration: '' }]);
    saving = false;

    addMedication(): void {
        this.medications.update(list => [...list, { name: '', dosage: '', frequency: '', duration: '' }]);
    }

    removeMedication(i: number): void {
        this.medications.update(list => list.filter((_, idx) => idx !== i));
    }

    canSubmit(): boolean {
        return !!this.form.prescriptionNumber?.trim()
            && !!this.form.doctorName?.trim()
            && !!this.form.patientName?.trim();
    }

    disabledReason(): string {
        if (!this.form.prescriptionNumber?.trim()) return 'PHARMACY.PRESCRIPTIONS.FORM.DISABLED_RX_NUMBER';
        if (!this.form.doctorName?.trim()) return 'PHARMACY.PRESCRIPTIONS.FORM.DISABLED_DOCTOR_NAME';
        if (!this.form.patientName?.trim()) return 'PHARMACY.PRESCRIPTIONS.FORM.DISABLED_PATIENT_NAME';
        return '';
    }

    save(): void {
        if (!this.canSubmit()) return;
        this.saving = true;
        const cleanMeds = this.medications().filter(m => m.name.trim());
        const medsJson = cleanMeds.length > 0 ? JSON.stringify(cleanMeds) : undefined;

        this.api.create({
            prescriptionNumber: this.form.prescriptionNumber!.trim(),
            prescriptionDate: this.prescriptionDate.toISOString(),
            validUntil: this.validUntil ? this.validUntil.toISOString() : undefined,
            doctorName: this.form.doctorName!.trim(),
            doctorLicense: this.form.doctorLicense?.trim() || undefined,
            doctorPhone: this.form.doctorPhone?.trim() || undefined,
            hospital: this.form.hospital?.trim() || undefined,
            patientName: this.form.patientName!.trim(),
            patientPhone: this.form.patientPhone?.trim() || undefined,
            patientAge: this.form.patientAge ? Number(this.form.patientAge) : undefined,
            diagnosis: this.form.diagnosis?.trim() || undefined,
            medicationsJson: medsJson,
            notes: this.form.notes?.trim() || undefined,
        }).subscribe({
            next: () => { this.saving = false; this.router.navigate(['/prescriptions']); },
            error: err => {
                this.saving = false;
                const msg = err?.error?.exception ?? err?.error?.title ?? err?.message ?? this._transloco.translate('PHARMACY.PRESCRIPTIONS.FORM.TOAST_SAVE_FAILED');
                this.snack.open(msg, this._transloco.translate('PHARMACY.PRESCRIPTIONS.FORM.TOAST_OK'), { duration: 6000 });
            },
        });
    }
}
