import { Component, OnInit, OnDestroy, ViewEncapsulation, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
// import { ColorPickerModule } from 'ngx-color-picker';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { TranslocoModule } from '@ngneat/transloco';
import { InstituteDto, UpdateInstituteBrandingRequest } from '../../../core/institutes/institutes.types';
import { InstitutesService } from '../../../core/institutes/institutes.service';

@Component({
    selector: 'institute-branding',
    templateUrl: './institute-branding.component.html',
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
        // ColorPickerModule,
        TranslocoModule,
    ],
})
export class InstituteBrandingComponent implements OnInit, OnDestroy {
    institute?: InstituteDto;
    instituteId: string;
    brandingForm: FormGroup;
    loading: boolean = false;
    saving: boolean = false;

    // Performance optimization
    private destroy$ = new Subject<void>();

    // Cached values to avoid function calls in template
    headingFontName: string = 'Inter';
    primaryFontName: string = 'Inter';

    previewColors = {
        primary: '#1976d2',
        secondary: '#424242'
    };

    colorPresets = [
        { name: 'Blue', primary: '#1976d2', secondary: '#424242' },
        { name: 'Green', primary: '#388e3c', secondary: '#2e7d32' },
        { name: 'Purple', primary: '#7b1fa2', secondary: '#6a1b9a' },
        { name: 'Red', primary: '#d32f2f', secondary: '#c62828' },
        { name: 'Orange', primary: '#f57c00', secondary: '#ef6c00' },
        { name: 'Teal', primary: '#00796b', secondary: '#00695c' },
        { name: 'Indigo', primary: '#303f9f', secondary: '#283593' },
        { name: 'Pink', primary: '#c2185b', secondary: '#ad1457' }
    ];

    constructor(
        private _formBuilder: FormBuilder,
        private _institutesService: InstitutesService,
        private _router: Router,
        private _route: ActivatedRoute,
        private _fuseConfirmationService: FuseConfirmationService
    ) {
        this.instituteId = this._route.snapshot.paramMap.get('id')!;

        this.brandingForm = this._formBuilder.group({
            logoUrl: ['', [Validators.maxLength(500)]],
            bannerUrl: ['', [Validators.maxLength(500)]],
            primaryColor: ['#1976d2', [
                Validators.required,
                Validators.pattern('^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$')
            ]],
            secondaryColor: ['#424242', [
                Validators.pattern('^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$')
            ]],
            favicon: ['', [Validators.maxLength(500)]],
            customCss: [''],
            brandName: [''],
            brandTagline: ['', [Validators.maxLength(200)]],
            brandDescription: ['', [Validators.maxLength(500)]],
            headingFont: ['Inter'],
            primaryFont: ['Inter']
        });
    }

    ngOnInit(): void {
        this.loadInstitute();
        this.setupColorWatchers();
    }

    loadInstitute(): void {
        this.loading = true;
        this._institutesService.getById(this.instituteId).subscribe({
            next: (institute) => {
                this.institute = institute;
                this.brandingForm.patchValue({
                    logoUrl: institute.logoUrl || '',
                    bannerUrl: institute.bannerUrl || '',
                    primaryColor: institute.primaryColor || '#1976d2',
                    secondaryColor: institute.secondaryColor || '#424242',
                    favicon: institute.favicon || '',
                    customCss: institute.customCss || '',
                    brandName: institute.brandName || institute.name,
                    brandTagline: institute.brandTagline || '',
                    brandDescription: (institute as any).brandDescription || '',
                    headingFont: (institute as any).headingFont || 'Inter',
                    primaryFont: (institute as any).primaryFont || 'Inter'
                });
                this.updatePreviewColors();
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading institute:', error);
                this.loading = false;
            }
        });
    }

