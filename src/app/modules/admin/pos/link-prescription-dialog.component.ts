import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { debounceTime, Subject } from 'rxjs';
import { PrescriptionsService } from 'app/core/pharmacy/pharmacy.service';
import { PrescriptionDto } from 'app/core/pharmacy/pharmacy.types';

export interface LinkPrescriptionResult {
    prescriptionId: string;
    prescriptionNumber: string;
    patientName: string;
}

/**
 * Dialog for the POS cashier to link an active doctor prescription to the
 * sale being rung up. On finalize the backend flips the prescription
 * Active → Dispensed and stamps DispensedSaleId. Search by Rx number or
 * patient name; only Active prescriptions are pickable.
 */
@Component({
    selector: 'app-link-prescription-dialog',
    standalone: true,
    imports: [
        CommonModule, FormsModule, MatButtonModule, MatDialogModule,
        MatFormFieldModule, MatIconModule, MatInputModule, MatProgressSpinnerModule,
    ],
    template: `
        <div class="flex items-center gap-3 px-6 pt-5 pb-3 border-b border-gray-200 dark:border-gray-700">
            <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
                <mat-icon class="text-white">prescriptions</mat-icon>
            </div>
            <div class="flex flex-col">
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Link prescription</h2>
                <p class="text-xs text-gray-500">Search an Active prescription by Rx # or patient name. The sale will mark it Dispensed on finalize.</p>
            </div>
            <button mat-icon-button class="ml-auto" mat-dialog-close>
                <mat-icon>close</mat-icon>
            </button>
        </div>

        <div class="px-6 py-4 min-w-[560px] flex flex-col gap-3">
            <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-full">
                <mat-label>Search</mat-label>
                <input matInput autofocus [(ngModel)]="search" (ngModelChange)="searchChanged.next($event)" placeholder="e.g. RX-1234 or John">
                <mat-icon matSuffix class="text-gray-400">search</mat-icon>
            </mat-form-field>

            @if (loading()) {
                <div class="flex justify-center py-6"><mat-spinner diameter="28"></mat-spinner></div>
            } @else if (results().length === 0) {
                <div class="text-center text-sm text-gray-500 py-6">
                    @if (search.trim()) {
                        No Active prescriptions match "{{ search }}".
                    } @else {
                        Start typing to search prescriptions.
                    }
                </div>
            } @else {
                <div class="max-h-96 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700 border rounded-lg">
                    @for (r of results(); track r.id) {
                        <button type="button" class="w-full text-left px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center justify-between gap-3"
                                (click)="pick(r)">
                            <div class="flex flex-col min-w-0">
                                <span class="font-mono text-sm font-semibold text-gray-900 dark:text-white truncate">{{ r.prescriptionNumber }}</span>
                                <span class="text-xs text-gray-500 truncate">{{ r.patientName }}<span *ngIf="r.patientPhone"> · {{ r.patientPhone }}</span></span>
                                <span class="text-xs text-gray-400 truncate">Dr. {{ r.doctorName }} · {{ r.prescriptionDate | date:'mediumDate' }}</span>
                            </div>
                            <mat-icon class="text-gray-400 flex-shrink-0">arrow_forward</mat-icon>
                        </button>
                    }
                </div>
            }
        </div>

        <div class="flex items-center justify-end gap-2 px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <button mat-button mat-dialog-close>Cancel</button>
        </div>
    `,
})
export class LinkPrescriptionDialogComponent implements OnInit {
    private readonly api = inject(PrescriptionsService);
    private readonly ref = inject(MatDialogRef<LinkPrescriptionDialogComponent>);

    readonly loading = signal(false);
    readonly results = signal<PrescriptionDto[]>([]);
    search = '';
    searchChanged = new Subject<string>();

    ngOnInit(): void {
        // Initial: load first page of Active prescriptions so the cashier can browse without typing.
        this.runSearch('');
        this.searchChanged.pipe(debounceTime(250)).subscribe(q => this.runSearch(q));
    }

    private runSearch(q: string): void {
        this.loading.set(true);
        this.api.search({
            pageNumber: 1,
            pageSize: 20,
            keyword: q.trim() || undefined,
            status: 'Active',
        }).subscribe({
            next: page => {
                this.results.set(page.data);
                this.loading.set(false);
            },
            error: () => {
                this.results.set([]);
                this.loading.set(false);
            },
        });
    }

    pick(r: PrescriptionDto): void {
        const result: LinkPrescriptionResult = {
            prescriptionId: r.id,
            prescriptionNumber: r.prescriptionNumber,
            patientName: r.patientName,
        };
        this.ref.close(result);
    }
}
