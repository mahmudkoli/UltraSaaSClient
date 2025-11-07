import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { TranslocoModule } from '@ngneat/transloco';
import { InstituteDto, CreateInstituteRequest, UpdateInstituteRequest } from '../../../core/institutes/institutes.types';
import { InstitutesService } from '../../../core/institutes/institutes.service';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
    selector: 'institute-form-enhanced',
    templateUrl: './institute-form-enhanced.component.html',
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
        MatAutocompleteModule,
        MatChipsModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatProgressBarModule,
        TranslocoModule,
    ],
})
export class InstituteFormEnhancedComponent implements OnInit, OnDestroy {
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    // Form groups for different sections
    basicInfoForm!: FormGroup;
    contactForm!: FormGroup;
    capacityForm!: FormGroup;
    configurationForm!: FormGroup;
    brandingForm!: FormGroup;

    isEditMode: boolean = false;
    instituteId: string | null = null;
    loading: boolean = false;
    saving: boolean = false;
    currentStep: number = 0;
    formProgress: number = 0;

    // Data for dropdowns
    instituteTypes = [
        { value: 'School', label: 'School', icon: 'school' },
        { value: 'College', label: 'College', icon: 'account_balance' },
        { value: 'University', label: 'University', icon: 'location_city' },
        { value: 'TrainingCenter', label: 'Training Center', icon: 'fitness_center' },
        { value: 'CoachingInstitute', label: 'Coaching Institute', icon: 'psychology' },
        { value: 'ResearchInstitute', label: 'Research Institute', icon: 'science' },
        { value: 'TechnicalInstitute', label: 'Technical Institute', icon: 'engineering' },
        { value: 'VocationalInstitute', label: 'Vocational Institute', icon: 'work' }
    ];

    countries = [
        { code: 'US', name: 'United States', currency: 'USD', timezone: 'America/New_York' },
        { code: 'GB', name: 'United Kingdom', currency: 'GBP', timezone: 'Europe/London' },
        { code: 'IN', name: 'India', currency: 'INR', timezone: 'Asia/Kolkata' },
        { code: 'AU', name: 'Australia', currency: 'AUD', timezone: 'Australia/Sydney' },
        { code: 'CA', name: 'Canada', currency: 'CAD', timezone: 'America/Toronto' },
        { code: 'DE', name: 'Germany', currency: 'EUR', timezone: 'Europe/Berlin' },
        { code: 'FR', name: 'France', currency: 'EUR', timezone: 'Europe/Paris' },
        { code: 'JP', name: 'Japan', currency: 'JPY', timezone: 'Asia/Tokyo' },
        { code: 'CN', name: 'China', currency: 'CNY', timezone: 'Asia/Shanghai' },
        { code: 'BR', name: 'Brazil', currency: 'BRL', timezone: 'America/Sao_Paulo' }
    ];

    languages = [
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Spanish' },
        { code: 'fr', name: 'French' },
        { code: 'de', name: 'German' },
        { code: 'pt', name: 'Portuguese' },
        { code: 'zh', name: 'Chinese' },
        { code: 'ja', name: 'Japanese' },
        { code: 'hi', name: 'Hindi' },
        { code: 'ar', name: 'Arabic' },
        { code: 'ru', name: 'Russian' }
    ];

    academicYearFormats = [
        { value: 'Sep-Jun', label: 'September to June' },
        { value: 'Jan-Dec', label: 'January to December' },
        { value: 'Apr-Mar', label: 'April to March' },
        { value: 'Jul-Jun', label: 'July to June' },
        { value: 'Aug-May', label: 'August to May' }
    ];