    setupColorWatchers(): void {
        // Use takeUntil to prevent memory leaks
        this.brandingForm.get('primaryColor')?.valueChanges
            .pipe(takeUntil(this.destroy$))
            .subscribe(color => {
                this.previewColors.primary = color || '#1976d2';
            });

        this.brandingForm.get('secondaryColor')?.valueChanges
            .pipe(takeUntil(this.destroy$))
            .subscribe(color => {
                this.previewColors.secondary = color || '#424242';
            });

        // Watch for font changes to update cached values
        this.brandingForm.get('headingFont')?.valueChanges
            .pipe(takeUntil(this.destroy$))
            .subscribe(fontValue => {
                this.headingFontName = this.getFontName(fontValue);
            });

        this.brandingForm.get('primaryFont')?.valueChanges
            .pipe(takeUntil(this.destroy$))
            .subscribe(fontValue => {
                this.primaryFontName = this.getFontName(fontValue);
            });
    }

    updatePreviewColors(): void {
        const formData = this.brandingForm.value;
        this.previewColors.primary = formData.primaryColor || '#1976d2';
        this.previewColors.secondary = formData.secondaryColor || '#424242';

        // Update cached font names
        this.headingFontName = this.getFontName(formData.headingFont);
        this.primaryFontName = this.getFontName(formData.primaryFont);
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    applyColorPreset(preset: any): void {
        this.brandingForm.patchValue({
            primaryColor: preset.primary,
            secondaryColor: preset.secondary
        });
    }

    updateBranding(): void {
        if (this.brandingForm.invalid) {
            return;
        }

        this.saving = true;
        const formData = this.brandingForm.getRawValue();

        const request: UpdateInstituteBrandingRequest = {
            id: this.instituteId,
            logoUrl: formData.logoUrl || undefined,
            bannerUrl: formData.bannerUrl || undefined,
            primaryColor: formData.primaryColor,
            secondaryColor: formData.secondaryColor || undefined,
            favicon: formData.favicon || undefined,
            customCss: formData.customCss || undefined,
            brandName: formData.brandName || undefined,
            brandTagline: formData.brandTagline || undefined
        };

        this._institutesService.updateBranding(this.instituteId, request).subscribe({
            next: () => {
                this.saving = false;
                this._fuseConfirmationService.open({
                    title: 'Success',
                    message: 'Institute branding updated successfully!',
                    actions: {
                        confirm: { label: 'OK' }
                    }
                });
                this.loadInstitute();
            },
            error: (error) => {
                console.error('Error updating branding:', error);
                this.saving = false;
                this._fuseConfirmationService.open({
                    title: 'Error',
                    message: 'Failed to update branding. Please try again.',
                    actions: {
                        confirm: { label: 'OK' }
                    }
                });
            }
        });
    }

    resetToDefaults(): void {
        const confirmation = this._fuseConfirmationService.open({
            title: 'Reset Branding',
            message: 'Are you sure you want to reset all branding settings to default values?',
            actions: {
                confirm: {
                    label: 'Reset',
                    color: 'warn'
                },
                cancel: {
                    label: 'Cancel'
                }
            }
        });

        confirmation.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this.brandingForm.patchValue({
                    logoUrl: '',
                    bannerUrl: '',
                    primaryColor: '#1976d2',
                    secondaryColor: '#424242',
                    favicon: '',
                    customCss: '',
                    brandName: this.institute?.name || '',
                    brandTagline: '',
                    brandDescription: '',
                    headingFont: 'Inter',
                    primaryFont: 'Inter'
                });
            }
        });
    }

    previewBranding(): void {
        // This would open a preview window or modal
        console.log('Preview branding with colors:', this.previewColors);
    }

    goBack(): void {
        this._router.navigate(['/institute']);
    }

    isValidUrl(url: string): boolean {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    getFontName(fontValue: string): string {
        if (!fontValue) return 'Inter';

        // Extract font name from font family string
        const fontName = fontValue.split(',')[0].replace(/['"]/g, '').trim();
        return fontName;
    }
}