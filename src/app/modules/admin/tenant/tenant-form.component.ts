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
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { TranslocoModule } from '@ngneat/transloco';
import { TenantDto, CreateTenantRequest, UpdateTenantRequest } from '../../../core/tenants/tenants.types';
import { TenantsService } from '../../../core/tenants/tenants.service';
import { POS_LAYOUTS } from '../pos/pos-layout-registry';

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
        MatTooltipModule,
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

    // Static POS layout options sourced from the registry — drives the
    // dropdown. Adding a layout = registry entry, no change here.
    posLayouts = POS_LAYOUTS;

    /**
     * Open `/pos?previewLayout=<name>` in a new tab so the admin can see what
     * the layout looks like *before* saving the choice. Uses the value
     * currently selected in the dropdown, not the persisted value, so a user
     * can flip through options without committing each one.
     */
    previewPosLayout(): void {
        const name = (this.tenantForm.get('posLayout')?.value as string | null) || 'default';
        window.open(`/pos?previewLayout=${encodeURIComponent(name)}`, '_blank');
    }

    // Original vertical loaded from server — used to detect dirty changes
    // and to revert if root cancels the confirmation dialog.
    originalBusinessType: string = 'Generic';
    originalOutletLabel: string = 'Outlet';
    changingVertical: boolean = false;


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

            // Vertical (set at creation; root-only edit deferred)
            businessType: ['Generic', [Validators.required]],
            outletLabel: ['Outlet', [Validators.required, Validators.maxLength(40)]],

            // POS layout (defaults to 'default')
            posLayout: ['default'],

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
            maxOutlets: [3, [Validators.required, Validators.min(1)]],
            maxUsers: [10, [Validators.required, Validators.min(1)]],
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
            // Note: BusinessType/OutletLabel can be edited in the dropdown but
            // they don't ride the regular Save path (UpdateTenantRequest doesn't
            // accept them). The dedicated "Change Vertical" button is the only
            // commit path — see changeVertical().
        }
    }

    loadTenant(): void {
        if (!this.tenantId) return;

        this.loading = true;
        this._tenantsService.getById(this.tenantId).subscribe({
            next: (tenant) => {
                this.tenantForm.patchValue({
                    // Basic Information
                    id: tenant.id,
                    systemName: tenant.systemName || tenant.name,
                    technicalAdminEmail: tenant.technicalAdminEmail || tenant.adminEmail,
                    subdomain: tenant.subdomain || tenant.url,
                    customDomain: tenant.customDomain || '',
                    connectionString: tenant.connectionString || '',
                    isShared: tenant.isShared,
                    issuer: tenant.issuer || '',

                    // Vertical (read-only on edit; changed via changeVertical())
                    businessType: tenant.businessType || 'Generic',
                    outletLabel: tenant.outletLabel || 'Outlet',

                    // POS layout
                    posLayout: tenant.posLayout || 'default',

                    // Billing & Subscription
                    billingPlan: tenant.billingPlan || 'Basic',
                    monthlyFee: tenant.monthlyFee || 0,
                    billingCurrency: tenant.billingCurrency || 'USD',
                    billingEmail: tenant.billingEmail || tenant.technicalAdminEmail || tenant.adminEmail,
                    paymentStatus: tenant.paymentStatus || 'Pending',
                    supportTier: tenant.supportTier || 'Basic',
                    accountManagerEmail: tenant.accountManagerEmail || '',
                    emergencyContact: tenant.emergencyContact || '',

                    // System Limits
                    maxDatabaseGB: tenant.maxDatabaseGB || 5,
                    maxApiCallsPerMonth: tenant.maxApiCallsPerMonth || 10000,
                    maxConcurrentUsers: tenant.maxConcurrentUsers || 50,
                    maxOutlets: tenant.maxOutlets || 3,
                    maxUsers: tenant.maxUsers || 10,
                    dataResidency: tenant.dataResidency || 'US',
                    dataRetentionDays: tenant.dataRetentionDays || 365,

                    // Status & Validity
                    validUpto: tenant.validUpto ? new Date(tenant.validUpto).toISOString().split('T')[0] : '',
                    isSystemActive: tenant.isSystemActive ?? tenant.isActive,
                    suspensionReason: tenant.suspensionReason || '',
                    suspendedUntil: tenant.suspendedUntil ? new Date(tenant.suspendedUntil).toISOString().split('T')[0] : '',

                    // Features & Settings
                    requiresGDPR: tenant.requiresGDPR || false,
                    requires2FA: tenant.requires2FA || false,
                    ipWhitelist: tenant.ipWhitelist || '',
                    enableAdvancedReporting: tenant.enableAdvancedReporting || false,
                    enableCustomBranding: tenant.enableCustomBranding || false,
                    enableApiAccess: tenant.enableApiAccess !== false,
                    enableBackupRestore: tenant.enableBackupRestore || false,
                    enableMultipleDatabases: tenant.enableMultipleDatabases || false
                });
                // Snapshot original vertical so changeVertical() can compare
                // against it and revert the form if root cancels.
                this.originalBusinessType = tenant.businessType || 'Generic';
                this.originalOutletLabel = tenant.outletLabel || 'Outlet';
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
            // Update existing tenant
            const updateRequest: UpdateTenantRequest = {
                id: this.tenantId,
                name: formData.systemName,
                adminEmail: formData.technicalAdminEmail,
                url: formData.subdomain,
                connectionString: formData.connectionString || undefined,
                isShared: formData.isShared,
                issuer: formData.issuer || undefined,
                customDomain: formData.customDomain || undefined,

                // POS layout
                posLayout: formData.posLayout || undefined,

                // Billing & Subscription
                billingPlan: formData.billingPlan,
                monthlyFee: formData.monthlyFee,
                billingCurrency: formData.billingCurrency,
                billingEmail: formData.billingEmail,
                paymentStatus: formData.paymentStatus,
                supportTier: formData.supportTier,
                accountManagerEmail: formData.accountManagerEmail || undefined,
                emergencyContact: formData.emergencyContact || undefined,

                // System Limits
                maxDatabaseGB: formData.maxDatabaseGB,
                maxApiCallsPerMonth: formData.maxApiCallsPerMonth,
                maxConcurrentUsers: formData.maxConcurrentUsers,
                maxOutlets: formData.maxOutlets,
                maxUsers: formData.maxUsers,
                dataResidency: formData.dataResidency,
                dataRetentionDays: formData.dataRetentionDays,

                // Status & Validity
                validUpto: formData.validUpto ? new Date(formData.validUpto).toISOString() : undefined,
                isActive: formData.isSystemActive,

                // Features & Settings
                requiresGDPR: formData.requiresGDPR,
                requires2FA: formData.requires2FA,
                ipWhitelist: formData.ipWhitelist || undefined,
                enableAdvancedReporting: formData.enableAdvancedReporting,
                enableCustomBranding: formData.enableCustomBranding,
                enableApiAccess: formData.enableApiAccess,
                enableBackupRestore: formData.enableBackupRestore,
                enableMultipleDatabases: formData.enableMultipleDatabases
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
            // Create new tenant
            const createRequest: CreateTenantRequest = {
                id: formData.id,
                systemName: formData.systemName,
                technicalAdminEmail: formData.technicalAdminEmail,
                subdomain: formData.subdomain,
                customDomain: formData.customDomain || undefined,
                connectionString: formData.connectionString || undefined,
                isShared: formData.isShared,
                issuer: formData.issuer || undefined,

                // Vertical (root-immutable after creation)
                businessType: formData.businessType,
                outletLabel: formData.outletLabel,

                // POS layout
                posLayout: formData.posLayout || undefined,

                // Billing & Subscription
                billingPlan: formData.billingPlan,
                monthlyFee: formData.monthlyFee,
                billingCurrency: formData.billingCurrency,
                billingEmail: formData.billingEmail,
                paymentStatus: formData.paymentStatus,
                supportTier: formData.supportTier,
                accountManagerEmail: formData.accountManagerEmail || undefined,
                emergencyContact: formData.emergencyContact || undefined,

                // System Limits
                maxDatabaseGB: formData.maxDatabaseGB,
                maxApiCallsPerMonth: formData.maxApiCallsPerMonth,
                maxConcurrentUsers: formData.maxConcurrentUsers,
                maxOutlets: formData.maxOutlets,
                maxUsers: formData.maxUsers,
                dataResidency: formData.dataResidency,
                dataRetentionDays: formData.dataRetentionDays,

                // Status & Validity
                validUpto: formData.validUpto ? new Date(formData.validUpto).toISOString() : undefined,
                isActive: formData.isSystemActive,

                // Features & Settings
                enableAdvancedReporting: formData.enableAdvancedReporting,
                enableCustomBranding: formData.enableCustomBranding,
                enableApiAccess: formData.enableApiAccess,
                enableBackupRestore: formData.enableBackupRestore,
                enableMultipleDatabases: formData.enableMultipleDatabases
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

    /**
     * Change a tenant's BusinessType + OutletLabel via the dedicated
     * PUT /api/tenants/{id}/vertical endpoint, behind a confirmation dialog.
     * High-stakes — pivoting a tenant orphans existing batches/serials/etc.
     * from their vertical UI.
     */
    changeVertical(): void {
        if (!this.tenantId) return;

        const newType = this.tenantForm.get('businessType')?.value as string;
        const newLabel = ((this.tenantForm.get('outletLabel')?.value as string) ?? '').trim() || 'Outlet';

        const unchanged = newType === this.originalBusinessType
            && newLabel === this.originalOutletLabel;

        if (unchanged) {
            this._fuseConfirmationService.open({
                title: 'No changes',
                message: 'Pick a different Business Type or Outlet Label first, then click Change Vertical.',
                actions: { confirm: { label: 'OK' }, cancel: { show: false } as any },
            });
            return;
        }

        const ref = this._fuseConfirmationService.open({
            title: 'Pivot this tenant?',
            message: `This will change <b>${this.tenantId}</b> from <b>${this.originalBusinessType}</b> to <b>${newType}</b>. Existing batches, serials, prescriptions and other vertical-specific data are <b>not</b> migrated — they'll stay in the database but won't be reachable from the new vertical's UI. Are you sure?`,
            icon: { show: true, name: 'heroicons_outline:exclamation-triangle', color: 'warn' },
            actions: {
                confirm: { show: true, label: 'Yes, pivot tenant', color: 'warn' },
                cancel: { show: true, label: 'Cancel' },
            },
            dismissible: true,
        });

        ref.afterClosed().subscribe(result => {
            if (result !== 'confirmed') {
                // Revert the form so the user sees the actual current state.
                this.tenantForm.patchValue({
                    businessType: this.originalBusinessType,
                    outletLabel: this.originalOutletLabel,
                });
                return;
            }

            this.changingVertical = true;
            this._tenantsService.updateVertical(this.tenantId!, newType, newLabel).subscribe({
                next: () => {
                    this.changingVertical = false;
                    this.originalBusinessType = newType;
                    this.originalOutletLabel = newLabel;
                    this._fuseConfirmationService.open({
                        title: 'Vertical updated',
                        message: `${this.tenantId} is now a ${newType} tenant. Users on this tenant should refresh to see the updated nav.`,
                        icon: { show: true, name: 'heroicons_outline:check-circle', color: 'success' },
                        actions: { confirm: { label: 'OK' }, cancel: { show: false } as any },
                    });
                },
                error: (err) => {
                    this.changingVertical = false;
                    console.error('Error changing vertical:', err);
                    // Revert the form
                    this.tenantForm.patchValue({
                        businessType: this.originalBusinessType,
                        outletLabel: this.originalOutletLabel,
                    });
                    const msg = err?.error?.exception ?? err?.error?.title ?? err?.message ?? 'Failed to change vertical.';
                    this._fuseConfirmationService.open({
                        title: 'Error',
                        message: msg,
                        icon: { show: true, name: 'heroicons_outline:x-circle', color: 'warn' },
                        actions: { confirm: { label: 'OK' }, cancel: { show: false } as any },
                    });
                },
            });
        });
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