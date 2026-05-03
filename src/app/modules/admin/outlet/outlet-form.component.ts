import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { OutletsService } from 'app/core/outlets/outlets.service';
import { OutletType } from 'app/core/outlets/outlets.types';
import { BrandingProfilesService } from 'app/core/branding/branding.service';
import { BrandingProfileDto, PAPER_FORMAT_LABELS } from 'app/core/branding/branding.types';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
    selector: 'app-outlet-form',
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule, RouterModule,
        MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule,
    ],
    template: `
<div class="flex flex-col flex-auto min-w-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 relative">
    <div class="absolute inset-0 opacity-5 dark:opacity-10"><div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, rgba(0,0,0,0.1) 1px, transparent 0); background-size: 20px 20px;"></div></div>
    <div class="relative z-10 flex flex-col flex-auto min-w-0">
        <div class="flex flex-col sm:flex-row space-y-16 sm:space-y-0 flex-0 sm:items-center sm:justify-between p-2 sm:py-3 sm:px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
            <div class="flex items-center space-x-4">
                <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg"><mat-icon class="text-white">{{ id ? 'edit' : 'storefront' }}</mat-icon></div>
                <div>
                    <h2 class="text-3xl font-bold tracking-tight leading-7 sm:leading-10 truncate bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">{{ id ? 'Edit Outlet' : 'New Outlet' }}</h2>
                    <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">{{ id ? 'Update outlet details' : 'Add a new outlet / branch' }}</p>
                </div>
            </div>
            <div class="flex flex-col w-full sm:w-auto sm:flex-row space-y-16 sm:space-y-0 flex-1 sm:flex-none sm:items-center sm:justify-end gap-4">
                <button mat-stroked-button class="h-12 px-6 rounded-lg" routerLink="/outlet"><mat-icon class="icon-size-5 mr-2">arrow_back</mat-icon><span>Cancel</span></button>
            </div>
        </div>
        <div class="flex-auto p-4 sm:p-6">
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <form [formGroup]="form" (ngSubmit)="save()" class="p-6 sm:p-8">

                    <div class="mb-6">
                        <div class="flex items-center space-x-3 mb-4">
                            <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center"><mat-icon class="text-blue-600 dark:text-blue-400 text-lg">store</mat-icon></div>
                            <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Basic Information</h3>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <mat-form-field class="w-full" appearance="outline"><mat-label>Code</mat-label><input matInput formControlName="code" placeholder="e.g. DHN-01"><mat-error *ngIf="form.get('code')?.hasError('required')">Code is required</mat-error></mat-form-field>
                            <mat-form-field class="w-full" appearance="outline"><mat-label>Name</mat-label><input matInput formControlName="name"><mat-error *ngIf="form.get('name')?.hasError('required')">Name is required</mat-error></mat-form-field>
                            <mat-form-field class="w-full" appearance="outline">
                                <mat-label>Type</mat-label>
                                <mat-select formControlName="type">
                                    <mat-option value="Retail">Retail</mat-option>
                                    <mat-option value="Warehouse">Warehouse</mat-option>
                                    <mat-option value="HQ">HQ</mat-option>
                                </mat-select>
                            </mat-form-field>
                            <mat-form-field *ngIf="!id" class="w-full" appearance="outline"><mat-label>Tenant ID</mat-label><input matInput formControlName="tenantId"></mat-form-field>
                        </div>
                    </div>

                    <div class="mb-6">
                        <div class="flex items-center space-x-3 mb-4">
                            <div class="w-8 h-8 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center"><mat-icon class="text-emerald-600 dark:text-emerald-400 text-lg">contact_mail</mat-icon></div>
                            <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Contact</h3>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <mat-form-field class="w-full" appearance="outline"><mat-label>Contact Email</mat-label><input matInput type="email" formControlName="contactEmail"></mat-form-field>
                            <mat-form-field class="w-full" appearance="outline"><mat-label>Contact Phone</mat-label><input matInput formControlName="contactPhone"></mat-form-field>
                        </div>
                    </div>

                    <div class="mb-6">
                        <div class="flex items-center space-x-3 mb-4">
                            <div class="w-8 h-8 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center"><mat-icon class="text-amber-600 dark:text-amber-400 text-lg">place</mat-icon></div>
                            <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Address</h3>
                        </div>
                        <div class="grid grid-cols-1 gap-4">
                            <mat-form-field class="w-full" appearance="outline"><mat-label>Address</mat-label><input matInput formControlName="addressLine"></mat-form-field>
                            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <mat-form-field class="w-full" appearance="outline"><mat-label>City</mat-label><input matInput formControlName="city"></mat-form-field>
                                <mat-form-field class="w-full" appearance="outline"><mat-label>State</mat-label><input matInput formControlName="state"></mat-form-field>
                                <mat-form-field class="w-full" appearance="outline"><mat-label>Country</mat-label><input matInput formControlName="country" placeholder="BD / IN / US"></mat-form-field>
                                <mat-form-field class="w-full" appearance="outline"><mat-label>Postal Code</mat-label><input matInput formControlName="postalCode"></mat-form-field>
                            </div>
                        </div>
                    </div>

                    @if (id) {
                        <div class="mb-6">
                            <div class="flex items-center space-x-3 mb-4">
                                <div class="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center"><mat-icon class="text-purple-600 dark:text-purple-400 text-lg">palette</mat-icon></div>
                                <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Branding</h3>
                            </div>
                            <p class="text-xs text-gray-500 mb-3">The logo and tax ID print on every receipt and invoice from this outlet.</p>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <mat-form-field class="w-full" appearance="outline"><mat-label>Tax / VAT / GST Number</mat-label><input matInput formControlName="taxId" placeholder="e.g. BIN 123-456-789"></mat-form-field>
                                <mat-form-field class="w-full" appearance="outline"><mat-label>Brand Color (hex)</mat-label><input matInput formControlName="primaryColor" placeholder="#4F46E5"></mat-form-field>
                            </div>
                            <mat-form-field class="w-full" appearance="outline">
                                <mat-label>Default branding profile</mat-label>
                                <mat-select formControlName="defaultBrandingProfileId">
                                    <mat-option [value]="null">— Use outlet branding fields above —</mat-option>
                                    @for (p of brandingProfiles(); track p.id) {
                                        <mat-option [value]="p.id">{{ p.name }} · {{ paperLabels[p.paperFormat] }}</mat-option>
                                    }
                                </mat-select>
                                <mat-hint>Drives the receipt look at this outlet. Per-sale override is still possible at POS.</mat-hint>
                            </mat-form-field>
                            <div class="mt-4 flex items-start gap-4">
                                <div class="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 flex items-center justify-center overflow-hidden">
                                    @if (logoPreview()) {
                                        <img [src]="logoPreview()" alt="Logo" class="max-w-full max-h-full object-contain">
                                    } @else {
                                        <mat-icon class="text-gray-300 icon-size-12">image</mat-icon>
                                    }
                                </div>
                                <div class="flex flex-col gap-2 flex-1">
                                    <input #fileInput type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" hidden (change)="onLogoPicked($event)">
                                    <button type="button" mat-stroked-button color="primary" (click)="fileInput.click()" [disabled]="logoUploading()">
                                        <mat-icon class="icon-size-5 mr-1">upload</mat-icon>
                                        <span>{{ logoUploading() ? 'Uploading…' : (hasLogo() ? 'Replace Logo' : 'Upload Logo') }}</span>
                                    </button>
                                    @if (hasLogo()) {
                                        <button type="button" mat-stroked-button color="warn" (click)="removeLogo()" [disabled]="logoUploading()">
                                            <mat-icon class="icon-size-5 mr-1">delete</mat-icon><span>Remove Logo</span>
                                        </button>
                                    }
                                    <p class="text-xs text-gray-500 mt-1">PNG / JPG / WebP / SVG · max 1 MB · square works best</p>
                                    @if (logoError()) {
                                        <p class="text-xs text-rose-600">{{ logoError() }}</p>
                                    }
                                </div>
                            </div>
                        </div>
                    }

                    <div class="flex items-center justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button mat-button type="button" routerLink="/outlet">Cancel</button>
                        <button mat-flat-button color="primary" type="submit" class="h-12 px-6 rounded-lg shadow-lg" [disabled]="form.invalid || saving"><mat-icon class="icon-size-5 mr-2">save</mat-icon><span>{{ saving ? 'Saving...' : 'Save' }}</span></button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
    `,
})
export class OutletFormComponent implements OnInit {
    private readonly api = inject(OutletsService);
    private readonly brandingApi = inject(BrandingProfilesService);
    private readonly fb = inject(FormBuilder);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly snack = inject(MatSnackBar);
    private readonly sanitizer = inject(DomSanitizer);

