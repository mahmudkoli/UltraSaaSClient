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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { TranslocoModule } from '@ngneat/transloco';
import { InstituteDto, CreateInstituteRequest, UpdateInstituteRequest, FileUploadRequest } from '../../../core/institutes/institutes.types';
import { InstitutesService } from '../../../core/institutes/institutes.service';

@Component({
    selector: 'institute-form',
    templateUrl: './institute-form.component.html',
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
        MatSnackBarModule,
        MatTabsModule,
        TranslocoModule,
    ],
})
export class InstituteFormComponent implements OnInit {
    instituteForm: FormGroup;
    isEditMode: boolean = false;
    instituteId: string | null = null;
    loading: boolean = false;
    saving: boolean = false;

    /** Logo picked in the browser (base64) — uploaded server-side on save. */
    logoUpload: FileUploadRequest | null = null;
    /** Data-URL (new pick) or existing logoUrl, shown as the logo preview. */
    logoPreview: string | null = null;

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
        private _institutesService: InstitutesService,
        private _router: Router,
        private _route: ActivatedRoute,
        private _fuseConfirmationService: FuseConfirmationService,
        private _snackBar: MatSnackBar
    ) {
        this.instituteForm = this._formBuilder.group({
            // Basic Information
            displayName: ['', [Validators.required, Validators.maxLength(100)]],
            code: ['', [Validators.required, Validators.maxLength(50)]],
            contactEmail: ['', [Validators.required, Validators.email, Validators.maxLength(500)]],
            addressLine: ['', [Validators.maxLength(200)]],
            contactPhone: ['', [Validators.maxLength(20)]],
            website: [''],
            logoUrl: [''],
            tenantId: ['', [Validators.required]],
            type: ['', [Validators.required]],

            // Capacity Settings
            maxStudents: [500, [Validators.required, Validators.min(1), Validators.max(100000)]],
            maxTeachers: [50, [Validators.required, Validators.min(1), Validators.max(10000)]],
            maxUsers: [600, [Validators.min(1), Validators.max(110000)]],
            maxStorageGB: [100, [Validators.min(1), Validators.max(10000)]],
            currentStudentCount: [0, [Validators.min(0)]],
            currentTeacherCount: [0, [Validators.min(0)]],
            currentStaffCount: [0, [Validators.min(0)]],
            currentStorageUsedMB: [0, [Validators.min(0)]],

            // Localization
            timeZone: ['UTC', [Validators.maxLength(50)]],
            currency: ['USD', [Validators.maxLength(3)]],
            language: ['en', [Validators.maxLength(5)]],
            country: ['', [Validators.maxLength(50)]],
            state: ['', [Validators.maxLength(50)]],
            city: ['', [Validators.maxLength(50)]],
            postalCode: ['', [Validators.maxLength(20)]],

            // Branding
            primaryColor: ['#1976d2', [Validators.pattern('^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$')]],
            bannerUrl: [''],

            // Settings
            isActive: [true],
            allowSelfRegistration: [false],
            requireEmailVerification: [true],
            enableNotifications: [true],
            enableReporting: [true],

            // Academic Settings
            academicYearFormat: ['Sep-Jun', [Validators.required]],
            establishedYear: [new Date().getFullYear(), [Validators.min(1800), Validators.max(new Date().getFullYear())]],
            accreditationNumber: [''],
            boardAffiliation: ['']
        });
    }

    ngOnInit(): void {
        this.instituteId = this._route.snapshot.paramMap.get('id');
        
        if (this.instituteId) {
            this.isEditMode = true;
            this.loadInstitute();
        }
    }

    loadInstitute(): void {
        if (!this.instituteId) return;

        this.loading = true;
        this._institutesService.getById(this.instituteId).subscribe({
            next: (institute) => {
                this.instituteForm.patchValue({
                    displayName: institute.displayName || (institute as any).name || '',
                    code: institute.code,
                    contactEmail: institute.contactEmail || (institute as any).description || '',
                    addressLine: institute.addressLine || (institute as any).address || '',
                    contactPhone: institute.contactPhone || (institute as any).phone || '',
                    logoUrl: institute.logoUrl || (institute as any).logo || '',
                    tenantId: institute.tenantId,
                    type: institute.type,
                    maxStudents: institute.maxStudents,
                    maxTeachers: institute.maxTeachers,
                    maxUsers: institute.maxUsers,
                    maxStorageGB: institute.maxStorageGB,
                    timeZone: institute.timeZone || 'UTC',
                    currency: institute.currency || 'USD',
                    language: institute.language || 'en',
                    city: institute.city || '',
                    state: institute.state || '',
                    country: institute.country || '',
                    postalCode: institute.postalCode || '',
                    bannerUrl: institute.bannerUrl || '',
                    primaryColor: institute.primaryColor || '#1976d2',
                    academicYearFormat: institute.academicYearFormat || 'Sep-Jun',
                    currentStudentCount: institute.currentStudentCount || 0,
                    currentTeacherCount: institute.currentTeacherCount || 0,
                    currentStaffCount: institute.currentStaffCount || 0,
                    currentStorageUsedMB: institute.currentStorageUsedMB || 0,
                    website: institute.website || ''
                });
                // Seed the logo preview with the saved logo (if any).
                this.logoPreview = institute.logoUrl || (institute as any).logo || null;
                // Disable code field in edit mode
                this.instituteForm.get('code')?.disable();
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading institute:', error);
                this.loading = false;
            }
        });
    }

    save(): void {
        if (this.instituteForm.invalid) {
            return;
        }

        this.saving = true;
        const formData = this.instituteForm.getRawValue();

        if (this.isEditMode && this.instituteId) {
            const request: UpdateInstituteRequest = {
                id: this.instituteId,
                displayName: formData.displayName,
                code: formData.code,
                contactEmail: formData.contactEmail,
                addressLine: formData.addressLine || undefined,
                contactPhone: formData.contactPhone || undefined,
                logoUrl: formData.logoUrl || undefined,
                logoUpload: this.logoUpload || undefined,
                type: formData.type,
                maxStudents: formData.maxStudents,
                maxTeachers: formData.maxTeachers,
                timeZone: formData.timeZone || undefined,
                currency: formData.currency || undefined,
                language: formData.language || undefined,
                country: formData.country || undefined,
                city: formData.city || undefined,
                state: formData.state || undefined,
                postalCode: formData.postalCode || undefined,
                website: formData.website || undefined,
                bannerUrl: formData.bannerUrl || undefined,
                primaryColor: formData.primaryColor || undefined
            };

            this._institutesService.update(this.instituteId, request).subscribe({
                next: () => {
                    this.saving = false;
                    this._fuseConfirmationService.open({
                        title: 'Success',
                        message: 'Institute updated successfully!',
                        actions: {
                            confirm: {
                                label: 'OK'
                            }
                        }
                    }).afterClosed().subscribe(() => {
                        this._router.navigate(['/institute']);
                    });
                },
                error: (error) => {
                    console.error('Error updating institute:', error);
                    this.saving = false;
                    this._fuseConfirmationService.open({
                        title: 'Error',
                        message: 'Failed to update institute. Please try again.',
                        actions: {
                            confirm: {
                                label: 'OK'
                            }
                        }
                    });
                }
            });
        } else {
            const request: CreateInstituteRequest = {
                displayName: formData.displayName,
                code: formData.code,
                contactEmail: formData.contactEmail,
                addressLine: formData.addressLine || undefined,
                contactPhone: formData.contactPhone || undefined,
                logoUrl: formData.logoUrl || undefined,
                logoUpload: this.logoUpload || undefined,
                tenantId: formData.tenantId,
                type: formData.type,
                maxStudents: formData.maxStudents,
                maxTeachers: formData.maxTeachers,
                country: formData.country || undefined,
                city: formData.city || undefined,
                state: formData.state || undefined,
                postalCode: formData.postalCode || undefined,
                website: formData.website || undefined,
                bannerUrl: formData.bannerUrl || undefined,
                primaryColor: formData.primaryColor || undefined,
                timeZone: formData.timeZone || undefined,
                currency: formData.currency || undefined,
                language: formData.language || undefined
            };

            this._institutesService.create(request).subscribe({
                next: () => {
                    this.saving = false;
                    this._fuseConfirmationService.open({
                        title: 'Success',
                        message: 'Institute created successfully!',
                        actions: {
                            confirm: {
                                label: 'OK'
                            }
                        }
                    }).afterClosed().subscribe(() => {
                        this._router.navigate(['/institute']);
                    });
                },
                error: (error) => {
                    console.error('Error creating institute:', error);
                    this.saving = false;
                    this._fuseConfirmationService.open({
                        title: 'Error',
                        message: 'Failed to create institute. Please try again.',
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
        this._router.navigate(['/institute']);
    }

    onLogoSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        const file = input.files && input.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            this._snackBar.open('Please choose an image file (PNG or JPG).', 'Dismiss', { duration: 3000 });
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            this._snackBar.open('Logo must be under 2 MB.', 'Dismiss', { duration: 3000 });
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;          // data:image/png;base64,AAAA
            const data = result.substring(result.indexOf(',') + 1);
            const dot = file.name.lastIndexOf('.');
            this.logoUpload = {
                name: (dot > 0 ? file.name.substring(0, dot) : file.name).substring(0, 150),
                extension: dot >= 0 ? file.name.substring(dot).toLowerCase() : '',
                data
            };
            this.logoPreview = result;
        };
        reader.readAsDataURL(file);
        input.value = ''; // allow re-selecting the same file
    }

    clearLogo(): void {
        this.logoUpload = null;
        this.logoPreview = null;
        this.instituteForm.patchValue({ logoUrl: '' });
    }

    generateInstituteCode(): void {
        const name = this.instituteForm.get('displayName')?.value;
        if (!name) {
            this._snackBar.open('Enter a display name first to generate a code.', 'Dismiss', { duration: 3000 });
            return;
        }
        const code = name
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, '')
            .substring(0, 8);
        if (!code) {
            this._snackBar.open('Could not derive a code — the name has no letters or digits.', 'Dismiss', { duration: 3000 });
            return;
        }
        this.instituteForm.patchValue({ code });
        this._snackBar.open(`Institute code generated: ${code}`, 'OK', { duration: 2500 });
    }
} 