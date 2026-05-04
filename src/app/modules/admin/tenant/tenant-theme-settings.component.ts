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
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { environment } from 'environments/environment';

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

    private readonly http = inject(HttpClient);
    private readonly sanitizer = inject(DomSanitizer);

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
            console.log('[ThemeSettings] fetchTheme result:', result);
            if (result) {
                const config = typeof result === 'string' ? JSON.parse(result as string) : result;
                this.selectedScheme = config.scheme || 'light';
                this.selectedTheme = config.theme || 'theme-default';
                this.selectedLayout = config.layout || 'classy';
            }
        });

        // Load branding (logo + color + tax id)
        this.http.get<any>(`${environment.apiUrl}/api/tenants/${this.tenantId}`).subscribe({
            next: t => {
                this.brandPrimaryColor = t.brandPrimaryColor || '';
                this.brandTaxId = t.brandTaxId || '';
            },
        });
        this.refreshLogoState();
    }

    private refreshLogoState(): void {
        const url = `${environment.apiUrl}/api/tenants/${this.tenantId}/logo`;
        this.http.head(url, { observe: 'response' }).subscribe({
            next: () => {
                this.hasLogo = true;
                this.logoPreview = this.sanitizer.bypassSecurityTrustUrl(`${url}?v=${Date.now()}`);
            },
            error: () => {
                this.hasLogo = false;
                this.logoPreview = null;
            },
        });
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
        this.logoUploading = true;
        const fd = new FormData();
        fd.append('file', file, file.name);
        this.http.put(`${environment.apiUrl}/api/tenants/${this.tenantId}/logo`, fd, { responseType: 'text' }).subscribe({
            next: () => {
                this.logoUploading = false;
                this.refreshLogoState();
                this.notificationService.success('Logo uploaded');
            },
            error: err => {
                this.logoUploading = false;
                this.logoError = err?.error?.exception ?? err?.error ?? err?.message ?? 'Upload failed';
            },
        });
    }

    removeLogo(): void {
        this.http.delete(`${environment.apiUrl}/api/tenants/${this.tenantId}/logo`, { responseType: 'text' }).subscribe({
            next: () => {
                this.hasLogo = false;
                this.logoPreview = null;
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
