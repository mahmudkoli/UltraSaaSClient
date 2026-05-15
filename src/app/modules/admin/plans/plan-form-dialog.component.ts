import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { PlansService } from 'app/core/billing/billing.service';
import { PlanDto } from 'app/core/billing/billing.types';

export type PlanFormDialogData =
    | { mode: 'create' }
    | { mode: 'edit'; plan: PlanDto };

@Component({
    selector: 'app-plan-form-dialog',
    standalone: true,
    imports: [CommonModule, FormsModule, MatButtonModule, MatDialogModule, MatFormFieldModule, MatIconModule, MatInputModule, MatSlideToggleModule],
    template: `
<div class="p-6 min-w-[440px] max-w-[520px]">
    <div class="flex items-center gap-3 mb-4">
        <div class="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
            <mat-icon class="text-indigo-600">{{ isEdit ? 'edit' : 'add' }}</mat-icon>
        </div>
        <h2 class="text-lg font-semibold">{{ isEdit ? 'Edit plan' : 'New plan' }}</h2>
    </div>

    <div class="grid grid-cols-2 gap-3">
        <mat-form-field appearance="outline" class="col-span-2">
            <mat-label>Code (immutable post-creation)</mat-label>
            <input matInput [(ngModel)]="code" [disabled]="isEdit" placeholder="e.g. starter">
        </mat-form-field>
        <mat-form-field appearance="outline" class="col-span-2">
            <mat-label>Name</mat-label>
            <input matInput [(ngModel)]="name" placeholder="e.g. Starter">
        </mat-form-field>
        <mat-form-field appearance="outline">
            <mat-label>Monthly fee (BDT)</mat-label>
            <input matInput type="number" min="0" step="1" [(ngModel)]="monthlyFeeBDT">
        </mat-form-field>
        <mat-form-field appearance="outline">
            <mat-label>Trial days</mat-label>
            <input matInput type="number" min="0" step="1" [(ngModel)]="trialDays" [disabled]="isEdit">
        </mat-form-field>
        <mat-form-field appearance="outline">
            <mat-label>Max outlets</mat-label>
            <input matInput type="number" min="1" step="1" [(ngModel)]="maxOutlets">
        </mat-form-field>
        <mat-form-field appearance="outline">
            <mat-label>Max users</mat-label>
            <input matInput type="number" min="1" step="1" [(ngModel)]="maxUsers">
        </mat-form-field>
        <mat-form-field appearance="outline" class="col-span-2">
            <mat-label>Feature flags (JSON array)</mat-label>
            <input matInput [(ngModel)]="featureFlagsJson" placeholder='["CUSTOM_BRAND"]'>
        </mat-form-field>
        @if (isEdit) {
            <div class="col-span-2 flex items-center gap-3 pt-1">
                <mat-slide-toggle [(ngModel)]="isActive">Active</mat-slide-toggle>
                <span class="text-xs text-gray-500">Inactive plans are hidden from tenant pickers but existing assignments remain valid.</span>
            </div>
        }
    </div>

    @if (errorMsg()) {
        <p class="text-xs text-rose-600 mt-2">{{ errorMsg() }}</p>
    }

    <div class="flex justify-end gap-2 mt-4">
        <button mat-button (click)="ref.close()" [disabled]="busy()">Cancel</button>
        <button mat-flat-button color="primary" (click)="submit()" [disabled]="busy() || !valid()">
            <mat-icon class="icon-size-5 mr-1">save</mat-icon>
            <span>{{ busy() ? 'Saving…' : 'Save' }}</span>
        </button>
    </div>
</div>
    `,
})
export class PlanFormDialogComponent implements OnInit {
    private readonly api = inject(PlansService);

    code = '';
    name = '';
    monthlyFeeBDT = 0;
    trialDays = 0;
    maxOutlets = 1;
    maxUsers = 1;
    featureFlagsJson = '[]';
    isActive = true;

    busy = signal(false);
    errorMsg = signal<string | null>(null);

    get isEdit(): boolean { return this.data.mode === 'edit'; }
    private editingId: string | null = null;

    constructor(
        public ref: MatDialogRef<PlanFormDialogComponent, boolean>,
        @Inject(MAT_DIALOG_DATA) public data: PlanFormDialogData,
    ) {}

    ngOnInit(): void {
        if (this.data.mode === 'edit') {
            const p = this.data.plan;
            this.editingId = p.id;
            this.code = p.code;
            this.name = p.name;
            this.monthlyFeeBDT = p.monthlyFeeBDT;
            this.trialDays = p.trialDays;
            this.maxOutlets = p.maxOutlets;
            this.maxUsers = p.maxUsers;
            this.featureFlagsJson = p.featureFlagsJson || '[]';
            this.isActive = p.isActive;
        }
    }

    valid(): boolean {
        return !!this.code && !!this.name
            && this.monthlyFeeBDT >= 0
            && this.trialDays >= 0
            && this.maxOutlets > 0
            && this.maxUsers > 0;
    }

    submit(): void {
        if (!this.valid()) return;
        this.busy.set(true);
        this.errorMsg.set(null);
        const obs = this.isEdit
            ? this.api.update(this.editingId!, {
                id: this.editingId!,
                name: this.name.trim(),
                monthlyFeeBDT: this.monthlyFeeBDT,
                maxOutlets: this.maxOutlets,
                maxUsers: this.maxUsers,
                featureFlagsJson: this.featureFlagsJson || '[]',
                isActive: this.isActive,
            })
            : this.api.create({
                code: this.code.trim().toLowerCase(),
                name: this.name.trim(),
                monthlyFeeBDT: this.monthlyFeeBDT,
                trialDays: this.trialDays,
                maxOutlets: this.maxOutlets,
                maxUsers: this.maxUsers,
                featureFlagsJson: this.featureFlagsJson || '[]',
            });
        obs.subscribe({
            next: () => { this.busy.set(false); this.ref.close(true); },
            error: err => {
                this.busy.set(false);
                this.errorMsg.set(err?.error?.exception ?? err?.error?.title ?? 'Save failed.');
            },
        });
    }
}
