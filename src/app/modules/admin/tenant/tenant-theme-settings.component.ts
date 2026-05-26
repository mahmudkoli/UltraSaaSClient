import { Component, OnInit, OnDestroy, ViewEncapsulation, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FuseAlertComponent } from '@fuse/components/alert';
import { FuseConfigService } from '@fuse/services/config';
import { take } from 'rxjs';
import { TenantThemeService, ThemeConfig } from 'app/core/tenant/tenant-theme.service';
import { NotificationService } from 'app/core/services/notification.service';
import { TenantInfoService } from 'app/core/auth/tenant-info.service';
import { PlansService } from 'app/core/billing/billing.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { environment } from 'environments/environment';
import { TranslocoModule } from '@ngneat/transloco';

@Component({
    selector: 'tenant-theme-settings',
    templateUrl: './tenant-theme-settings.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        RouterLink,
        FuseAlertComponent,
        TranslocoModule,
    ],
})
export class TenantThemeSettingsComponent implements OnInit, OnDestroy {
    tenantId: string = '';
    selectedScheme: string = 'light';
    selectedTheme: string = 'theme-default';
    selectedLayout: string = 'classy';
    isSaving = false;
    showSuccess = false;
    isPreviewing = false;

    private originalConfig: { scheme: string; theme: string; layout: string } | null = null;

    themes = [
        { id: 'theme-default', name: 'Default' },
        { id: 'theme-brand', name: 'Brand' },
        { id: 'theme-teal', name: 'Teal' },
        { id: 'theme-rose', name: 'Rose' },
        { id: 'theme-purple', name: 'Purple' },
        { id: 'theme-amber', name: 'Amber' },
    ];

    // Brand identity (Phase 2.20b — tenant fallback for outlets)
    hasLogo = false;
    logoPreview: SafeUrl | null = null;
    logoUploading = false;
    logoError: string | null = null;
    brandPrimaryColor = '';
    brandTaxId = '';
    brandingSaving = false;

    // Two-step upload (matches branding-profile-form). Picking a file fills
    // pendingFile + pendingPreview (blob URL); nothing hits the server until
    // the user clicks Upload. Lets them sanity-check the image before committing.
    pendingFile: File | null = null;
    pendingPreview: SafeUrl | null = null;
    private pendingObjectUrl: string | null = null;

    // CUSTOM_BRAND feature gate. The Color Theme / Color Scheme / Layout
    // sections are only meaningful when the target tenant's plan includes
    // CUSTOM_BRAND — the backend `PUT /tenants/{id}/theme` is gated by the
    // same feature, so without it Save would 403 anyway. Brand Identity
    // (logo / color / tax id) stays unconditional — it's baseline for VAT
    // receipts on every plan.
    hasCustomBrand = false;
    planName: string = '';
    planFeaturesLoaded = false;

    private readonly http = inject(HttpClient);
    private readonly sanitizer = inject(DomSanitizer);
    private readonly tenantInfo = inject(TenantInfoService);

    layouts = [
        { id: 'classic', name: 'Classic', icon: 'heroicons_outline:view-columns' },
        { id: 'classy', name: 'Classy', icon: 'heroicons_outline:squares-2x2' },
        { id: 'compact', name: 'Compact', icon: 'heroicons_outline:bars-3-bottom-left' },
        { id: 'dense', name: 'Dense', icon: 'heroicons_outline:bars-3' },
        { id: 'futuristic', name: 'Futuristic', icon: 'heroicons_outline:rocket-launch' },
        { id: 'thin', name: 'Thin', icon: 'heroicons_outline:bars-2' },
        { id: 'centered', name: 'Centered', icon: 'heroicons_outline:window' },
        { id: 'modern', name: 'Modern', icon: 'heroicons_outline:computer-desktop' },
    ];

    constructor(
        private tenantThemeService: TenantThemeService,
        private fuseConfigService: FuseConfigService,
        private notificationService: NotificationService,
        private router: Router,
        private route: ActivatedRoute,
        private plansService: PlansService,
    ) {}

