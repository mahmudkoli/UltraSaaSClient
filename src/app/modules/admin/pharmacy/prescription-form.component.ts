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
import { Router, RouterModule } from '@angular/router';
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
        CommonModule, FormsModule, RouterModule,
        MatButtonModule, MatDatepickerModule, MatNativeDateModule, MatFormFieldModule,
        MatIconModule, MatInputModule, MatSnackBarModule,
    ],
    template: `
<div class="flex flex-col flex-auto min-w-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 relative">
    <div class="absolute inset-0 opacity-5 dark:opacity-10"><div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, rgba(0,0,0,0.1) 1px, transparent 0); background-size: 20px 20px;"></div></div>
    <div class="relative z-10 flex flex-col flex-auto min-w-0">
        <div class="flex flex-col sm:flex-row space-y-16 sm:space-y-0 flex-0 sm:items-center sm:justify-between p-2 sm:py-3 sm:px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
            <div class="flex items-center space-x-4">
                <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-teal-500 to-emerald-600 rounded-xl shadow-lg"><mat-icon class="text-white">prescriptions</mat-icon></div>
                <div>
                    <h2 class="text-3xl font-bold tracking-tight leading-7 sm:leading-10 truncate bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Record Prescription</h2>
                    <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">Capture a doctor's prescription. Dispensing happens via the regular Sale flow.</p>
                </div>
            </div>
            <button mat-stroked-button class="h-12 px-6 rounded-lg" routerLink="/prescriptions"><mat-icon class="icon-size-5 mr-2">arrow_back</mat-icon><span>Cancel</span></button>
        </div>

        <div class="flex-auto p-4 sm:p-6">
            <div class="grid grid-cols-1 gap-6">
                <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 class="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">Prescription</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <mat-form-field appearance="outline" class="w-full" hideRequiredMarker>
                            <mat-label>Prescription # <span class="text-rose-600">*</span></mat-label>
                            <input matInput [(ngModel)]="form.prescriptionNumber" required maxlength="64">
                        </mat-form-field>
                        <mat-form-field appearance="outline" class="w-full">
                            <mat-label>Prescribed on</mat-label>
                            <input matInput [matDatepicker]="d1" [(ngModel)]="prescriptionDate">
                            <mat-datepicker-toggle matIconSuffix [for]="d1"></mat-datepicker-toggle>
                            <mat-datepicker #d1></mat-datepicker>
                        </mat-form-field>
                        <mat-form-field appearance="outline" class="w-full">
                            <mat-label>Valid until <span class="text-gray-400 text-xs">(optional)</span></mat-label>
                            <input matInput [matDatepicker]="d2" [(ngModel)]="validUntil">
                            <mat-datepicker-toggle matIconSuffix [for]="d2"></mat-datepicker-toggle>
                            <mat-datepicker #d2></mat-datepicker>
                        </mat-form-field>
                    </div>
                </div>

                <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 class="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">Doctor</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <mat-form-field appearance="outline" class="w-full" hideRequiredMarker>
                            <mat-label>Doctor name <span class="text-rose-600">*</span></mat-label>
                            <input matInput [(ngModel)]="form.doctorName" required maxlength="150">
                        </mat-form-field>
                        <mat-form-field appearance="outline" class="w-full">
                            <mat-label>License # <span class="text-gray-400 text-xs">(optional)</span></mat-label>
                            <input matInput [(ngModel)]="form.doctorLicense">
                        </mat-form-field>
                        <mat-form-field appearance="outline" class="w-full">
                            <mat-label>Phone <span class="text-gray-400 text-xs">(optional)</span></mat-label>
                            <input matInput [(ngModel)]="form.doctorPhone">
                        </mat-form-field>
                        <mat-form-field appearance="outline" class="w-full">
                            <mat-label>Hospital / Clinic <span class="text-gray-400 text-xs">(optional)</span></mat-label>
                            <input matInput [(ngModel)]="form.hospital">
                        </mat-form-field>
                    </div>
                </div>

                <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 class="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">Patient</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <mat-form-field appearance="outline" class="w-full" hideRequiredMarker>
                            <mat-label>Patient name <span class="text-rose-600">*</span></mat-label>
                            <input matInput [(ngModel)]="form.patientName" required maxlength="150">
                        </mat-form-field>
                        <mat-form-field appearance="outline" class="w-full">
                            <mat-label>Phone <span class="text-gray-400 text-xs">(optional)</span></mat-label>
                            <input matInput [(ngModel)]="form.patientPhone">
                        </mat-form-field>
                        <mat-form-field appearance="outline" class="w-full">
                            <mat-label>Age <span class="text-gray-400 text-xs">(optional)</span></mat-label>
                            <input matInput type="number" min="0" max="150" [(ngModel)]="form.patientAge">
                        </mat-form-field>
                        <mat-form-field appearance="outline" class="w-full sm:col-span-2 lg:col-span-3">
                            <mat-label>Diagnosis <span class="text-gray-400 text-xs">(optional)</span></mat-label>
                            <textarea matInput rows="2" [(ngModel)]="form.diagnosis"></textarea>
                        </mat-form-field>
                    </div>
                </div>

                <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                    <div class="flex items-center justify-between mb-3">
                        <h3 class="text-sm font-semibold uppercase tracking-wider text-gray-500">Medications <span class="text-gray-400 text-xs normal-case">(optional)</span></h3>
                        <button mat-stroked-button (click)="addMedication()"><mat-icon class="icon-size-5 mr-2">add</mat-icon>Add medication</button>
                    </div>
                    <div class="space-y-3">
                        @for (m of medications(); track i; let i = $index) {
                            <div class="grid grid-cols-12 gap-3 items-start">
                                <mat-form-field appearance="outline" class="col-span-12 sm:col-span-5 lg:col-span-4" subscriptSizing="dynamic">
                                    <mat-label>Medication</mat-label>
                                    <input matInput [(ngModel)]="m.name" placeholder="e.g. Paracetamol">
                                </mat-form-field>
                                <mat-form-field appearance="outline" class="col-span-6 sm:col-span-3 lg:col-span-3" subscriptSizing="dynamic">
                                    <mat-label>Dosage</mat-label>
                                    <input matInput [(ngModel)]="m.dosage" placeholder="e.g. 500 mg">
                                </mat-form-field>
                                <mat-form-field appearance="outline" class="col-span-6 sm:col-span-2 lg:col-span-2" subscriptSizing="dynamic">
                                    <mat-label>Frequency</mat-label>
                                    <input matInput [(ngModel)]="m.frequency"
                                           placeholder="1+0+1"
                                           matTooltip="Morning + Noon + Night dosing (e.g. 1+0+1 = 1 tab morning, 0 noon, 1 tab night)">
                                </mat-form-field>
                                <mat-form-field appearance="outline" class="col-span-10 sm:col-span-1 lg:col-span-2" subscriptSizing="dynamic">
                                    <mat-label>Duration</mat-label>
                                    <input matInput [(ngModel)]="m.duration" placeholder="7 days">
                                </mat-form-field>
                                <button mat-icon-button class="col-span-2 sm:col-span-1 text-red-600 justify-self-end mt-1"
                                        (click)="removeMedication(i)"
                                        [disabled]="medications().length === 1"
                                        matTooltip="Remove this medication">
                                    <mat-icon class="icon-size-5">delete</mat-icon>
                                </button>
                            </div>
                        }
                    </div>
                </div>

                <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 class="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">Notes <span class="text-gray-400 text-xs normal-case">(optional)</span></h3>
                    <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                        <mat-label>Additional notes</mat-label>
                        <textarea matInput rows="2" [(ngModel)]="form.notes" placeholder="Pharmacist instructions, allergies, etc."></textarea>
                    </mat-form-field>
                </div>

                <div class="flex flex-col items-end gap-2">
                    <p class="text-xs text-gray-500 w-full text-left"><span class="text-rose-600">*</span> Required</p>
                    <div class="flex items-center gap-2">
                        <button mat-button routerLink="/prescriptions">Cancel</button>
                        <button mat-flat-button color="primary" class="h-12 px-6 rounded-lg shadow-lg"
                                [disabled]="!canSubmit() || saving"
                                (click)="save()">
                            <mat-icon class="icon-size-5 mr-2">save</mat-icon><span>{{ saving ? 'Saving…' : 'Save Prescription' }}</span>
                        </button>
                    </div>
                    @if (!canSubmit() && disabledReason()) {
                        <p class="text-xs text-rose-700 dark:text-rose-300">{{ disabledReason() }}</p>
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
        if (!this.form.prescriptionNumber?.trim()) return 'Enter the prescription number.';
        if (!this.form.doctorName?.trim()) return 'Enter the doctor’s name.';
        if (!this.form.patientName?.trim()) return 'Enter the patient’s name.';
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
                const msg = err?.error?.exception ?? err?.error?.title ?? err?.message ?? 'Save failed';
                this.snack.open(msg, 'OK', { duration: 6000 });
            },
        });
    }
}
