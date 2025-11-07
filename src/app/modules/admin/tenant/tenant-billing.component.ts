import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { TranslocoModule } from '@ngneat/transloco';
import { TenantDto, UpdateBillingPlanRequest, ExtendValidityRequest } from '../../../core/tenants/tenants.types';
import { TenantsService } from '../../../core/tenants/tenants.service';

@Component({
    selector: 'tenant-billing',
    templateUrl: './tenant-billing.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatCardModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatProgressSpinnerModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        TranslocoModule,
    ],
})
export class TenantBillingComponent implements OnInit {
    tenant?: TenantDto;
    tenantId: string;
    billingForm: FormGroup;
    extendValidityForm: FormGroup;
    loading: boolean = false;
    saving: boolean = false;

    billingPlans = [
        { value: 'Basic', label: 'Basic Plan', price: 29 },
        { value: 'Professional', label: 'Professional Plan', price: 79 },
        { value: 'Enterprise', label: 'Enterprise Plan', price: 199 },
        { value: 'Custom', label: 'Custom Plan', price: 0 }
    ];

    currencies = [
        { value: 'USD', label: 'US Dollar' },
        { value: 'EUR', label: 'Euro' },
        { value: 'GBP', label: 'British Pound' },
        { value: 'CAD', label: 'Canadian Dollar' }
    ];

    paymentStatuses = [
        { value: 'Paid', label: 'Paid' },
        { value: 'Pending', label: 'Pending' },
        { value: 'Overdue', label: 'Overdue' },
        { value: 'Failed', label: 'Failed' },
        { value: 'Cancelled', label: 'Cancelled' }
    ];

    constructor(
        private _formBuilder: FormBuilder,
        private _tenantsService: TenantsService,
        private _router: Router,
        private _route: ActivatedRoute,
        private _fuseConfirmationService: FuseConfirmationService
    ) {
        this.tenantId = this._route.snapshot.paramMap.get('id')!;

        this.billingForm = this._formBuilder.group({
            billingPlan: ['', [Validators.required]],
            monthlyFee: [0, [Validators.required, Validators.min(0)]],
            billingCurrency: ['USD', [Validators.required]],
            billingEmail: ['', [Validators.email]],
            paymentStatus: ['Pending', [Validators.required]],
            nextBillingDate: [''],
            lastBillingDate: ['']
        });

        this.extendValidityForm = this._formBuilder.group({
            months: [1, [Validators.required, Validators.min(1), Validators.max(36)]]
        });
    }

    ngOnInit(): void {
        this.loadTenant();
    }

    loadTenant(): void {
        this.loading = true;
        this._tenantsService.getById(this.tenantId).subscribe({
            next: (tenant) => {
                this.tenant = tenant;
                this.billingForm.patchValue({
                    billingPlan: tenant.billingPlan || 'Basic',
                    monthlyFee: tenant.monthlyFee || 0,
                    billingCurrency: tenant.billingCurrency || 'USD',
                    billingEmail: tenant.billingEmail || tenant.adminEmail,
                    paymentStatus: tenant.paymentStatus || 'Pending',
                    nextBillingDate: tenant.nextBillingDate ? new Date(tenant.nextBillingDate) : null,
                    lastBillingDate: tenant.lastBillingDate ? new Date(tenant.lastBillingDate) : null
                });
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading tenant:', error);
                this.loading = false;
            }
        });
    }

    updateBilling(): void {
        if (this.billingForm.invalid) {
            return;
        }

        this.saving = true;
        const formData = this.billingForm.getRawValue();

        const request: UpdateBillingPlanRequest = {
            tenantId: this.tenantId,
            billingPlan: formData.billingPlan,
            monthlyFee: formData.monthlyFee,
            billingCurrency: formData.billingCurrency,
            billingEmail: formData.billingEmail,
            paymentStatus: formData.paymentStatus
        };

        this._tenantsService.updateBillingPlan(this.tenantId, request).subscribe({
            next: () => {
                this.saving = false;
                this._fuseConfirmationService.open({
                    title: 'Success',
                    message: 'Billing information updated successfully!',
                    actions: {
                        confirm: { label: 'OK' }
                    }
                });
                this.loadTenant();
            },
            error: (error) => {
                console.error('Error updating billing:', error);
                this.saving = false;
                this._fuseConfirmationService.open({
                    title: 'Error',
                    message: 'Failed to update billing information. Please try again.',
                    actions: {
                        confirm: { label: 'OK' }
                    }
                });
            }
        });
    }

    extendValidity(): void {
        if (this.extendValidityForm.invalid) {
            return;
        }

        this.saving = true;
        const formData = this.extendValidityForm.getRawValue();

        const request: ExtendValidityRequest = {
            tenantId: this.tenantId,
            months: formData.months
        };

        this._tenantsService.extendValidity(this.tenantId, request).subscribe({
            next: () => {
                this.saving = false;
                this._fuseConfirmationService.open({
                    title: 'Success',
                    message: `Tenant validity extended by ${formData.months} month(s)!`,
                    actions: {
                        confirm: { label: 'OK' }
                    }
                });
                this.loadTenant();
                this.extendValidityForm.reset({ months: 1 });
            },
            error: (error) => {
                console.error('Error extending validity:', error);
                this.saving = false;
                this._fuseConfirmationService.open({
                    title: 'Error',
                    message: 'Failed to extend validity. Please try again.',
                    actions: {
                        confirm: { label: 'OK' }
                    }
                });
            }
        });
    }

    onPlanChange(): void {
        const selectedPlan = this.billingPlans.find(plan => plan.value === this.billingForm.get('billingPlan')?.value);
        if (selectedPlan) {
            this.billingForm.patchValue({
                monthlyFee: selectedPlan.price
            });
        }
    }

    goBack(): void {
        this._router.navigate(['/tenant']);
    }
}