    id: string | null = null;
    saving = false;
    hasLogo = signal(false);
    logoPreview = signal<SafeUrl | null>(null);
    logoUploading = signal(false);
    logoError = signal<string | null>(null);
    brandingProfiles = signal<BrandingProfileDto[]>([]);
    paperLabels = PAPER_FORMAT_LABELS;
    form: FormGroup = this.fb.group({
        code: ['', Validators.required],
        name: ['', Validators.required],
        tenantId: [''],
        type: ['Retail' as OutletType, Validators.required],
        contactEmail: [''],
        contactPhone: [''],
        addressLine: [''],
        city: [''],
        state: [''],
        country: [''],
        postalCode: [''],
        primaryColor: [''],
        taxId: [''],
        defaultBrandingProfileId: [null as string | null],
    });

    ngOnInit(): void {
        this.id = this.route.snapshot.paramMap.get('id');
        // Profiles list populates the default-branding select for both create and edit.
        this.brandingApi.getAll().subscribe(rows => this.brandingProfiles.set((rows ?? []).filter(p => p.isActive)));
        if (this.id) {
            this.api.get(this.id).subscribe(o => {
                this.form.patchValue({
                    code: o.code, name: o.name, type: o.type,
                    contactEmail: o.contactEmail, contactPhone: o.contactPhone,
                    addressLine: o.addressLine, city: o.city, state: o.state,
                    country: o.country, postalCode: o.postalCode,
                    primaryColor: o.primaryColor, taxId: o.taxId,
                    defaultBrandingProfileId: o.defaultBrandingProfileId ?? null,
                });
                this.form.get('code')?.disable();
                this.form.get('tenantId')?.disable();
                this.hasLogo.set(!!o.hasLogo);
                if (o.hasLogo) this.refreshLogoPreview();
            });
        }
    }

