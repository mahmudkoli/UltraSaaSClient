import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { CustomersService } from 'app/core/sales/sales.service';
import { CustomerDto } from 'app/core/sales/sales.types';

/**
 * Tiny "add a customer mid-checkout" dialog. Captures the minimum the
 * domain requires (name + phone) so the cashier doesn't break flow when
 * a walk-in becomes a linked customer at checkout time.
 *
 * Closes with the created `CustomerDto` on success so the POS can patch
 * its customers list and auto-select the new id without round-tripping
 * the full /api/customers list. Cancel / X closes with `null` and the
 * select reverts to whatever it was on (typically Walk-in).
 */
@Component({
    selector: 'app-quick-add-customer-dialog',
    standalone: true,
    imports: [
        CommonModule, FormsModule, MatButtonModule, MatDialogModule,
        MatFormFieldModule, MatIconModule, MatInputModule, TranslocoModule,
    ],
    template: `
        <div class="flex items-center gap-3 px-6 pt-5 pb-3 border-b border-gray-200 dark:border-gray-700">
            <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <mat-icon class="text-white">person_add</mat-icon>
            </div>
            <div>
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white">{{ 'POS.QUICK_ADD_CUSTOMER.TITLE' | transloco }}</h2>
                <p class="text-xs text-gray-500">{{ 'POS.QUICK_ADD_CUSTOMER.SUBTITLE' | transloco }}</p>
            </div>
        </div>

        <div class="px-6 py-4 space-y-3 min-w-[420px]">
            <mat-form-field class="w-full" appearance="outline">
                <mat-label>{{ 'POS.QUICK_ADD_CUSTOMER.NAME_LABEL' | transloco }}</mat-label>
                <input matInput [(ngModel)]="name" autofocus maxlength="150">
            </mat-form-field>
            <mat-form-field class="w-full" appearance="outline">
                <mat-label>{{ 'POS.QUICK_ADD_CUSTOMER.PHONE_LABEL' | transloco }}</mat-label>
                <input matInput [(ngModel)]="phone" [placeholder]="'POS.QUICK_ADD_CUSTOMER.PHONE_PLACEHOLDER' | transloco" inputmode="tel" maxlength="32">
                <mat-hint>{{ 'POS.QUICK_ADD_CUSTOMER.PHONE_HINT' | transloco }}</mat-hint>
            </mat-form-field>
            @if (error()) {
                <p class="text-sm text-rose-600 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg p-2">
                    <mat-icon class="icon-size-4 align-middle mr-1">error</mat-icon>
                    <span class="align-middle">{{ error() }}</span>
                </p>
            }
        </div>

        <div class="flex items-center justify-end gap-2 px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <button mat-button mat-dialog-close [disabled]="saving()">{{ 'COMMON.CANCEL' | transloco }}</button>
            <button mat-flat-button color="primary" (click)="save()" [disabled]="!canSave() || saving()">
                <mat-icon class="icon-size-5 mr-1">person_add</mat-icon>
                <span>{{ saving() ? ('POS.QUICK_ADD_CUSTOMER.ADDING' | transloco) : ('POS.QUICK_ADD_CUSTOMER.ADD_AND_SELECT' | transloco) }}</span>
            </button>
        </div>
    `,
})
export class QuickAddCustomerDialogComponent {
    private readonly api = inject(CustomersService);
    private readonly ref = inject(MatDialogRef<QuickAddCustomerDialogComponent>);
    private readonly _transloco = inject(TranslocoService);

    name = '';
    phone = '';
    saving = signal(false);
    error = signal<string | null>(null);

    canSave(): boolean {
        return this.name.trim().length > 0 && this.phone.trim().length > 0;
    }

    save(): void {
        if (!this.canSave()) return;
        this.saving.set(true);
        this.error.set(null);
        const body: Partial<CustomerDto> = {
            name: this.name.trim(),
            phone: this.phone.trim(),
            customerType: 'Retail',
        };
        this.api.create(body).subscribe({
            next: (id) => {
                // Backend returns the new id (string Guid). Rehydrate via GET so
                // the POS gets a proper CustomerDto with default loyalty / credit
                // fields populated.
                this.api.get(typeof id === 'string' ? id : (id as any)).subscribe({
                    next: (dto) => { this.saving.set(false); this.ref.close(dto); },
                    error: () => {
                        this.saving.set(false);
                        // Fall back to a minimal stub if the rehydrate failed —
                        // POS will refresh the full list on next outlet change.
                        this.ref.close({ id, name: body.name!, phone: body.phone!, customerType: 'Retail' } as unknown as CustomerDto);
                    },
                });
            },
            error: (err: HttpErrorResponse) => {
                this.saving.set(false);
                const fallback = this._transloco.translate('POS.QUICK_ADD_CUSTOMER.SAVE_FAILED');
                const msg = err?.error?.exception ?? err?.error?.messages?.[0] ?? err?.message ?? fallback;
                this.error.set(typeof msg === 'string' ? msg : fallback);
            },
        });
    }
}
