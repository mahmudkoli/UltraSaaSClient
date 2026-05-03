import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { BrandingProfilesService } from 'app/core/branding/branding.service';
import { PAPER_FORMAT_LABELS, PaperFormat } from 'app/core/branding/branding.types';

@Component({
    selector: 'app-branding-profile-form',
    standalone: true,
    imports: [
        CommonModule, FormsModule, ReactiveFormsModule, RouterModule,
        MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule,
        MatSelectModule, MatSlideToggleModule, MatSnackBarModule,
    ],
    template: `
<div class="flex flex-col flex-auto min-w-0 bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30 dark:from-gray-900 dark:via-indigo-900/20 dark:to-purple-900/20">
    <div class="flex items-center justify-between p-3 sm:py-3 sm:px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <div class="flex items-center gap-3">
            <button mat-icon-button routerLink="/branding-profiles" matTooltip="Back"><mat-icon>arrow_back</mat-icon></button>
            <div>
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">{{ id ? 'Edit Profile' : 'New Branding Profile' }}</h2>
                <p class="text-xs text-gray-500">Bundle a logo, color, tax id and paper format. Outlets pick a default.</p>
            </div>
        </div>
    </div>

    <div class="flex-auto p-4 sm:p-6">
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 max-w-4xl mx-auto">
            <form [formGroup]="form" (ngSubmit)="save()" class="p-6 space-y-6">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <mat-form-field class="w-full" appearance="outline">
                        <mat-label>Profile name</mat-label>
                        <input matInput formControlName="name" placeholder="e.g. Walk-in Receipt / B2B Invoice" maxlength="100">
                    </mat-form-field>
                    <mat-form-field class="w-full" appearance="outline">
                        <mat-label>Paper format</mat-label>
                        <mat-select formControlName="paperFormat">
                            @for (f of paperFormats; track f) {
                                <mat-option [value]="f">{{ paperLabels[f] }}</mat-option>
                            }
                        </mat-select>
                    </mat-form-field>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <mat-form-field class="w-full" appearance="outline">
                        <mat-label>Tax / VAT / GST Number</mat-label>
                        <input matInput formControlName="taxId" placeholder="e.g. BIN 123-456-789" maxlength="64">
                    </mat-form-field>
                    <mat-form-field class="w-full" appearance="outline">
                        <mat-label>Brand Color (hex)</mat-label>
                        <input matInput formControlName="primaryColor" placeholder="#4F46E5" maxlength="20">
                    </mat-form-field>
                </div>

                <mat-form-field class="w-full" appearance="outline">
                    <mat-label>Header text (printed above items)</mat-label>
                    <input matInput formControlName="headerText" placeholder="e.g. Welcome to Electroplus — open Mon–Sat 9am–9pm" maxlength="500">
                </mat-form-field>
                <mat-form-field class="w-full" appearance="outline">
                    <mat-label>Footer text (printed below totals)</mat-label>
                    <input matInput formControlName="footerText" placeholder="e.g. Returns within 7 days. Thank you!" maxlength="500">
                </mat-form-field>

                @if (id) {
                    <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <div class="flex items-center justify-between">
                            <div>
                                <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Active</h3>
                                <p class="text-xs text-gray-500">Inactive profiles stay assignable to historical sales but disappear from the picker.</p>
                            </div>
                            <mat-slide-toggle formControlName="isActive"></mat-slide-toggle>
                        </div>
                    </div>
                }

                @if (id) {
                    <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-3">Logo</h3>
                        <div class="flex items-start gap-4">
                            <div class="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 flex items-center justify-center overflow-hidden">
                                @if (logoPreview()) {
                                    <img [src]="logoPreview()" alt="Logo" class="max-w-full max-h-full object-contain">
                                } @else {
                                    <mat-icon class="text-gray-300 icon-size-12">image</mat-icon>
                                }
                            </div>
                            <div class="flex flex-col gap-2 flex-1">
                                <input #fileInput type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif" hidden (change)="onLogoPicked($event)">
                                <button type="button" mat-stroked-button color="primary" (click)="fileInput.click()" [disabled]="logoUploading()">
                                    <mat-icon class="icon-size-5 mr-1">upload</mat-icon>
                                    <span>{{ logoUploading() ? 'Uploading…' : (hasLogo() ? 'Replace Logo' : 'Upload Logo') }}</span>
                                </button>
                                @if (hasLogo()) {
                                    <button type="button" mat-stroked-button color="warn" (click)="removeLogo()" [disabled]="logoUploading()">
                                        <mat-icon class="icon-size-5 mr-1">delete</mat-icon><span>Remove Logo</span>
                                    </button>
                                }
                                <p class="text-xs text-gray-500 mt-1">PNG / JPG / WebP / SVG / GIF · max 1 MB</p>
                                @if (logoError()) {
                                    <p class="text-xs text-rose-600">{{ logoError() }}</p>
                                }
                            </div>
                        </div>
                    </div>
                }

                <div class="flex items-center justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button mat-button type="button" routerLink="/branding-profiles">Cancel</button>
                    <button mat-flat-button color="primary" type="submit" class="h-12 px-6 rounded-lg shadow-lg" [disabled]="form.invalid || saving"><mat-icon class="icon-size-5 mr-2">save</mat-icon><span>{{ saving ? 'Saving…' : 'Save' }}</span></button>
                </div>
            </form>
        </div>
    </div>
</div>
    `,
})
export class BrandingProfileFormComponent implements OnInit {
    private readonly api = inject(BrandingProfilesService);
    private readonly fb = inject(FormBuilder);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly snack = inject(MatSnackBar);
    private readonly sanitizer = inject(DomSanitizer);

