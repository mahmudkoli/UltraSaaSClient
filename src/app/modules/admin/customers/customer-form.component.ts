import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslocoModule } from '@ngneat/transloco';
import { CustomersService } from 'app/core/sales/sales.service';

@Component({
    selector: 'app-customer-form',
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule, RouterModule, TranslocoModule,
        MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule,
    ],
    template: `
<div class="flex flex-col flex-auto min-w-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 relative">
    <div class="absolute inset-0 opacity-5 dark:opacity-10"><div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, rgba(0,0,0,0.1) 1px, transparent 0); background-size: 20px 20px;"></div></div>
    <div class="relative z-10 flex flex-col flex-auto min-w-0">
        <div class="flex flex-col sm:flex-row space-y-16 sm:space-y-0 flex-0 sm:items-center sm:justify-between p-2 sm:py-3 sm:px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
            <div class="flex items-center space-x-4">
                <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
                    <mat-icon class="text-white">{{ id ? 'edit' : 'person_add' }}</mat-icon>
                </div>
                <div>
                    <h2 class="text-3xl font-bold tracking-tight leading-7 sm:leading-10 truncate bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">{{ (id ? 'CUSTOMERS.FORM.TITLE_EDIT' : 'CUSTOMERS.FORM.TITLE_NEW') | transloco }}</h2>
                    <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">{{ (id ? 'CUSTOMERS.FORM.SUBTITLE_EDIT' : 'CUSTOMERS.FORM.SUBTITLE_NEW') | transloco }}</p>
                </div>
            </div>
            <div class="flex flex-col w-full sm:w-auto sm:flex-row space-y-16 sm:space-y-0 flex-1 sm:flex-none sm:items-center sm:justify-end gap-4">
                <button mat-stroked-button class="h-12 px-6 rounded-lg" routerLink="/customers"><mat-icon class="icon-size-5 mr-2">arrow_back</mat-icon><span>{{ 'CUSTOMERS.FORM.CANCEL_BUTTON' | transloco }}</span></button>
            </div>
        </div>

        <div class="flex-auto p-4 sm:p-6">
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <form [formGroup]="form" (ngSubmit)="save()" class="p-6 sm:p-8">
                    <div class="mb-6">
                        <div class="flex items-center space-x-3 mb-4">
                            <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center"><mat-icon class="text-blue-600 dark:text-blue-400 text-lg">person</mat-icon></div>
                            <h3 class="text-xl font-semibold text-gray-900 dark:text-white">{{ 'CUSTOMERS.FORM.BASIC_SECTION' | transloco }}</h3>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <mat-form-field class="w-full sm:col-span-2" appearance="outline"><mat-label>{{ 'CUSTOMERS.FORM.NAME_LABEL' | transloco }}</mat-label><input matInput formControlName="name" [placeholder]="'CUSTOMERS.FORM.NAME_PLACEHOLDER' | transloco"><mat-error *ngIf="form.get('name')?.hasError('required')">{{ 'CUSTOMERS.FORM.NAME_REQUIRED' | transloco }}</mat-error></mat-form-field>
                            <mat-form-field class="w-full" appearance="outline"><mat-label>{{ 'CUSTOMERS.FORM.PHONE_LABEL' | transloco }}</mat-label><input matInput formControlName="phone"></mat-form-field>
                            <mat-form-field class="w-full" appearance="outline"><mat-label>{{ 'CUSTOMERS.FORM.EMAIL_LABEL' | transloco }}</mat-label><input matInput type="email" formControlName="email"></mat-form-field>
                            <mat-form-field class="w-full sm:col-span-2" appearance="outline"><mat-label>{{ 'CUSTOMERS.FORM.ADDRESS_LABEL' | transloco }}</mat-label><input matInput formControlName="address"></mat-form-field>
                        </div>
                    </div>

                    <div class="mb-6">
                        <div class="flex items-center space-x-3 mb-4">
                            <div class="w-8 h-8 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center"><mat-icon class="text-amber-600 dark:text-amber-400 text-lg">credit_card</mat-icon></div>
                            <h3 class="text-xl font-semibold text-gray-900 dark:text-white">{{ 'CUSTOMERS.FORM.ACCOUNT_SECTION' | transloco }}</h3>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <mat-form-field class="w-full" appearance="outline">
                                <mat-label>{{ 'CUSTOMERS.FORM.TYPE_LABEL' | transloco }}</mat-label>
                                <mat-select formControlName="customerType">
                                    <mat-option value="Retail">{{ 'CUSTOMERS.FORM.TYPE_RETAIL' | transloco }}</mat-option>
                                    <mat-option value="Wholesale">{{ 'CUSTOMERS.FORM.TYPE_WHOLESALE' | transloco }}</mat-option>
                                    <mat-option value="Corporate">{{ 'CUSTOMERS.FORM.TYPE_CORPORATE' | transloco }}</mat-option>
                                </mat-select>
                            </mat-form-field>
                            <mat-form-field class="w-full" appearance="outline"><mat-label>{{ 'CUSTOMERS.FORM.CREDIT_LIMIT_LABEL' | transloco }}</mat-label><input matInput type="number" formControlName="creditLimit"></mat-form-field>
                            <mat-form-field class="w-full" appearance="outline"><mat-label>{{ 'CUSTOMERS.FORM.TAX_ID_LABEL' | transloco }}</mat-label><input matInput formControlName="taxId"></mat-form-field>
                        </div>
                    </div>

                    <div class="flex items-center justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button mat-button type="button" routerLink="/customers">{{ 'CUSTOMERS.FORM.CANCEL_BUTTON' | transloco }}</button>
                        <button mat-flat-button color="primary" type="submit" class="h-12 px-6 rounded-lg shadow-lg" [disabled]="form.invalid || saving">
                            <mat-icon class="icon-size-5 mr-2">save</mat-icon><span>{{ (saving ? 'CUSTOMERS.FORM.SAVING' : 'CUSTOMERS.FORM.SAVE_BUTTON') | transloco }}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
    `,
})
export class CustomerFormComponent implements OnInit {
    private readonly api = inject(CustomersService);
    private readonly fb = inject(FormBuilder);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);

    id: string | null = null;
    saving = false;
    form: FormGroup = this.fb.group({
        name: ['', Validators.required],
        phone: [''],
        email: [''],
        address: [''],
        customerType: ['Retail', Validators.required],
        creditLimit: [0],
        taxId: [''],
    });

    ngOnInit(): void {
        this.id = this.route.snapshot.paramMap.get('id');
        if (this.id) this.api.get(this.id).subscribe(c => this.form.patchValue(c));
    }

    save(): void {
        if (this.form.invalid) return;
        this.saving = true;
        const v = this.form.getRawValue();
        const op$ = this.id ? this.api.update(this.id, v) : this.api.create(v);
        op$.subscribe({
            next: () => { this.saving = false; this.router.navigate(['/customers']); },
            error: () => { this.saving = false; },
        });
    }
}