    ngOnInit(): void {
        // Resuming after layout-triggered destroy/recreate?
        const ps = this.tenantThemeService.previewState;
        if (ps) {
            this.tenantId = ps.tenantId;
            this.originalConfig = ps.original;
            this.selectedScheme = ps.selected.scheme;
            this.selectedTheme = ps.selected.theme;
            this.selectedLayout = ps.selected.layout;
            this.isPreviewing = ps.isPreviewing;
            this.tenantThemeService.clearPreviewState();
            return;
        }

        // Normal init: snapshot current config
        this.fuseConfigService.config$.pipe(take(1)).subscribe(cfg => {
            this.originalConfig = {
                scheme: cfg?.scheme || 'light',
                theme: cfg?.theme || 'theme-default',
                layout: cfg?.layout || 'classy',
            };
        });

        this.tenantId = this.route.snapshot.paramMap.get('id') || '';
        if (!this.tenantId) {
            this.notificationService.error('No tenant ID provided');
            this.router.navigate(['/tenant']);
            return;
        }

        // Load saved theme for the target tenant
        this.tenantThemeService.fetchTheme(this.tenantId).subscribe(result => {
            if (result) {
                const config = typeof result === 'string' ? JSON.parse(result as string) : result;
                this.selectedScheme = config.scheme || 'light';
                this.selectedTheme = config.theme || 'theme-default';
                this.selectedLayout = config.layout || 'classy';
            }
        });

        // Load branding (logo + color + tax id) AND resolve the tenant's
        // plan to know whether CUSTOM_BRAND is in scope. Cascades plan lookup
        // off the tenant response.
        this.http.get<any>(`${environment.apiUrl}/api/tenants/${this.tenantId}`).subscribe({
            next: t => {
                this.brandPrimaryColor = t.brandPrimaryColor || '';
                this.brandTaxId = t.brandTaxId || '';
                this.resolvePlanFeatures(t.planId);
            },
            error: () => {
                this.planFeaturesLoaded = true;
            },
        });
        this.refreshLogoState();
    }

    private resolvePlanFeatures(planId: string | null | undefined): void {
        if (!planId) {
            this.planFeaturesLoaded = true;
            return;
        }
        this.plansService.get(planId).subscribe({
            next: plan => {
                this.planName = plan.name;
                try {
                    const flags = JSON.parse(plan.featureFlagsJson || '[]') as string[];
                    this.hasCustomBrand = Array.isArray(flags) && flags.includes('CUSTOM_BRAND');
                } catch {
                    this.hasCustomBrand = false;
                }
                this.planFeaturesLoaded = true;
            },
            error: () => {
                this.planFeaturesLoaded = true;
            },
        });
    }

    /**
     * Optimistically point the preview at the logo endpoint. The endpoint is
     * <c>[AllowAnonymous]</c> so the &lt;img&gt; loads it directly without a bearer
     * token. If the tenant has no logo (or any other 404 happens), the
     * <c>(error)</c> handler on the &lt;img&gt; clears the preview back to the
     * placeholder icon. Avoids a separate HEAD probe round-trip — Phase 2.56c
     * fix for the "logo doesn't load on refresh" bug, where HEAD could fail
     * silently while a direct GET worked.
     */
    private refreshLogoState(): void {
        if (!this.tenantId) return;
        const url = `${environment.apiUrl}/api/tenants/${this.tenantId}/logo?v=${Date.now()}`;
        this.hasLogo = true; // Optimistic — flipped to false by onLogoLoadError if 404.
        this.logoPreview = this.sanitizer.bypassSecurityTrustUrl(url);
    }

    /** Called by the saved-logo &lt;img&gt;'s (error) — means the tenant has no logo. */
    onLogoLoadError(): void {
        this.hasLogo = false;
        this.logoPreview = null;
    }

    onLogoPicked(event: Event): void {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        input.value = '';
        if (!file || !this.tenantId) return;
        if (file.size > 1_048_576) {
            this.logoError = 'File too large. Max 1 MB.';
            return;
        }
        this.logoError = null;
        this.setPendingFile(file);
    }

    confirmUpload(): void {
        const file = this.pendingFile;
        if (!file || !this.tenantId) return;
        this.logoError = null;
        this.logoUploading = true;
        const fd = new FormData();
        fd.append('file', file, file.name);
        this.http.put(`${environment.apiUrl}/api/tenants/${this.tenantId}/logo`, fd, { responseType: 'text' }).subscribe({
            next: () => {
                this.logoUploading = false;
                this.clearPendingFile();
                // Set the saved-logo preview optimistically with a fresh
                // cache-buster — we KNOW the PUT succeeded, no need for a
                // separate HEAD round-trip that can race with the storage
                // commit or the browser's image cache.
                this.hasLogo = true;
                this.logoPreview = this.sanitizer.bypassSecurityTrustUrl(
                    `${environment.apiUrl}/api/tenants/${this.tenantId}/logo?v=${Date.now()}`,
                );
                // If the editor is editing their OWN tenant, push the new logo
                // into TenantInfoService so the live sidebar/topbar reload it
                // in-place instead of waiting for a page refresh.
                if (this.tenantInfo.info()?.id === this.tenantId) {
                    this.tenantInfo.notifyLogoChanged(true);
                }
                this.notificationService.success('Logo uploaded');
            },
            error: err => {
                this.logoUploading = false;
                this.logoError = err?.error?.exception ?? err?.error ?? err?.message ?? 'Upload failed';
                // Keep pending state so the user can retry or cancel without re-picking the file.
            },
        });
    }