    id: string | null = null;
    saving = false;
    paperFormats: PaperFormat[] = ['Thermal80mm', 'Thermal58mm', 'A4'];
    paperLabels = PAPER_FORMAT_LABELS;

    hasLogo = signal(false);
    logoPreview = signal<SafeUrl | null>(null);
    logoUploading = signal(false);
    logoError = signal<string | null>(null);

    form: FormGroup = this.fb.group({
        name: ['', [Validators.required, Validators.maxLength(100)]],
        paperFormat: ['Thermal80mm' as PaperFormat, Validators.required],
        primaryColor: [''],
        taxId: [''],
        headerText: [''],
        footerText: [''],
        isActive: [true],
    });

    ngOnInit(): void {
        this.id = this.route.snapshot.paramMap.get('id');
        if (this.id) {
            this.api.get(this.id).subscribe(p => {
                this.form.patchValue({
                    name: p.name,
                    paperFormat: p.paperFormat,
                    primaryColor: p.primaryColor ?? '',
                    taxId: p.taxId ?? '',
                    headerText: p.headerText ?? '',
                    footerText: p.footerText ?? '',
                    isActive: p.isActive,
                });
                this.hasLogo.set(p.hasLogo);
                if (p.hasLogo) this.refreshLogoPreview();
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
        const v = this.form.getRawValue();
        const body = {
            name: v.name,
            paperFormat: v.paperFormat,
            primaryColor: v.primaryColor || undefined,
            taxId: v.taxId || undefined,
            headerText: v.headerText || undefined,
            footerText: v.footerText || undefined,
        };
        this.saving = true;
        const obs = this.id
            ? this.api.update(this.id, { id: this.id, ...body, isActive: v.isActive })
            : this.api.create(body);
        obs.subscribe({
            next: res => {
                this.saving = false;
                this.snack.open('Saved', 'OK', { duration: 2500 });
                if (!this.id) {
                    // Create returns the new id; route into edit so logo upload becomes available.
                    const newId = (typeof res === 'string' ? res : (res as any)) ?? '';
                    this.router.navigate(['/branding-profiles', newId]);
                } else {
                    this.router.navigate(['/branding-profiles']);
                }
            },
            error: err => {
                this.saving = false;
                const msg = err?.error?.exception ?? err?.error ?? err?.message ?? 'Save failed';
                this.snack.open(typeof msg === 'string' ? msg : 'Save failed', 'OK', { duration: 5000 });
            },
        });
    }
}
