import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FuseAlertComponent } from '@fuse/components/alert';
import { FuseConfigService } from '@fuse/services/config';
import { take } from 'rxjs';
import { TenantThemeService, ThemeConfig } from 'app/core/tenant/tenant-theme.service';
import { NotificationService } from 'app/core/services/notification.service';

@Component({
    selector: 'tenant-theme-settings',
    templateUrl: './tenant-theme-settings.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        CommonModule,
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
