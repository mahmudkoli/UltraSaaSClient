import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { PrescriptionsService } from 'app/core/pharmacy/pharmacy.service';
import { PrescriptionDto } from 'app/core/pharmacy/pharmacy.types';

interface ParsedMedication {
    name?: string;
    dosage?: string;
    frequency?: string;
    duration?: string;
}

@Component({
    selector: 'app-prescription-detail',
    standalone: true,
    imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule, MatSnackBarModule, MatTooltipModule],
    template: `
<div class="flex flex-col flex-auto min-w-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 relative">
    <div class="absolute inset-0 opacity-5 dark:opacity-10"><div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, rgba(0,0,0,0.1) 1px, transparent 0); background-size: 20px 20px;"></div></div>
    <div class="relative z-10 flex flex-col flex-auto min-w-0">
        @if (rx(); as r) {
            <div class="flex flex-col sm:flex-row space-y-16 sm:space-y-0 flex-0 sm:items-center sm:justify-between p-2 sm:py-3 sm:px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                <div class="flex items-center space-x-4">
                    <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-teal-500 to-emerald-600 rounded-xl shadow-lg"><mat-icon class="text-white">prescriptions</mat-icon></div>
                    <div>
                        <h2 class="text-3xl font-bold tracking-tight leading-7 sm:leading-10 truncate bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">{{ r.prescriptionNumber }}</h2>
                        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">Prescribed {{ r.prescriptionDate | date:'mediumDate' }} by Dr. {{ r.doctorName }}</p>
                    </div>
                </div>
                <div class="flex flex-col w-full sm:w-auto sm:flex-row space-y-16 sm:space-y-0 flex-1 sm:flex-none sm:items-center sm:justify-end gap-4">
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium" [ngClass]="statusClass(r.status)">
                        <mat-icon class="icon-size-4 mr-1">{{ statusIcon(r.status) }}</mat-icon>{{ r.status }}
                    </span>
                    <button mat-stroked-button class="h-12 px-6 rounded-lg" routerLink="/prescriptions">
                        <mat-icon class="icon-size-5 mr-2">arrow_back</mat-icon><span>Back</span>
                    </button>
                </div>
            </div>

            <div class="flex-auto p-4 sm:p-6">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <!-- Main: meds + patient + doctor -->
                    <div class="lg:col-span-2 flex flex-col gap-6">
                        <!-- Medications -->
                        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-3">
                                <div class="w-8 h-8 bg-violet-100 dark:bg-violet-900 rounded-lg flex items-center justify-center"><mat-icon class="text-violet-600 dark:text-violet-400 text-lg">medication</mat-icon></div>
                                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Medications</h3>
                                <span class="ml-auto text-xs text-gray-500">{{ medications().length }} item(s)</span>
                            </div>
                            @if (medications().length === 0) {
                                <div class="p-8 text-center text-sm text-gray-500">No medications recorded on this prescription.</div>
                            } @else {
                                <div class="divide-y divide-gray-200 dark:divide-gray-700">
                                    @for (m of medications(); track $index) {
                                        <div class="px-6 py-4 grid grid-cols-1 sm:grid-cols-12 gap-3">
                                            <div class="sm:col-span-5">
                                                <div class="text-xs uppercase tracking-wider text-gray-500">Medication</div>
                                                <div class="text-sm font-medium text-gray-900 dark:text-white">{{ m.name || '—' }}</div>
                                            </div>
                                            <div class="sm:col-span-3">
                                                <div class="text-xs uppercase tracking-wider text-gray-500">Dosage</div>
                                                <div class="text-sm">{{ m.dosage || '—' }}</div>
                                            </div>
                                            <div class="sm:col-span-2">
                                                <div class="text-xs uppercase tracking-wider text-gray-500">Frequency</div>
                                                <div class="text-sm font-mono">{{ m.frequency || '—' }}</div>
                                            </div>
                                            <div class="sm:col-span-2">
                                                <div class="text-xs uppercase tracking-wider text-gray-500">Duration</div>
                                                <div class="text-sm">{{ m.duration || '—' }}</div>
                                            </div>
                                        </div>
                                    }
                                </div>
                            }
                        </div>

                        <!-- Patient -->
                        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                            <h3 class="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">Patient</h3>
                            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div><div class="text-xs uppercase tracking-wider text-gray-500">Name</div><div class="text-sm font-medium">{{ r.patientName }}</div></div>
                                <div><div class="text-xs uppercase tracking-wider text-gray-500">Phone</div><div class="text-sm">{{ r.patientPhone || '—' }}</div></div>
                                <div><div class="text-xs uppercase tracking-wider text-gray-500">Age</div><div class="text-sm">{{ r.patientAge ?? '—' }}</div></div>
                                <div class="sm:col-span-3" *ngIf="r.diagnosis">
                                    <div class="text-xs uppercase tracking-wider text-gray-500">Diagnosis</div>
                                    <div class="text-sm text-gray-700 dark:text-gray-300">{{ r.diagnosis }}</div>
                                </div>
                            </div>
                        </div>

                        <!-- Doctor -->
                        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                            <h3 class="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">Doctor</h3>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div><div class="text-xs uppercase tracking-wider text-gray-500">Name</div><div class="text-sm font-medium">{{ r.doctorName }}</div></div>
                                <div><div class="text-xs uppercase tracking-wider text-gray-500">License</div><div class="text-sm">{{ r.doctorLicense || '—' }}</div></div>
                                <div><div class="text-xs uppercase tracking-wider text-gray-500">Phone</div><div class="text-sm">{{ r.doctorPhone || '—' }}</div></div>
                                <div><div class="text-xs uppercase tracking-wider text-gray-500">Hospital / Clinic</div><div class="text-sm">{{ r.hospital || '—' }}</div></div>
                            </div>
                        </div>

                        <!-- Notes -->
                        @if (r.notes) {
                            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                                <h3 class="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2">Notes</h3>
                                <p class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{{ r.notes }}</p>
                            </div>
                        }
                    </div>

                    <!-- Side: status + actions + dates -->
                    <div class="flex flex-col gap-6">
                        <!-- Dates -->
                        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                            <h3 class="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">Timeline</h3>
                            <div class="space-y-2 text-sm">
                                <div class="flex justify-between"><span class="text-gray-600 dark:text-gray-400">Prescribed</span><span class="font-medium">{{ r.prescriptionDate | date:'mediumDate' }}</span></div>
                                <div class="flex justify-between"><span class="text-gray-600 dark:text-gray-400">Valid until</span><span class="font-medium">{{ r.validUntil ? (r.validUntil | date:'mediumDate') : '—' }}</span></div>
                                @if (r.dispensedOn) {
                                    <div class="flex justify-between"><span class="text-gray-600 dark:text-gray-400">Dispensed</span><span class="font-medium">{{ r.dispensedOn | date:'mediumDate' }}</span></div>
                                }
                            </div>
                        </div>

                        <!-- Actions -->
                        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 flex flex-col gap-3">
                            <div class="flex items-center space-x-3 mb-2">
                                <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center"><mat-icon class="text-blue-600 dark:text-blue-400 text-lg">flag</mat-icon></div>
                                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Actions</h3>
                            </div>
                            @if (r.status === 'Active') {
                                <button mat-flat-button color="primary" class="w-full h-12 rounded-lg"
                                        routerLink="/pos"
                                        [queryParams]="{ prescriptionId: r.id }"
                                        matTooltip="Opens POS with this prescription pre-linked. Ring up the medications and finalize — the prescription auto-flips to Dispensed.">
                                    <mat-icon class="icon-size-5 mr-2">point_of_sale</mat-icon><span>Dispense via POS</span>
                                </button>
                                <button mat-stroked-button color="warn" class="w-full h-12 rounded-lg" [disabled]="busy()" (click)="cancel()">
                                    <mat-icon class="icon-size-5 mr-2">cancel</mat-icon><span>Cancel prescription</span>
                                </button>
                            } @else {
                                <p class="text-sm text-gray-500">No further actions — this prescription is {{ r.status }}.</p>
                                @if (r.status === 'Dispensed' && r.dispensedSaleId) {
                                    <button mat-stroked-button class="w-full h-12 rounded-lg" [routerLink]="['/sales', r.dispensedSaleId]">
                                        <mat-icon class="icon-size-5 mr-2">receipt</mat-icon><span>View dispensing sale</span>
                                    </button>
                                }
                            }
                        </div>
                    </div>
                </div>
            </div>
        }
    </div>
</div>
    `,
})
export class PrescriptionDetailComponent implements OnInit {
    private readonly api = inject(PrescriptionsService);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly snack = inject(MatSnackBar);
    private readonly _confirm = inject(FuseConfirmationService);

