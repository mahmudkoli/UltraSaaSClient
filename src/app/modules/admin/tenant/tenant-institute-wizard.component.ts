import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatRadioModule } from '@angular/material/radio';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { TranslocoModule } from '@ngneat/transloco';
import { Subject, takeUntil, forkJoin } from 'rxjs';

import { TenantDto, CreateTenantRequest } from '../../../core/tenants/tenants.types';
import { InstituteDto, CreateInstituteRequest } from '../../../core/institutes/institutes.types';
import { TenantsService } from '../../../core/tenants/tenants.service';
import { InstitutesService } from '../../../core/institutes/institutes.service';

@Component({
    selector: 'tenant-institute-wizard',
    templateUrl: './tenant-institute-wizard.component.html',
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
        MatSnackBarModule,
        MatStepperModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatProgressBarModule,
        MatDividerModule,
        MatExpansionModule,
        MatRadioModule,
        TranslocoModule,
    ],
})
export class TenantInstituteWizardComponent implements OnInit, OnDestroy {
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    // Wizard configuration
    wizardMode: 'tenant-only' | 'institute-only' | 'both' = 'both';
    currentStep: number = 0;
    totalSteps: number = 6;
    formProgress: number = 0;

    // Form groups
    setupTypeForm!: FormGroup;
    tenantBasicForm!: FormGroup;
    tenantTechnicalForm!: FormGroup;
    tenantBillingForm!: FormGroup;
    instituteForm!: FormGroup;
    reviewForm!: FormGroup;

    // State
    saving: boolean = false;
    createdTenant: TenantDto | null = null;
    createdInstitute: InstituteDto | null = null;

    // Configuration options
    setupTypes = [
        {
            value: 'both',
            title: 'Complete Setup',
            description: 'Create both Tenant and Institute',
            icon: 'account_tree',
            recommended: true
        },
        {
            value: 'tenant-only',
            title: 'Tenant Only',
            description: 'Create tenant without institute',
            icon: 'business',
            recommended: false
        },
        {
            value: 'institute-only',
            title: 'Institute Only',
            description: 'Add institute to existing tenant',
            icon: 'school',
            recommended: false
        }
    ];

    billingPlans = [
        {
            value: 'Free',
            label: 'Free Trial',
            price: 0,
            features: ['Up to 100 users', '1 Institute', 'Basic features', '30-day trial'],
            color: 'gray'
        },
        {
            value: 'Basic',
            label: 'Basic',
            price: 49,
            features: ['Up to 500 users', '3 Institutes', 'Standard features', 'Email support'],
            color: 'blue'
        },
        {
            value: 'Professional',
            label: 'Professional',
            price: 199,
            features: ['Up to 2000 users', '10 Institutes', 'Advanced features', 'Priority support'],
            color: 'indigo',
            recommended: true
        },
        {
            value: 'Enterprise',
            label: 'Enterprise',
            price: 'Custom',
            features: ['Unlimited users', 'Unlimited Institutes', 'All features', 'Dedicated support'],
            color: 'purple'
        }
    ];

    supportTiers = [
        { value: 'Basic', label: 'Basic Support', description: 'Email support, 48h response' },
        { value: 'Standard', label: 'Standard Support', description: 'Email & chat, 24h response' },
        { value: 'Priority', label: 'Priority Support', description: 'Phone, email & chat, 4h response' },
        { value: 'Premium', label: 'Premium Support', description: '24/7 dedicated support, 1h response' }
    ];

    dataResidencies = [
        { code: 'US', name: 'United States', region: 'us-east-1' },
        { code: 'EU', name: 'European Union', region: 'eu-west-1' },
        { code: 'AP', name: 'Asia Pacific', region: 'ap-southeast-1' },
        { code: 'CA', name: 'Canada', region: 'ca-central-1' }
    ];