    cancelPendingUpload(): void {
        this.clearPendingFile();
        this.logoError = null;
    }

    formatFileSize(bytes: number): string {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
    }

    private setPendingFile(file: File): void {
        this.clearPendingFile();
        this.pendingObjectUrl = URL.createObjectURL(file);
        this.pendingFile = file;
        this.pendingPreview = this.sanitizer.bypassSecurityTrustUrl(this.pendingObjectUrl);
    }

    private clearPendingFile(): void {
        if (this.pendingObjectUrl) {
            URL.revokeObjectURL(this.pendingObjectUrl);
            this.pendingObjectUrl = null;
        }
        this.pendingFile = null;
        this.pendingPreview = null;
    }

    removeLogo(): void {
        this.http.delete(`${environment.apiUrl}/api/tenants/${this.tenantId}/logo`, { responseType: 'text' }).subscribe({
            next: () => {
                this.hasLogo = false;
                this.logoPreview = null;
                if (this.tenantInfo.info()?.id === this.tenantId) {
                    this.tenantInfo.notifyLogoChanged(false);
                }
                this.notificationService.success('Logo removed');
            },
            error: err => {
                this.logoError = err?.error?.exception ?? err?.error ?? err?.message ?? 'Delete failed';
            },
        });
    }

    saveBranding(): void {
        this.brandingSaving = true;
        this.http.put(`${environment.apiUrl}/api/tenants/${this.tenantId}/branding`, {
            primaryColor: this.brandPrimaryColor || null,
            taxId: this.brandTaxId || null,
        }, { responseType: 'text' }).subscribe({
            next: () => {
                this.brandingSaving = false;
                this.notificationService.success('Branding saved');
            },
            error: () => {
                this.brandingSaving = false;
                this.notificationService.error('Could not save branding');
            },
        });
    }

    ngOnDestroy(): void {
        // Release any blob URL we created for a pending upload preview so the
        // browser can GC the bytes.
        this.clearPendingFile();

        // If service holds state, a layout switch is in progress — don't restore
        if (this.tenantThemeService.previewState) {
            return;
        }
        // Actually leaving the page — restore original
        if (this.originalConfig) {
            this.fuseConfigService.config = {
                scheme: this.originalConfig.scheme,
                theme: this.originalConfig.theme,
                layout: this.originalConfig.layout,
            };
        }
    }

    selectScheme(scheme: string): void {
        this.selectedScheme = scheme;
    }

    selectTheme(theme: string): void {
        this.selectedTheme = theme;
    }

    selectLayout(layout: string): void {
        this.selectedLayout = layout;
    }

    preview(): void {
        this.isPreviewing = true;
        // Persist state so it survives the layout-triggered component recreate
        this.tenantThemeService.setPreviewState(
            this.tenantId,
            { scheme: this.selectedScheme as any, theme: this.selectedTheme, layout: this.selectedLayout },
            this.originalConfig!,
            true,
        );
        this.fuseConfigService.config = {
            scheme: this.selectedScheme,
            theme: this.selectedTheme,
            layout: this.selectedLayout,
        };
    }

    backToCurrent(): void {
        this.isPreviewing = false;
        // Persist selections (not previewing) so they survive the layout restore recreate
        this.tenantThemeService.setPreviewState(
            this.tenantId,
            { scheme: this.selectedScheme as any, theme: this.selectedTheme, layout: this.selectedLayout },
            this.originalConfig!,
            false,
        );
        this.fuseConfigService.config = {
            scheme: this.originalConfig!.scheme,
            theme: this.originalConfig!.theme,
            layout: this.originalConfig!.layout,
        };
    }

    save(): void {
        if (!this.tenantId) return;

        this.isSaving = true;
        this.showSuccess = false;
        this.tenantThemeService.clearPreviewState();

        const config: ThemeConfig = {
            scheme: this.selectedScheme as any,
            theme: this.selectedTheme,
            layout: this.selectedLayout,
        };

        this.tenantThemeService.saveTheme(this.tenantId, config).subscribe({
            next: () => {
                this.isSaving = false;
                // Apply to the live Fuse config so the rest of the app picks
                // up the new theme without a refresh, and clear originalConfig
                // so ngOnDestroy doesn't revert it on the navigate-away below.
                this.tenantThemeService.applyTheme(config);
                this.originalConfig = null;
                this.notificationService.success('Theme settings saved successfully');
                this.router.navigate(['/tenant']);
            },
            error: (err) => {
                this.isSaving = false;
                this.notificationService.error(err?.message || 'Failed to save theme settings');
            }
        });
    }

    resetToDefault(): void {
        this.selectedScheme = 'light';
        this.selectedTheme = 'theme-default';
        this.selectedLayout = 'classy';
        if (this.isPreviewing) {
            this.backToCurrent();
        }
    }
}
