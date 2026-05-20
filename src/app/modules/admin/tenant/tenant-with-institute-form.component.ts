import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AsyncValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
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
import { CreateTenantWithInstituteRequest, CreateTenantWithInstituteResponse } from '../../../core/tenants/tenants.types';
import { TenantsService } from '../../../core/tenants/tenants.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Component({
    selector: 'tenant-with-institute-form',
    templateUrl: './tenant-with-institute-form.component.html',
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
export class TenantWithInstituteFormComponent implements OnInit {
    tenantForm: FormGroup;
    isEditMode: boolean = false;
    tenantId: string | null = null;
    loading: boolean = false;
    saving: boolean = false;

    // Sample institute types - in a real app, these would come from the backend
    instituteTypes: string[] = [
        'School',
        'College',
        'University',
        'Training Center',
        'Coaching Institute',
        'Research Institute',
        'Technical Institute',
        'Vocational Institute'
    ];

    constructor(
        private _formBuilder: FormBuilder,
        private _tenantsService: TenantsService,
        private _router: Router,
        private _route: ActivatedRoute,
        private _fuseConfirmationService: FuseConfirmationService
    ) {
        this.tenantForm = this._formBuilder.group({
            // Tenant Information
            id: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9_-]+$')], [this.tenantIdUniqueValidator()]],
            name: ['', [Validators.required, Validators.maxLength(100)]],
            adminEmail: ['', [Validators.required, Validators.email]],
            url: ['', [Validators.required, Validators.maxLength(255)]],
            connectionString: [''],
            isShared: [false],
            issuer: [''],

            // Institute Information
            instituteName: ['', [Validators.required, Validators.maxLength(100)]],
            instituteCode: ['', [Validators.required, Validators.maxLength(50), Validators.pattern('^[A-Z0-9_-]+$')]],
            instituteDescription: ['', [Validators.maxLength(500)]],
            instituteAddress: ['', [Validators.maxLength(200)]],
            institutePhone: ['', [Validators.maxLength(20)]],
            instituteLogo: [''],
            instituteType: ['', [Validators.required]],
            maxStudents: [null, [Validators.min(1)]],
            maxTeachers: [null, [Validators.min(1)]],
            timeZone: ['', [Validators.maxLength(50)]],
            currency: ['', [Validators.maxLength(3)]],
            language: ['', [Validators.maxLength(5)]],

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
        // Implementation for loading existing tenant with institute would go here
        // For now, just set loading to false
        setTimeout(() => {
            this.loading = false;
        }, 1000);
    }

    private tenantIdUniqueValidator(): AsyncValidatorFn {
        return (control: AbstractControl): Observable<ValidationErrors | null> => {
            const value: string = (control.value || '').trim();
            if (!value) {
                return of(null);
            }
            // Check if tenant exists by id; if found, mark as taken
            return this._tenantsService.getById(value).pipe(
                map(() => ({ tenantIdTaken: true })),
                catchError(() => of(null))
            );
        };
    }

    private normalizeUrl(url: string): string {
        if (!url) return url;
        const trimmed = url.trim();
        if (/^https?:\/\//i.test(trimmed)) {
            return trimmed;
        }
        return `https://${trimmed}`;
    }

    private handleApiErrors(error: any): void {
        // Surface backend validation messages if available
        const problemDetails = error?.error;
        const message = problemDetails?.title || 'Failed to create tenant with institute. Please review the form and try again.';
        this._fuseConfirmationService.open({
            title: 'Error',
            message,
            actions: { confirm: { label: 'OK' } }
        });
    }

    save(): void {
        if (this.tenantForm.invalid) {
            return;
        }

        this.saving = true;
        const formData = this.tenantForm.getRawValue();

        // Phase v1-C2.2 — minimal request shape.
        const request: CreateTenantWithInstituteRequest = {
            id: formData.id,
            systemName: formData.name,
            technicalAdminEmail: formData.adminEmail,
            subdomain: this.normalizeUrl(formData.url),
            connectionString: formData.connectionString || undefined,
            isShared: formData.isShared,
            planId: formData.planId || undefined,

            // Institute fields
            instituteDisplayName: formData.instituteName,
            instituteCode: formData.instituteCode,
            instituteContactEmail: formData.billingEmail || formData.adminEmail,
            instituteAddressLine: formData.instituteAddress || undefined,
            instituteContactPhone: formData.institutePhone || undefined,
            instituteLogoUrl: formData.instituteLogo || undefined,
            instituteType: formData.instituteType,
            maxStudents: formData.maxStudents || undefined,
            maxTeachers: formData.maxTeachers || undefined,
            timeZone: formData.timeZone || undefined,
            currency: formData.currency || undefined,
            language: formData.language || undefined,
        };

        this._tenantsService.createWithInstitute(request).subscribe({
            next: (response: CreateTenantWithInstituteResponse) => {
                this.saving = false;
                this._fuseConfirmationService.open({
                    title: 'Success',
                    message: `Tenant "${response.tenantName}" and Institute "${response.instituteName}" created successfully!`,
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
                console.error('Error creating tenant with institute:', error);
                this.saving = false;
                this.handleApiErrors(error);
            }
        });
    }

    cancel(): void {
        this._router.navigate(['/tenant']);
    }

    generateTenantId(): void {
        const name = this.tenantForm.get('name')?.value;
        if (name) {
            const tenantId = name
                .toLowerCase()
                .replace(/[^a-z0-9]/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');
            this.tenantForm.patchValue({ id: tenantId });
        }
    }

    generateInstituteCode(): void {
        const name = this.tenantForm.get('instituteName')?.value;
        if (name) {
            const code = name
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, '')
                .substring(0, 8);
            this.tenantForm.patchValue({ instituteCode: code });
        }
    }
} 