    instituteTypes = [
        { value: 'School', label: 'School', icon: 'school' },
        { value: 'College', label: 'College', icon: 'account_balance' },
        { value: 'University', label: 'University', icon: 'location_city' },
        { value: 'TrainingCenter', label: 'Training Center', icon: 'fitness_center' }
    ];

    existingTenants: TenantDto[] = [];

    constructor(
        private _formBuilder: FormBuilder,
        private _tenantsService: TenantsService,
        private _institutesService: InstitutesService,
        private _router: Router,
        private _fuseConfirmationService: FuseConfirmationService,
        private _snackBar: MatSnackBar
    ) {
        this.initializeForms();
    }

    ngOnInit(): void {
        this.loadExistingTenants();
        this.setupFormListeners();
        this.calculateFormProgress();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    private initializeForms(): void {
        // Step 1: Setup Type Selection
        this.setupTypeForm = this._formBuilder.group({
            setupType: ['both', Validators.required]
        });

        // Step 2: Tenant Basic Information
        this.tenantBasicForm = this._formBuilder.group({
            id: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9-_]+$/)]],
            systemName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
            subdomain: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]],
            customDomain: [''],
            technicalAdminEmail: ['', [Validators.required, Validators.email]],
            existingTenantId: [''] // For institute-only mode
        });

        // Step 3: Tenant Technical Configuration
        this.tenantTechnicalForm = this._formBuilder.group({
            dataResidency: ['US', Validators.required],
            maxDatabaseGB: [5, [Validators.required, Validators.min(1), Validators.max(1000)]],
            maxApiCallsPerMonth: [10000, [Validators.required, Validators.min(1000)]],
            maxConcurrentUsers: [50, [Validators.required, Validators.min(1)]],
            dataRetentionDays: [365, [Validators.required, Validators.min(30)]],
            requires2FA: [false],
            requiresGDPR: [false],
            ipWhitelist: [''],
            enableAdvancedReporting: [false],
            enableCustomBranding: [false],
            enableApiAccess: [true],
            enableBackupRestore: [false]
        });

        // Step 4: Tenant Billing Configuration
        this.tenantBillingForm = this._formBuilder.group({
            billingPlan: ['Professional', Validators.required],
            monthlyFee: [199, [Validators.required, Validators.min(0)]],
            billingCurrency: ['USD', Validators.required],
            billingEmail: ['', [Validators.required, Validators.email]],
            paymentStatus: ['Trial', Validators.required],
            supportTier: ['Standard', Validators.required],
            validUpto: [this.getDefaultValidDate(), Validators.required],
            accountManagerEmail: [''],
            emergencyContact: ['']
        });

        // Step 5: Institute Configuration
        this.instituteForm = this._formBuilder.group({
            displayName: ['', [Validators.required, Validators.minLength(3)]],
            code: ['', [Validators.required, Validators.pattern(/^[A-Z0-9-_]+$/)]],
            type: ['School', Validators.required],
            contactEmail: ['', [Validators.required, Validators.email]],
            contactPhone: [''],
            website: [''],
            country: ['US', Validators.required],
            city: [''],
            state: [''],
            addressLine: [''],
            postalCode: [''],
            maxEmployees: [100, [Validators.required, Validators.min(1)]],
            maxStorageGB: [100, [Validators.min(1)]],
            timeZone: ['America/New_York', Validators.required],
            currency: ['USD', Validators.required],
            language: ['en', Validators.required],
            fiscalYearFormat: ['Jul-Jun', Validators.required],
            logoUrl: [''],
            primaryColor: ['#1976d2']
        });

        // Step 6: Review
        this.reviewForm = this._formBuilder.group({
            confirmed: [false, Validators.requiredTrue],
            sendWelcomeEmail: [true],
            autoActivate: [true],
            createSampleData: [false]
        });
    }

    private setupFormListeners(): void {
        // Update wizard mode based on setup type
        this.setupTypeForm.get('setupType')?.valueChanges
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((type) => {
                this.wizardMode = type;
                this.updateStepsBasedOnMode();
                this.calculateFormProgress();
            });

        // Auto-populate billing email from technical admin email
        this.tenantBasicForm.get('technicalAdminEmail')?.valueChanges
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((email) => {
                if (email && !this.tenantBillingForm.get('billingEmail')?.value) {
                    this.tenantBillingForm.patchValue({ billingEmail: email });
                }
                if (email && !this.instituteForm.get('contactEmail')?.value) {
                    this.instituteForm.patchValue({ contactEmail: email });
                }
            });

        // Update monthly fee based on billing plan
        this.tenantBillingForm.get('billingPlan')?.valueChanges
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((plan) => {
                const selectedPlan = this.billingPlans.find(p => p.value === plan);
                if (selectedPlan && typeof selectedPlan.price === 'number') {
                    this.tenantBillingForm.patchValue({ monthlyFee: selectedPlan.price });
                }
            });

        // Auto-generate subdomain from system name
        this.tenantBasicForm.get('systemName')?.valueChanges
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((name) => {
                if (name && !this.tenantBasicForm.get('subdomain')?.touched) {
                    const subdomain = name.toLowerCase()
                        .replace(/[^a-z0-9-]/g, '-')
                        .replace(/-+/g, '-')
                        .replace(/^-|-$/g, '');
                    this.tenantBasicForm.patchValue({ subdomain });
                }
            });

        // Auto-generate institute code from name
        this.instituteForm.get('displayName')?.valueChanges
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((name) => {
                if (name && !this.instituteForm.get('code')?.touched) {
                    const code = name.toUpperCase()
                        .replace(/[^A-Z0-9]/g, '')
                        .slice(0, 10);
                    this.instituteForm.patchValue({ code });
                }
            });

        // Listen to all forms for progress calculation
        [this.setupTypeForm, this.tenantBasicForm, this.tenantTechnicalForm,
         this.tenantBillingForm, this.instituteForm, this.reviewForm]
            .forEach(form => {
                form.valueChanges
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe(() => this.calculateFormProgress());
            });
    }

    private updateStepsBasedOnMode(): void {
        switch(this.wizardMode) {
            case 'tenant-only':
                this.totalSteps = 5; // No institute step
                break;
            case 'institute-only':
                this.totalSteps = 3; // Setup type, institute, review
                break;
            case 'both':
            default:
                this.totalSteps = 6; // All steps
                break;
        }
    }

    private calculateFormProgress(): void {
        let completedSteps = 0;
        let totalRequiredSteps = 0;

        if (this.wizardMode === 'both') {
            totalRequiredSteps = 6;
            if (this.setupTypeForm.valid) completedSteps++;
            if (this.tenantBasicForm.valid) completedSteps++;
            if (this.tenantTechnicalForm.valid) completedSteps++;
            if (this.tenantBillingForm.valid) completedSteps++;
            if (this.instituteForm.valid) completedSteps++;
            if (this.reviewForm.valid) completedSteps++;
        } else if (this.wizardMode === 'tenant-only') {
            totalRequiredSteps = 5;
            if (this.setupTypeForm.valid) completedSteps++;
            if (this.tenantBasicForm.valid) completedSteps++;
            if (this.tenantTechnicalForm.valid) completedSteps++;
            if (this.tenantBillingForm.valid) completedSteps++;
            if (this.reviewForm.valid) completedSteps++;
        } else {
            totalRequiredSteps = 3;
            if (this.setupTypeForm.valid) completedSteps++;
            if (this.instituteForm.valid) completedSteps++;
            if (this.reviewForm.valid) completedSteps++;
        }

        this.formProgress = Math.round((completedSteps / totalRequiredSteps) * 100);
    }

    private getDefaultValidDate(): string {
        const date = new Date();
        date.setMonth(date.getMonth() + 1); // Default to 1 month validity
        return date.toISOString().split('T')[0];
    }

    private loadExistingTenants(): void {
        this._tenantsService.getAll().subscribe({
            next: (tenants) => {
                this.existingTenants = tenants;
            },
            error: (error) => {
                console.error('Failed to load tenants:', error);
            }
        });
    }

    // Navigation methods
    canProceedToNext(): boolean {
        switch(this.currentStep) {
            case 0: return this.setupTypeForm.valid;
            case 1:
                if (this.wizardMode === 'institute-only') {
                    return !!this.tenantBasicForm.get('existingTenantId')?.value;
                }
                return this.tenantBasicForm.valid;
            case 2: return this.tenantTechnicalForm.valid;
            case 3: return this.tenantBillingForm.valid;
            case 4: return this.instituteForm.valid;
            case 5: return this.reviewForm.valid;
            default: return false;
        }
    }

    nextStep(): void {
        if (!this.canProceedToNext()) {
            this._snackBar.open('Please complete all required fields', 'OK', {
                duration: 3000,
                panelClass: ['error-snackbar']
            });
            return;
        }

        // Skip steps based on mode
        if (this.wizardMode === 'institute-only') {
            if (this.currentStep === 0) {
                this.currentStep = 4; // Jump to institute form
            } else if (this.currentStep === 4) {
                this.currentStep = 5; // Jump to review
            } else {
                this.currentStep++;
            }
        } else if (this.wizardMode === 'tenant-only') {
            if (this.currentStep === 3) {
                this.currentStep = 5; // Skip institute form
            } else {
                this.currentStep++;
            }
        } else {
            this.currentStep++;
        }
    }

    previousStep(): void {
        if (this.wizardMode === 'institute-only') {
            if (this.currentStep === 5) {
                this.currentStep = 4; // Back to institute form
            } else if (this.currentStep === 4) {
                this.currentStep = 0; // Back to setup type
            } else {
                this.currentStep--;
            }
        } else if (this.wizardMode === 'tenant-only') {
            if (this.currentStep === 5) {
                this.currentStep = 3; // Skip institute form
            } else {
                this.currentStep--;
            }
        } else {
            this.currentStep--;
        }
    }

    goToStep(step: number): void {
        if (step <= this.currentStep) {
            this.currentStep = step;
        }
    }

    // Create methods
    async create(): Promise<void> {
        if (!this.reviewForm.valid) {
            this._snackBar.open('Please confirm the setup details', 'OK', {
                duration: 3000,
                panelClass: ['error-snackbar']
            });
            return;
        }

        const confirmation = await this._fuseConfirmationService.open({
            title: 'Confirm Setup',
            message: this.getConfirmationMessage(),
            icon: {
                show: true,
                name: 'heroicons_outline:check-circle',
                color: 'success'
            },
            actions: {
                confirm: {
                    label: 'Create',
                    color: 'primary'
                },
                cancel: {
                    label: 'Cancel'
                }
            }
        }).afterClosed().toPromise();

        if (confirmation !== 'confirmed') {
            return;
        }

        this.saving = true;

        try {
            if (this.wizardMode === 'both') {
                await this.createTenantAndInstitute();
            } else if (this.wizardMode === 'tenant-only') {
                await this.createTenantOnly();
            } else {
                await this.createInstituteOnly();
            }

            this._snackBar.open('Setup completed successfully!', 'View', {
                duration: 5000,
                panelClass: ['success-snackbar']
            }).onAction().subscribe(() => {
                if (this.createdTenant) {
                    this._router.navigate(['/tenant', this.createdTenant.id]);
                } else if (this.createdInstitute) {
                    this._router.navigate(['/institute', this.createdInstitute.id]);
                }
            });

            // Send welcome email if selected
            if (this.reviewForm.get('sendWelcomeEmail')?.value) {
                this.sendWelcomeEmails();
            }

            // Navigate to appropriate page
            this._router.navigate(['/tenant']);

        } catch (error: any) {
            console.error('Setup failed:', error);
            this._snackBar.open(
                error.error?.message || 'Setup failed. Please try again.',
                'OK',
                {
                    duration: 5000,
                    panelClass: ['error-snackbar']
                }
            );
        } finally {
            this.saving = false;
        }
    }

    private async createTenantAndInstitute(): Promise<void> {
        // First create the tenant
        const tenantRequest: CreateTenantRequest = this.buildTenantRequest();

        const tenantId = await this._tenantsService.create(tenantRequest).toPromise();

        if (tenantId) {
            // Get the created tenant details
            this.createdTenant = await this._tenantsService.getById(tenantId).toPromise() || null;

            // Then create the institute with the tenant ID
            const instituteRequest: CreateInstituteRequest = this.buildInstituteRequest(tenantId);
            const instituteId = await this._institutesService.create(instituteRequest).toPromise();

            if (instituteId) {
                this.createdInstitute = await this._institutesService.getById(instituteId).toPromise() || null;
            }
        }
    }

    private async createTenantOnly(): Promise<void> {
        const tenantRequest: CreateTenantRequest = this.buildTenantRequest();
        const tenantId = await this._tenantsService.create(tenantRequest).toPromise();

        if (tenantId) {
            this.createdTenant = await this._tenantsService.getById(tenantId).toPromise() || null;
        }
    }

    private async createInstituteOnly(): Promise<void> {
        const tenantId = this.tenantBasicForm.get('existingTenantId')?.value;
        const instituteRequest: CreateInstituteRequest = this.buildInstituteRequest(tenantId);
        const instituteId = await this._institutesService.create(instituteRequest).toPromise();

        if (instituteId) {
            this.createdInstitute = await this._institutesService.getById(instituteId).toPromise() || null;
        }
    }

    private buildTenantRequest(): CreateTenantRequest {
        const basicData = this.tenantBasicForm.value;
        const technicalData = this.tenantTechnicalForm.value;
        const billingData = this.tenantBillingForm.value;
        const reviewData = this.reviewForm.value;

        // Phase v1-C2.2 — minimal create payload (most fields removed).
        // Wizard form steps still collect technical/billing data for UX
        // continuity; only the surviving fields are sent to the API.
        return {
            id: basicData.id,
            systemName: basicData.systemName,
            technicalAdminEmail: basicData.technicalAdminEmail,
            subdomain: basicData.subdomain,
            isShared: false,
            planId: billingData.planId || undefined,
            billingEmail: billingData.billingEmail,
        };
    }

    private buildInstituteRequest(tenantId: string): CreateInstituteRequest {
        const instituteData = this.instituteForm.value;

        return {
            displayName: instituteData.displayName,
            code: instituteData.code,
            type: instituteData.type,
            tenantId: tenantId,
            contactEmail: instituteData.contactEmail,
            contactPhone: instituteData.contactPhone || undefined,
            website: instituteData.website || undefined,
            country: instituteData.country,
            city: instituteData.city || undefined,
            state: instituteData.state || undefined,
            addressLine: instituteData.addressLine || undefined,
            postalCode: instituteData.postalCode || undefined,
            maxEmployees: instituteData.maxEmployees,
            timeZone: instituteData.timeZone,
            currency: instituteData.currency,
            language: instituteData.language,
            logoUrl: instituteData.logoUrl || undefined,
            primaryColor: instituteData.primaryColor || undefined
        };
    }

    private getConfirmationMessage(): string {
        if (this.wizardMode === 'both') {
            return `You are about to create:
                - Tenant: ${this.tenantBasicForm.get('systemName')?.value}
                - Institute: ${this.instituteForm.get('displayName')?.value}
                - Billing Plan: ${this.tenantBillingForm.get('billingPlan')?.value}

                This action cannot be undone. Do you want to proceed?`;
        } else if (this.wizardMode === 'tenant-only') {
            return `You are about to create:
                - Tenant: ${this.tenantBasicForm.get('systemName')?.value}
                - Billing Plan: ${this.tenantBillingForm.get('billingPlan')?.value}

                This action cannot be undone. Do you want to proceed?`;
        } else {
            return `You are about to create:
                - Institute: ${this.instituteForm.get('displayName')?.value}
                - For Tenant ID: ${this.tenantBasicForm.get('existingTenantId')?.value}

                This action cannot be undone. Do you want to proceed?`;
        }
    }

    private sendWelcomeEmails(): void {
        // Implementation for sending welcome emails
        console.log('Sending welcome emails...');
    }

    // Helper methods
    getStepLabel(step: number): string {
        if (this.wizardMode === 'institute-only') {
            switch(step) {
                case 0: return 'Setup Type';
                case 4: return 'Institute Details';
                case 5: return 'Review & Confirm';
                default: return '';
            }
        }

        switch(step) {
            case 0: return 'Setup Type';
            case 1: return 'Tenant Basics';
            case 2: return 'Technical Config';
            case 3: return 'Billing Setup';
            case 4: return 'Institute Details';
            case 5: return 'Review & Confirm';
            default: return '';
        }
    }

    isStepAccessible(step: number): boolean {
        if (this.wizardMode === 'institute-only') {
            return step === 0 || step === 4 || step === 5;
        }
        if (this.wizardMode === 'tenant-only') {
            return step !== 4;
        }
        return true;
    }

    getTotalSteps(): number {
        if (this.wizardMode === 'institute-only') {
            return 3; // Steps 0, 4, 5
        }
        if (this.wizardMode === 'tenant-only') {
            return 5; // All steps except 4
        }
        return 6; // All steps
    }

    getTenantSummary(): any {
        if (this.wizardMode === 'institute-only') {
            const tenant = this.existingTenants.find(t => t.id === this.tenantBasicForm.get('existingTenantId')?.value);
            return tenant ? {
                systemName: tenant.systemName,
                subdomain: tenant.subdomain,
                planId: tenant.planId,
            } : null;
        }

        return {
            id: this.tenantBasicForm.get('id')?.value,
            systemName: this.tenantBasicForm.get('systemName')?.value,
            subdomain: this.tenantBasicForm.get('subdomain')?.value,
            technicalAdminEmail: this.tenantBasicForm.get('technicalAdminEmail')?.value,
            billingPlan: this.tenantBillingForm.get('billingPlan')?.value,
            monthlyFee: this.tenantBillingForm.get('monthlyFee')?.value,
            dataResidency: this.tenantTechnicalForm.get('dataResidency')?.value,
            maxDatabaseGB: this.tenantTechnicalForm.get('maxDatabaseGB')?.value,
            supportTier: this.tenantBillingForm.get('supportTier')?.value
        };
    }

    getInstituteSummary(): any {
        return {
            displayName: this.instituteForm.get('displayName')?.value,
            code: this.instituteForm.get('code')?.value,
            type: this.instituteForm.get('type')?.value,
            contactEmail: this.instituteForm.get('contactEmail')?.value,
            country: this.instituteForm.get('country')?.value,
            maxEmployees: this.instituteForm.get('maxEmployees')?.value,
            maxStorageGB: this.instituteForm.get('maxStorageGB')?.value
        };
    }

    calculateEstimatedCost(): number {
        const plan = this.tenantBillingForm.get('billingPlan')?.value;
        const selectedPlan = this.billingPlans.find(p => p.value === plan);

        if (selectedPlan && typeof selectedPlan.price === 'number') {
            let cost = selectedPlan.price;

            // Add-ons
            if (this.tenantTechnicalForm.get('enableAdvancedReporting')?.value) cost += 20;
            if (this.tenantTechnicalForm.get('enableCustomBranding')?.value) cost += 15;
            if (this.tenantTechnicalForm.get('enableBackupRestore')?.value) cost += 30;

            // Support tier
            const supportTier = this.tenantBillingForm.get('supportTier')?.value;
            if (supportTier === 'Priority') cost += 50;
            if (supportTier === 'Premium') cost += 150;

            return cost;
        }

        return 0;
    }
}