    private refreshLogoPreview(): void {
        if (!this.id) return;
        const url = this.api.logoUrl(this.id);
        this.logoPreview.set(this.sanitizer.bypassSecurityTrustUrl(url));
    }

    onLogoPicked(event: Event): void {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        input.value = '';
        if (!file || !this.id) return;
        if (file.size > 1_048_576) {
            this.logoError.set('File too large. Max 1 MB.');
            return;
        }
        this.logoError.set(null);
        this.logoUploading.set(true);
        this.api.uploadLogo(this.id, file).subscribe({
            next: () => {
                this.logoUploading.set(false);
                this.hasLogo.set(true);
                this.refreshLogoPreview();
                this.snack.open('Logo uploaded', 'OK', { duration: 3000 });
            },
            error: err => {
                this.logoUploading.set(false);
                const msg = err?.error?.exception ?? err?.error ?? err?.message ?? 'Upload failed';
                this.logoError.set(typeof msg === 'string' ? msg : 'Upload failed');
            },
        });
    }

    removeLogo(): void {
        if (!this.id) return;
        this.api.deleteLogo(this.id).subscribe({
            next: () => {
                this.hasLogo.set(false);
                this.logoPreview.set(null);
                this.logoError.set(null);
                this.snack.open('Logo removed', 'OK', { duration: 3000 });
            },
            error: err => {
                const msg = err?.error?.exception ?? err?.error ?? err?.message ?? 'Delete failed';
                this.logoError.set(typeof msg === 'string' ? msg : 'Delete failed');
            },
        });
    }

    save(): void {
        if (this.form.invalid) return;
        this.saving = true;
        const v = this.form.getRawValue();
        const op$ = this.id
            ? this.api.update(this.id, { id: this.id, ...v })
            : this.api.create(v);
        op$.subscribe({
            next: () => { this.saving = false; this.router.navigate(['/outlet']); },
            error: () => { this.saving = false; },
        });
    }
}