    // Validation messages
    validationMessages: { [key: string]: { [key: string]: string } } = {
        displayName: {
            required: 'Institute name is required',
            minlength: 'Institute name must be at least 3 characters',
            maxlength: 'Institute name cannot exceed 100 characters'
        },
        code: {
            required: 'Institute code is required',
            pattern: 'Code must be alphanumeric (letters, numbers, hyphens, underscores only)',
            minlength: 'Code must be at least 3 characters',
            maxlength: 'Code cannot exceed 50 characters',
            codeExists: 'This code is already in use'
        },
        contactEmail: {
            required: 'Contact email is required',
            email: 'Please enter a valid email address',
            maxlength: 'Email cannot exceed 500 characters'
        },
        contactPhone: {
            pattern: 'Please enter a valid phone number',
            maxlength: 'Phone number cannot exceed 20 characters'
        },
        website: {
            pattern: 'Please enter a valid URL (e.g., https://example.com)'
        },
        maxStudents: {
            required: 'Maximum students is required',
            min: 'Must be at least 1',
            max: 'Cannot exceed 100,000'
        },
        maxTeachers: {
            required: 'Maximum teachers is required',
            min: 'Must be at least 1',
            max: 'Cannot exceed 10,000'
        }
    };

    constructor(
        private _formBuilder: FormBuilder,
        private _institutesService: InstitutesService,
        private _router: Router,
        private _route: ActivatedRoute,
        private _fuseConfirmationService: FuseConfirmationService,
        private _snackBar: MatSnackBar
    ) {
        this.initializeForms();
    }

