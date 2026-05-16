import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
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
import { PlansService } from '../../../core/billing/billing.service';
import { PlanDto } from '../../../core/billing/billing.types';
import { POS_LAYOUTS } from '../pos/pos-layout-registry';

/**
 * Phase 2.51 — lean tenant-form. The pre-cleanup form carried tabs for GDPR /
 * 2FA / IP whitelist / Support tier / Data residency / Resource limits etc.
 * all of which were dead. The new form is three tabs:
 *
 *  1. **Basic** — identity, vertical, POS layout, label preferences.
 *  2. **Subscription** — plan dropdown (cascades MaxOutlets / MaxUsers +
 *     replaces TenantFeature rows), billing email, audit retention, plus
 *     read-only ValidUpto / PaymentStatus / plan-derived limits chips.
 *  3. **Connection** — connection string + IsShared.
 *
 *  All other surfaces moved to dedicated screens (Record Payment, theme,
 *  vertical change, branding).
 */
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
        MatChipsModule,
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
    isEditMode = false;
    tenantId: string | null = null;
    loading = false;
    saving = false;

    /** Active plans for the subscription dropdown. */
    plans: PlanDto[] = [];

    /** POS layout choices — registry-driven; null/unknown falls back to default. */
    posLayouts = POS_LAYOUTS;

    /** Read-only fields on edit (plan-derived / Record-Payment-derived). */
    currentValidUpto: string | null = null;
    currentPaymentStatus: string | null = null;
    currentMaxOutlets = 0;
    currentMaxUsers = 0;
    themeLabel = 'Not configured';

    /** Vertical change is high-stakes — confirm before persist. */
    originalBusinessType = 'Generic';
    originalOutletLabel = 'Outlet';
    changingVertical = false;

    constructor(
        private _formBuilder: FormBuilder,
        private _tenantsService: TenantsService,
        private _plansService: PlansService,
        private _router: Router,
        private _route: ActivatedRoute,
        private _fuseConfirmationService: FuseConfirmationService,
    ) {
        this.tenantForm = this._formBuilder.group({
            // Identity
            id: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9_-]+$')]],
            systemName: ['', [Validators.required, Validators.maxLength(100)]],
            technicalAdminEmail: ['', [Validators.required, Validators.email]],
            subdomain: ['', [Validators.required, Validators.maxLength(255)]],
            connectionString: [''],
            isShared: [false],

            // Vertical
            businessType: ['Generic', [Validators.required]],
            outletLabel: ['Outlet', [Validators.required, Validators.maxLength(40)]],

            // POS layout
            posLayout: ['default'],

            // Subscription
            planId: [null, [Validators.required]],
            billingEmail: ['', [Validators.email]],
            auditRetentionDays: [365, [Validators.required, Validators.min(0), Validators.max(3650)]],

            // Label printing defaults
            showPriceOnLabel: [true],
            useOutletPriceOnLabel: [true],
        });
    }

    ngOnInit(): void {
        this.tenantId = this._route.snapshot.paramMap.get('id');

        this._plansService.getAll(true).subscribe({
            next: (plans) => {
                this.plans = plans;
                if (!this.isEditMode && !this.tenantForm.get('planId')?.value) {
                    const starter = plans.find(p => p.code === 'starter') ?? plans[0];
                    if (starter) this.tenantForm.patchValue({ planId: starter.id });
                }
            },
            error: (err) => console.error('Failed to load plans:', err),
        });

        if (this.tenantId) {
            this.isEditMode = true;
            this.loadTenant();
        }
    }

    /** Look up a plan's display name by id — used by the read-only chip + Review tab. */
    planNameFor(planId: string | null | undefined): string {
        if (!planId) return 'Not set';
        return this.plans.find(p => p.id === planId)?.name ?? planId;
    }

    /** ValidUpto traffic-light severity — same thresholds as tenant-billing. */
    validitySeverity(): 'expired' | 'urgent' | 'warning' | 'ok' | 'none' {
        if (!this.currentValidUpto) return 'none';
        const days = Math.floor((new Date(this.currentValidUpto).getTime() - Date.now()) / 86400000);
        if (days < 0) return 'expired';
        if (days <= 1) return 'urgent';
        if (days <= 7) return 'warning';
        return 'ok';
    }

    loadTenant(): void {
        if (!this.tenantId) return;

        this.loading = true;
        this._tenantsService.getById(this.tenantId).subscribe({
            next: (tenant) => {
                this.tenantForm.patchValue({
                    id: tenant.id,
                    systemName: tenant.systemName,
                    technicalAdminEmail: tenant.technicalAdminEmail,
                    subdomain: tenant.subdomain,
                    connectionString: tenant.connectionString || '',
                    isShared: tenant.isShared,

                    businessType: tenant.businessType || 'Generic',
                    outletLabel: tenant.outletLabel || 'Outlet',
                    posLayout: tenant.posLayout || 'default',

                    planId: tenant.planId ?? null,
                    billingEmail: tenant.billingEmail || tenant.technicalAdminEmail,
                    auditRetentionDays: tenant.auditRetentionDays ?? 365,

                    showPriceOnLabel: tenant.showPriceOnLabel ?? true,
                    useOutletPriceOnLabel: tenant.useOutletPriceOnLabel ?? true,
                });

                this.currentValidUpto = tenant.validUpto;
                this.currentPaymentStatus = tenant.paymentStatus;
                this.currentMaxOutlets = tenant.maxOutlets;
                this.currentMaxUsers = tenant.maxUsers;

                this.originalBusinessType = tenant.businessType || 'Generic';
                this.originalOutletLabel = tenant.outletLabel || 'Outlet';

                if (tenant.themeConfig) {
                    try {
                        const tc = JSON.parse(tenant.themeConfig);
                        const themeName = (tc.theme || 'default').replace('theme-', '');
                        this.themeLabel = `${themeName} / ${tc.scheme || 'light'} / ${tc.layout || 'classy'}`;
                    } catch { /* ignore */ }
                }

                this.tenantForm.get('id')?.disable();
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading tenant:', err);
                this.loading = false;
            },
        });
    }

    save(): void {
        if (this.tenantForm.invalid) return;

        this.saving = true;
        const formData = this.tenantForm.getRawValue();

        if (this.isEditMode && this.tenantId) {
            const newType = (formData.businessType ?? 'Generic') as string;
            const newLabel = ((formData.outletLabel as string) ?? '').trim() || 'Outlet';
            const verticalChanged = newType !== this.originalBusinessType
                || newLabel !== this.originalOutletLabel;

            if (verticalChanged) {
                this._fuseConfirmationService.open({
                    title: 'Change Business Type?',
                    message: `This will change <b>${this.tenantId}</b> from <b>${this.originalBusinessType}</b> (label "${this.originalOutletLabel}") to <b>${newType}</b> (label "${newLabel}"). Existing batches, serials, prescriptions and other vertical-specific data are <b>not</b> migrated — they stay in the database but won't be reachable from the new vertical's UI. Continue?`,
                    icon: { show: true, name: 'heroicons_outline:exclamation-triangle', color: 'warn' },
                    actions: { confirm: { label: 'Continue', color: 'warn' }, cancel: { label: 'Cancel' } },
                }).afterClosed().subscribe(result => {
                    if (result !== 'confirmed') {
                        this.tenantForm.patchValue({
                            businessType: this.originalBusinessType,
                            outletLabel: this.originalOutletLabel,
                        });
                        this.saving = false;
                        return;
                    }
                    this.persistEditUpdate(formData, newType, newLabel, /*verticalChanged*/ true);
                });
                return;
            }

            this.persistEditUpdate(formData, newType, newLabel, /*verticalChanged*/ false);
        } else {
            const req: CreateTenantRequest = {
                id: formData.id,
                systemName: formData.systemName,
                technicalAdminEmail: formData.technicalAdminEmail,
                subdomain: formData.subdomain,
                connectionString: formData.connectionString || undefined,
                isShared: formData.isShared,

                businessType: formData.businessType,
                outletLabel: formData.outletLabel,
                posLayout: formData.posLayout || undefined,

                planId: formData.planId ?? undefined,
                billingEmail: formData.billingEmail || undefined,
            };

            this._tenantsService.create(req).subscribe({
                next: () => {
                    this.saving = false;
                    this._fuseConfirmationService.open({
                        title: 'Success',
                        message: 'Tenant created successfully!',
                        actions: { confirm: { label: 'OK' } },
                    }).afterClosed().subscribe(() => this._router.navigate(['/tenant']));
                },
                error: (err) => {
                    console.error('Error creating tenant:', err);
                    this.saving = false;
                    this._fuseConfirmationService.open({
                        title: 'Error',
                        message: this.formatBackendError(err) || 'Failed to create tenant. Please try again.',
                        actions: { confirm: { label: 'OK' } },
                    });
                },
            });
        }
    }

    /** Edit-mode PUT. Pulled out of save() so the vertical-change confirm can gate it. */
    private persistEditUpdate(formData: any, businessType: string, outletLabel: string, verticalChanged: boolean): void {
        const req: UpdateTenantRequest = {
            id: this.tenantId!,
            systemName: formData.systemName,
            technicalAdminEmail: formData.technicalAdminEmail,
            subdomain: formData.subdomain,
            connectionString: formData.connectionString || undefined,
            isShared: formData.isShared,

            planId: formData.planId,
            billingEmail: formData.billingEmail || undefined,
            auditRetentionDays: formData.auditRetentionDays,

            businessType: businessType as any,
            outletLabel,
            posLayout: formData.posLayout || undefined,

            showPriceOnLabel: formData.showPriceOnLabel,
            useOutletPriceOnLabel: formData.useOutletPriceOnLabel,
        };

        this.sendUpdate(req, businessType, outletLabel, verticalChanged);
    }

    /** Submit the PUT. On a plan-quota 409, prompts the user to accept the over-quota
     * state and retries with `force: true`. */
    private sendUpdate(req: UpdateTenantRequest, businessType: string, outletLabel: string, verticalChanged: boolean): void {
        this._tenantsService.update(this.tenantId!, req).subscribe({
            next: () => {
                this.saving = false;
                if (verticalChanged) {
                    this.originalBusinessType = businessType;
                    this.originalOutletLabel = outletLabel;
                }
                this._fuseConfirmationService.open({
                    title: 'Success',
                    message: verticalChanged
                        ? `Tenant updated. Vertical changed to <b>${businessType}</b> — users on this tenant should refresh to see the updated nav.`
                        : 'Tenant updated successfully!',
                    actions: { confirm: { label: 'OK' } },
                }).afterClosed().subscribe(() => this._router.navigate(['/tenant']));
            },
            error: (err) => {
                console.error('Error updating tenant:', err);

                const quota = err?.status === 409 ? this.tryParseQuotaConflict(err?.error?.exception) : null;
                if (quota) {
                    this._fuseConfirmationService.open({
                        title: 'Plan downgrade exceeds current usage',
                        message: `Switching to <b>${quota.planName}</b> would set <b>${quota.field}</b> to <b>${quota.newLimit}</b>, but the tenant currently has <b>${quota.currentlyUsed}</b>. Existing records stay; further <b>${quota.field}</b> creates are blocked until you reduce the count or pick a larger plan. Continue?`,
                        icon: { show: true, name: 'heroicons_outline:exclamation-triangle', color: 'warn' },
                        actions: { confirm: { show: true, label: 'Continue anyway', color: 'warn' }, cancel: { show: true, label: 'Cancel' } },
                    }).afterClosed().subscribe(result => {
                        if (result !== 'confirmed') {
                            this.saving = false;
                            return;
                        }
                        this.sendUpdate({ ...req, force: true }, businessType, outletLabel, verticalChanged);
                    });
                    return;
                }

                this.saving = false;
                this._fuseConfirmationService.open({
                    title: 'Error',
                    message: this.formatBackendError(err) || 'Failed to update tenant. Please try again.',
                    actions: { confirm: { label: 'OK' } },
                });
            },
        });
    }

    /** Parse the JSON payload the backend embeds in a 409 ConflictException. */
    private tryParseQuotaConflict(message: string | undefined): { field: string; currentlyUsed: number; newLimit: number; planName: string } | null {
        if (!message || typeof message !== 'string') return null;
        const trimmed = message.trim();
        if (!trimmed.startsWith('{')) return null;
        try {
            const parsed = JSON.parse(trimmed);
            if (parsed && typeof parsed === 'object' && 'field' in parsed && 'newLimit' in parsed) {
                return parsed as { field: string; currentlyUsed: number; newLimit: number; planName: string };
            }
        } catch { /* fall through */ }
        return null;
    }

    /** Pull per-field validation messages out of an ASP.NET ProblemDetails 400. */
    private formatBackendError(error: any): string | null {
        const errors = error?.error?.errors;
        if (errors && typeof errors === 'object') {
            const lines: string[] = [];
            for (const [field, msgs] of Object.entries(errors)) {
                const list = Array.isArray(msgs) ? msgs : [msgs];
                for (const m of list) lines.push(`<b>${field}:</b> ${m}`);
            }
            if (lines.length > 0) return lines.join('<br>');
        }
        return error?.error?.message ?? error?.error?.title ?? null;
    }

    cancel(): void {
        this._router.navigate(['/tenant']);
    }

    openThemeSettings(): void {
        if (this.tenantId) this._router.navigate([`/tenant/${this.tenantId}/theme-settings`]);
    }

    previewPosLayout(): void {
        const name = (this.tenantForm.get('posLayout')?.value as string | null) || 'default';
        window.open(`/pos?previewLayout=${encodeURIComponent(name)}`, '_blank');
    }

    /** Change BusinessType + OutletLabel via PUT /api/tenants/{id}/vertical. */
    changeVertical(): void {
        if (!this.tenantId) return;

        const newType = this.tenantForm.get('businessType')?.value as string;
        const newLabel = ((this.tenantForm.get('outletLabel')?.value as string) ?? '').trim() || 'Outlet';

        const unchanged = newType === this.originalBusinessType && newLabel === this.originalOutletLabel;
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
            actions: { confirm: { show: true, label: 'Yes, pivot tenant', color: 'warn' }, cancel: { show: true, label: 'Cancel' } },
        });

        ref.afterClosed().subscribe(result => {
            if (result !== 'confirmed') {
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