    rx = signal<PrescriptionDto | null>(null);
    busy = signal(false);

    medications = computed((): ParsedMedication[] => {
        const r = this.rx();
        if (!r?.medicationsJson) return [];
        try { return JSON.parse(r.medicationsJson) as ParsedMedication[]; }
        catch { return []; }
    });

    statusIcon(s: PrescriptionDto['status']): string {
        switch (s) {
            case 'Active': return 'check_circle';
            case 'Dispensed': return 'inventory';
            case 'Cancelled': return 'cancel';
            case 'Expired': return 'event_busy';
            default: return 'help';
        }
    }
    statusClass(s: PrescriptionDto['status']): Record<string, boolean> {
        return {
            'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': s === 'Active',
            'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200': s === 'Dispensed',
            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200': s === 'Cancelled',
            'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200': s === 'Expired',
        };
    }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id')!;
        this.reload(id);
    }

    private reload(id: string): void {
        this.api.get(id).subscribe(r => this.rx.set(r));
    }

    cancel(): void {
        const r = this.rx();
        if (!r) return;
        const ref = this._confirm.open({
            title: 'Cancel prescription',
            message: `Cancel prescription <b>${r.prescriptionNumber}</b> for ${r.patientName}? This can't be undone — the patient will need a new prescription.`,
            icon: { show: true, name: 'heroicons_outline:exclamation-triangle', color: 'warn' },
            actions: { confirm: { label: 'Cancel prescription', color: 'warn' }, cancel: { label: 'Keep active' } },
        });
        ref.afterClosed().subscribe(result => {
            if (result !== 'confirmed') return;
            this.busy.set(true);
            this.api.cancel(r.id).subscribe({
                next: () => {
                    this.busy.set(false);
                    this.snack.open('Prescription cancelled', 'OK', { duration: 3000 });
                    this.reload(r.id);
                },
                error: err => {
                    this.busy.set(false);
                    const msg = err?.error?.exception ?? err?.error?.title ?? err?.message ?? 'Cancel failed';
                    this.snack.open(msg, 'OK', { duration: 6000 });
                },
            });
        });
    }
}