    ngOnInit(): void {
        this.instituteId = this._route.snapshot.paramMap.get('id');

        if (this.instituteId) {
            this.isEditMode = true;
            this.loadInstitute();
        } else {
            // Set defaults for new institute
            this.setDefaultValues();
        }

        // Setup form value change listeners
        this.setupFormListeners();

        // Calculate initial form progress
        this.calculateFormProgress();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    private initializeForms(): void {
        // Basic Information
        this.basicInfoForm = this._formBuilder.group({
            displayName: ['', [
                Validators.required,
                Validators.minLength(3),
                Validators.maxLength(100)
            ]],
            code: ['', [
                Validators.required,
                Validators.pattern(/^[a-zA-Z0-9_-]+$/),
                Validators.minLength(3),
                Validators.maxLength(50)
            ], [this.validateCodeUniqueness.bind(this)]],
            type: ['', [Validators.required]],
            tenantId: ['', [Validators.required]],
            country: ['', [Validators.required]],
            academicYearFormat: ['Sep-Jun', [Validators.required]]
        });

        // Contact Information
        this.contactForm = this._formBuilder.group({
            contactEmail: ['', [
                Validators.required,
                Validators.email,
                Validators.maxLength(500)
            ]],
            contactPhone: ['', [
                Validators.pattern(/^[\d\s()+-]+$/),
                Validators.maxLength(20)
            ]],
            website: ['', [
                Validators.pattern(/^https?:\/\/.+\..+/)
            ]],
            addressLine: ['', [Validators.maxLength(200)]],
            city: ['', [Validators.maxLength(100)]],
            state: ['', [Validators.maxLength(100)]],
            postalCode: ['', [Validators.maxLength(20)]]
        });

        // Capacity Settings
        this.capacityForm = this._formBuilder.group({
            maxStudents: [500, [
                Validators.required,
                Validators.min(1),
                Validators.max(100000)
            ]],
            maxTeachers: [50, [
                Validators.required,
                Validators.min(1),
                Validators.max(10000)
            ]],
            maxUsers: [600, [
                Validators.min(1),
                Validators.max(110000)
            ]],
            maxStorageGB: [100, [
                Validators.min(1),
                Validators.max(10000)
            ]]
        });

        // Configuration
        this.configurationForm = this._formBuilder.group({
            timeZone: ['UTC', [Validators.required]],
            currency: ['USD', [Validators.required]],
            language: ['en', [Validators.required]]
        });

        // Branding
        this.brandingForm = this._formBuilder.group({
            logoUrl: [''],
            bannerUrl: [''],
            primaryColor: ['#1976d2', [
                Validators.pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
            ]]
        });
    }

    private setupFormListeners(): void {
        // Auto-update configuration based on country selection
        this.basicInfoForm.get('country')?.valueChanges
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(countryCode => {
                const country = this.countries.find(c => c.code === countryCode);
                if (country) {
                    this.configurationForm.patchValue({
                        currency: country.currency,
                        timeZone: country.timezone
                    });
                }
            });

        // Live validation feedback with debounce
        this.basicInfoForm.get('code')?.valueChanges
            .pipe(
                debounceTime(500),
                distinctUntilChanged(),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe(() => {
                this.calculateFormProgress();
            });

        // Update progress on any form change
        [this.basicInfoForm, this.contactForm, this.capacityForm, this.configurationForm, this.brandingForm]
            .forEach(form => {
                form.valueChanges
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe(() => this.calculateFormProgress());
            });
    }

    private setDefaultValues(): void {
        // Set smart defaults based on type
        this.basicInfoForm.get('type')?.valueChanges
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(type => {
                switch(type) {
                    case 'School':
                        this.capacityForm.patchValue({
                            maxStudents: 1000,
                            maxTeachers: 50,
                            maxStorageGB: 50
                        });
                        break;
                    case 'College':
                        this.capacityForm.patchValue({
                            maxStudents: 5000,
                            maxTeachers: 200,
                            maxStorageGB: 200
                        });
                        break;
                    case 'University':
                        this.capacityForm.patchValue({
                            maxStudents: 20000,
                            maxTeachers: 1000,
                            maxStorageGB: 1000
                        });
                        break;
                    case 'TrainingCenter':
                    case 'CoachingInstitute':
                        this.capacityForm.patchValue({
                            maxStudents: 500,
                            maxTeachers: 20,
                            maxStorageGB: 20
                        });
                        break;
                }
            });
    }

    private calculateFormProgress(): void {
        const forms = [
            this.basicInfoForm,
            this.contactForm,
            this.capacityForm,
            this.configurationForm,
            this.brandingForm
        ];

        let totalFields = 0;
        let completedFields = 0;

        forms.forEach(form => {
            Object.keys(form.controls).forEach(key => {
                totalFields++;
                if (form.get(key)?.valid && form.get(key)?.value) {
                    completedFields++;
                }
            });
        });

        this.formProgress = Math.round((completedFields / totalFields) * 100);
    }

    private async validateCodeUniqueness(control: AbstractControl): Promise<ValidationErrors | null> {
        if (!control.value || this.isEditMode) {
            return null;
        }

        try {
            const exists = await this._institutesService.checkCodeExists(control.value).toPromise();
            return exists ? { codeExists: true } : null;
        } catch {
            return null;
        }
    }

    loadInstitute(): void {
        if (!this.instituteId) return;

        this.loading = true;
        this._institutesService.getById(this.instituteId).subscribe({
            next: (institute) => {
                // Populate all forms with institute data
                this.basicInfoForm.patchValue({
                    displayName: institute.displayName || institute.name,
                    code: institute.code,
                    type: institute.type,
                    tenantId: institute.tenantId,
                    country: institute.country || 'US',
                    academicYearFormat: institute.academicYearFormat || 'Sep-Jun'
                });

                this.contactForm.patchValue({
                    contactEmail: institute.contactEmail || institute.description,
                    contactPhone: institute.contactPhone || institute.phone,
                    website: institute.website,
                    addressLine: institute.addressLine || institute.address,
                    city: institute.city,
                    state: institute.state,
                    postalCode: institute.postalCode
                });

                this.capacityForm.patchValue({
                    maxStudents: institute.maxStudents,
                    maxTeachers: institute.maxTeachers,
                    maxUsers: institute.maxUsers,
                    maxStorageGB: institute.maxStorageGB
                });

                this.configurationForm.patchValue({
                    timeZone: institute.timeZone || 'UTC',
                    currency: institute.currency || 'USD',
                    language: institute.language || 'en'
                });

                this.brandingForm.patchValue({
                    logoUrl: institute.logoUrl || institute.logo,
                    bannerUrl: institute.bannerUrl,
                    primaryColor: institute.primaryColor || '#1976d2'
                });

                // Disable code field in edit mode
                this.basicInfoForm.get('code')?.disable();
                this.loading = false;
                this.calculateFormProgress();
            },
            error: (error) => {
                console.error('Error loading institute:', error);
                this.loading = false;
                this._snackBar.open('Failed to load institute data', 'Retry', {
                    duration: 5000,
                    panelClass: ['error-snackbar']
                }).onAction().subscribe(() => {
                    this.loadInstitute();
                });
            }
        });
    }

    // Step navigation
    nextStep(): void {
        if (this.currentStep < 4) {
            this.currentStep++;
        }
    }

    previousStep(): void {
        if (this.currentStep > 0) {
            this.currentStep--;
        }
    }

    canProceed(): boolean {
        switch(this.currentStep) {
            case 0: return this.basicInfoForm.valid;
            case 1: return this.contactForm.valid;
            case 2: return this.capacityForm.valid;
            case 3: return this.configurationForm.valid;
            case 4: return this.brandingForm.valid;
            default: return false;
        }
    }

    // Save functionality
    async save(): Promise<void> {
        // Mark all fields as touched to show validation errors
        [this.basicInfoForm, this.contactForm, this.capacityForm, this.configurationForm, this.brandingForm]
            .forEach(form => form.markAllAsTouched());

        // Check if all forms are valid
        if (!this.basicInfoForm.valid || !this.contactForm.valid || !this.capacityForm.valid) {
            this._snackBar.open('Please fill in all required fields', 'OK', {
                duration: 5000,
                panelClass: ['error-snackbar']
            });
            return;
        }

        // Show confirmation dialog
        const confirmation = await this._fuseConfirmationService.open({
            title: this.isEditMode ? 'Update Institute' : 'Create Institute',
            message: this.isEditMode
                ? 'Are you sure you want to update this institute?'
                : 'Are you sure you want to create this institute?',
            actions: {
                confirm: {
                    label: this.isEditMode ? 'Update' : 'Create',
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

        // Combine all form values
        const formData = {
            ...this.basicInfoForm.getRawValue(),
            ...this.contactForm.value,
            ...this.capacityForm.value,
            ...this.configurationForm.value,
            ...this.brandingForm.value
        };

        if (this.isEditMode && this.instituteId) {
            this.updateInstitute(formData);
        } else {
            this.createInstitute(formData);
        }
    }

    private createInstitute(formData: any): void {
        const request: CreateInstituteRequest = {
            displayName: formData.displayName,
            code: formData.code,
            contactEmail: formData.contactEmail,
            type: formData.type,
            tenantId: formData.tenantId,
            country: formData.country,
            contactPhone: formData.contactPhone || undefined,
            website: formData.website || undefined,
            addressLine: formData.addressLine || undefined,
            city: formData.city || undefined,
            state: formData.state || undefined,
            postalCode: formData.postalCode || undefined,
            maxStudents: formData.maxStudents,
            maxTeachers: formData.maxTeachers,
            timeZone: formData.timeZone,
            currency: formData.currency,
            language: formData.language,
            logoUrl: formData.logoUrl || undefined,
            bannerUrl: formData.bannerUrl || undefined,
            primaryColor: formData.primaryColor || undefined
        };

        this._institutesService.create(request).subscribe({
            next: (response) => {
                this.saving = false;
                this._snackBar.open('Institute created successfully!', 'View', {
                    duration: 5000,
                    panelClass: ['success-snackbar']
                }).onAction().subscribe(() => {
                    this._router.navigate(['/institute/view', response]);
                });
                this._router.navigate(['/institute']);
            },
            error: (error) => {
                console.error('Error creating institute:', error);
                this.saving = false;
                this._snackBar.open(
                    error.error?.message || 'Failed to create institute. Please try again.',
                    'OK',
                    {
                        duration: 5000,
                        panelClass: ['error-snackbar']
                    }
                );
            }
        });
    }

    private updateInstitute(formData: any): void {
        if (!this.instituteId) return;

        const request: UpdateInstituteRequest = {
            id: this.instituteId,
            name: formData.displayName,
            description: formData.contactEmail,
            address: formData.addressLine,
            phone: formData.contactPhone,
            type: formData.type,
            maxStudents: formData.maxStudents,
            maxTeachers: formData.maxTeachers,
            timeZone: formData.timeZone,
            currency: formData.currency,
            language: formData.language,
            logo: formData.logoUrl
        };

        this._institutesService.update(this.instituteId, request).subscribe({
            next: () => {
                this.saving = false;
                this._snackBar.open('Institute updated successfully!', 'OK', {
                    duration: 5000,
                    panelClass: ['success-snackbar']
                });
                this._router.navigate(['/institute']);
            },
            error: (error) => {
                console.error('Error updating institute:', error);
                this.saving = false;
                this._snackBar.open(
                    error.error?.message || 'Failed to update institute. Please try again.',
                    'OK',
                    {
                        duration: 5000,
                        panelClass: ['error-snackbar']
                    }
                );
            }
        });
    }

    // Quick save draft
    saveDraft(): void {
        const formData = {
            ...this.basicInfoForm.getRawValue(),
            ...this.contactForm.value,
            ...this.capacityForm.value,
            ...this.configurationForm.value,
            ...this.brandingForm.value
        };

        localStorage.setItem('institute-draft', JSON.stringify(formData));
        this._snackBar.open('Draft saved', 'OK', { duration: 2000 });
    }

    // Load draft
    loadDraft(): void {
        const draft = localStorage.getItem('institute-draft');
        if (draft) {
            const data = JSON.parse(draft);
            this.basicInfoForm.patchValue(data);
            this.contactForm.patchValue(data);
            this.capacityForm.patchValue(data);
            this.configurationForm.patchValue(data);
            this.brandingForm.patchValue(data);
            this._snackBar.open('Draft loaded', 'OK', { duration: 2000 });
        }
    }

    // Reset form
    async resetForm(): Promise<void> {
        const confirmation = await this._fuseConfirmationService.open({
            title: 'Reset Form',
            message: 'Are you sure you want to reset the form? All unsaved changes will be lost.',
            actions: {
                confirm: {
                    label: 'Reset',
                    color: 'warn'
                }
            }
        }).afterClosed().toPromise();

        if (confirmation === 'confirmed') {
            this.initializeForms();
            this.currentStep = 0;
            this._snackBar.open('Form reset', 'OK', { duration: 2000 });
        }
    }

    // Cancel and go back
    async cancel(): Promise<void> {
        if (this.hasUnsavedChanges()) {
            const confirmation = await this._fuseConfirmationService.open({
                title: 'Unsaved Changes',
                message: 'You have unsaved changes. Are you sure you want to leave?',
                actions: {
                    confirm: {
                        label: 'Leave',
                        color: 'warn'
                    }
                }
            }).afterClosed().toPromise();

            if (confirmation !== 'confirmed') {
                return;
            }
        }
        this._router.navigate(['/institute']);
    }

    private hasUnsavedChanges(): boolean {
        return [this.basicInfoForm, this.contactForm, this.capacityForm, this.configurationForm, this.brandingForm]
            .some(form => form.dirty);
    }

    // Helper method to get error message
    getErrorMessage(formName: string, fieldName: string): string {
        const form = this[formName as keyof this] as FormGroup;
        const control = form?.get(fieldName);

        if (control?.hasError('required')) {
            return this.validationMessages[fieldName]?.required || 'This field is required';
        }

        for (const errorName in control?.errors) {
            if (this.validationMessages[fieldName]?.[errorName]) {
                return this.validationMessages[fieldName][errorName];
            }
        }

        return '';
    }
}