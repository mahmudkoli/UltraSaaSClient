import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { CreateTenantRequest, UpdateTenantRequest } from '../../../core/tenants/tenants.types';
import { TenantsService } from '../../../core/tenants/tenants.service';
import { CurrencyDescriptor, CurrencyService } from '../../../core/currency/currency.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'tenant-form',
    templateUrl: './tenant-form.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        MatSlideToggleModule,
    ],
})
export class TenantFormComponent implements OnInit, OnDestroy {
    tenantForm: FormGroup;
    isEditMode: boolean = false;
    tenantId: string | null = null;
    loading: boolean = false;
    saving: boolean = false;
    themeLabel: string = 'Not configured';
    /** Phase v1-O — supported currencies. The Currency field is shown on
     * create only (immutable post-create per backend rule). */
    currencies: CurrencyDescriptor[] = [];
    private _destroyed$ = new Subject<void>();


    constructor(
        private _formBuilder: FormBuilder,
        private _tenantsService: TenantsService,
        private _currencyService: CurrencyService,
        private _router: Router,
        private _route: ActivatedRoute,
        private _fuseConfirmationService: FuseConfirmationService
    ) {
        this.tenantForm = this._formBuilder.group({
            // Identity (Phase v1-C2.2 — the only fields with backend persistence)
            id: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9_-]+$')]],
            systemName: ['', [Validators.required, Validators.maxLength(100)]],
            technicalAdminEmail: ['', [Validators.required, Validators.email]],
            subdomain: ['', [Validators.required, Validators.maxLength(255)]],
            connectionString: [''],
            isShared: [false],

            // Billing
            planId: [''],
            billingEmail: ['', [Validators.required, Validators.email]],
            // Phase v1-O — ISO 4217. Defaults to primary; immutable post-create.
            currencyCode: ['BDT', [Validators.required]],

            // Read-only state (edit-mode display only — no UpdateTenantRequest field)
            paymentStatus: [{ value: 'Trial', disabled: true }],
            validUpto: [{ value: '', disabled: true }],
            isSystemActive: [{ value: true, disabled: true }],
            suspensionReason: [{ value: '', disabled: true }],
            suspendedUntil: [{ value: '', disabled: true }],

            // Phase v1-K7 — audit retention input (BE accepts 1–3650)
            auditRetentionDays: [365, [Validators.min(1), Validators.max(3650)]],
        });
    }

    ngOnInit(): void {
        this._currencyService.list().pipe(takeUntil(this._destroyed$)).subscribe({
            next: (list) => {
                this.currencies = list;
                // Default to platform primary on the create form.
                if (!this.isEditMode) {
                    const primary = list.find(c => c.isPrimary) ?? list[0];
                    if (primary) this.tenantForm.patchValue({ currencyCode: primary.code });
                }
            },
        });

        this.tenantId = this._route.snapshot.paramMap.get('id');

        if (this.tenantId) {
            this.isEditMode = true;
            this.loadTenant();
        }
    }

    ngOnDestroy(): void {
        this._destroyed$.next();
        this._destroyed$.complete();
    }

    loadTenant(): void {
        if (!this.tenantId) return;

        this.loading = true;
        this._tenantsService.getById(this.tenantId).subscribe({
            next: (tenant) => {
                // Phase v1-C2.2 — minimal form. Most of the FSH-template
                // form fields were deleted along with their backing DTO
                // properties. Form now only patches the surviving fields.
                this.tenantForm.patchValue({
                    id: tenant.id,
                    systemName: tenant.systemName,
                    technicalAdminEmail: tenant.technicalAdminEmail,
                    subdomain: tenant.subdomain,
                    connectionString: tenant.connectionString || '',
                    isShared: tenant.isShared,
                    planId: tenant.planId || '',
                    billingEmail: tenant.billingEmail || tenant.technicalAdminEmail,
                    paymentStatus: tenant.paymentStatus || 'Trial',
                    currencyCode: tenant.currencyCode,
                    validUpto: tenant.validUpto ? new Date(tenant.validUpto).toISOString().split('T')[0] : '',
                    isSystemActive: tenant.isSystemActive,
                    suspensionReason: tenant.suspensionReason || '',
                    suspendedUntil: tenant.suspendedUntil ? new Date(tenant.suspendedUntil).toISOString().split('T')[0] : '',
                    auditRetentionDays: tenant.auditRetentionDays ?? 365,
                });
                // Currency is immutable post-create.
                this.tenantForm.get('currencyCode')?.disable();
                // Parse theme config for display
                if (tenant.themeConfig) {
                    try {
                        const tc = JSON.parse(tenant.themeConfig);
                        const themeName = (tc.theme || 'default').replace('theme-', '');
                        this.themeLabel = `${themeName} / ${tc.scheme || 'light'} / ${tc.layout || 'classy'}`;
                    } catch { /* ignore */ }
                }

                // Disable ID field in edit mode
                this.tenantForm.get('id')?.disable();
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading tenant:', error);
                this.loading = false;
            }
        });
    }

    save(): void {
        if (this.tenantForm.invalid) {
            return;
        }

        this.saving = true;
        const formData = this.tenantForm.getRawValue();

        if (this.isEditMode && this.tenantId) {
            // Phase v1-C2.2 — minimal update payload.
            const updateRequest: UpdateTenantRequest = {
                id: this.tenantId,
                systemName: formData.systemName,
                technicalAdminEmail: formData.technicalAdminEmail,
                subdomain: formData.subdomain,
                connectionString: formData.connectionString || undefined,
                isShared: formData.isShared,
                planId: formData.planId || undefined,
                billingEmail: formData.billingEmail,
            };

            this._tenantsService.update(this.tenantId, updateRequest).subscribe({
                next: () => {
                    this.saving = false;
                    this._fuseConfirmationService.open({
                        title: 'Success',
                        message: 'Tenant updated successfully!',
                        actions: {
                            confirm: {
                                label: 'OK'
                            }
                        }
                    }).afterClosed().subscribe(() => {
                        this._router.navigate(['/tenant']);
                    });
                },
                error: (error) => {
                    console.error('Error updating tenant:', error);
                    this.saving = false;
                    this._fuseConfirmationService.open({
                        title: 'Error',
                        message: 'Failed to update tenant. Please try again.',
                        actions: {
                            confirm: {
                                label: 'OK'
                            }
                        }
                    });
                }
            });
        } else {
            // Phase v1-C2.2 — minimal create payload.
            const createRequest: CreateTenantRequest = {
                id: formData.id,
                systemName: formData.systemName,
                technicalAdminEmail: formData.technicalAdminEmail,
                subdomain: formData.subdomain,
                connectionString: formData.connectionString || undefined,
                isShared: formData.isShared,
                planId: formData.planId || undefined,
                billingEmail: formData.billingEmail,
                currencyCode: formData.currencyCode || undefined,
            };

            this._tenantsService.create(createRequest).subscribe({
                next: () => {
                    this.saving = false;
                    this._fuseConfirmationService.open({
                        title: 'Success',
                        message: 'Tenant created successfully!',
                        actions: {
                            confirm: {
                                label: 'OK'
                            }
                        }
                    }).afterClosed().subscribe(() => {
                        this._router.navigate(['/tenant']);
                    });
                },
                error: (error) => {
                    console.error('Error creating tenant:', error);
                    this.saving = false;
                    this._fuseConfirmationService.open({
                        title: 'Error',
                        message: 'Failed to create tenant. Please try again.',
                        actions: {
                            confirm: {
                                label: 'OK'
                            }
                        }
                    });
                }
            });
        }
    }

    cancel(): void {
        this._router.navigate(['/tenant']);
    }

    openThemeSettings(): void {
        if (this.tenantId) {
            this._router.navigate([`/tenant/${this.tenantId}/theme-settings`]);
        }
    }

    generateTenantId(): void {
        const name = this.tenantForm.get('systemName')?.value;
        if (name) {
            const tenantId = name
                .toLowerCase()
                .replace(/[^a-z0-9]/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');
            this.tenantForm.patchValue({ id: tenantId });
        }
    }
} 