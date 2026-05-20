import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { TranslocoModule } from '@ngneat/transloco';
import { TenantDto, CreateTenantRequest, UpdateTenantRequest } from '../../../core/tenants/tenants.types';
import { TenantsService } from '../../../core/tenants/tenants.service';

@Component({
    selector: 'tenant-form',
    templateUrl: './tenant-form.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatCardModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatProgressSpinnerModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatTabsModule,
        TranslocoModule,
    ],
})
export class TenantFormComponent implements OnInit {
    tenantForm: FormGroup;
    isEditMode: boolean = false;
    tenantId: string | null = null;
    loading: boolean = false;
    saving: boolean = false;
    themeLabel: string = 'Not configured';


    constructor(
        private _formBuilder: FormBuilder,
        private _tenantsService: TenantsService,
        private _router: Router,
        private _route: ActivatedRoute,
        private _fuseConfirmationService: FuseConfirmationService
    ) {
        this.tenantForm = this._formBuilder.group({
            // Basic Information
            id: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9_-]+$')]],
            systemName: ['', [Validators.required, Validators.maxLength(100)]],
            technicalAdminEmail: ['', [Validators.required, Validators.email]],
            subdomain: ['', [Validators.required, Validators.maxLength(255)]],
            customDomain: [''],
            connectionString: [''],
            isShared: [false],
            issuer: [''],

            // Billing & Subscription
            billingPlan: ['Basic', [Validators.required]],
            monthlyFee: [0, [Validators.min(0)]],
            billingCurrency: ['USD', [Validators.required]],
            billingEmail: ['', [Validators.required, Validators.email]],
            paymentStatus: ['Pending', [Validators.required]],
            supportTier: ['Basic', [Validators.required]],
            accountManagerEmail: [''],
            emergencyContact: [''],

            // System Limits
            maxDatabaseGB: [5, [Validators.required, Validators.min(1)]],
            maxApiCallsPerMonth: [10000, [Validators.required, Validators.min(1000)]],
            maxConcurrentUsers: [50, [Validators.required, Validators.min(1)]],
            dataResidency: ['US', [Validators.required]],
            dataRetentionDays: [365, [Validators.required, Validators.min(30)]],

            // Status & Validity
            validUpto: ['', [Validators.required]],
            isSystemActive: [true],
            suspensionReason: [''],
            suspendedUntil: [''],

            // Features & Settings
            requiresGDPR: [false],
            requires2FA: [false],
            ipWhitelist: [''],
            enableAdvancedReporting: [false],
            enableCustomBranding: [false],
            enableApiAccess: [true],
            enableBackupRestore: [false],
            enableMultipleDatabases: [false]
        });
    }

    ngOnInit(): void {
        this.tenantId = this._route.snapshot.paramMap.get('id');
        
        if (this.tenantId) {
            this.isEditMode = true;
            this.loadTenant();
        }
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
                    validUpto: tenant.validUpto ? new Date(tenant.validUpto).toISOString().split('T')[0] : '',
                    isSystemActive: tenant.isSystemActive,
                    suspensionReason: tenant.suspensionReason || '',
                    suspendedUntil: tenant.suspendedUntil ? new Date(tenant.suspendedUntil).toISOString().split('T')[0] : '',
                    auditRetentionDays: tenant.auditRetentionDays ?? 365,
                });
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