import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';
import { FuseAlertComponent } from '@fuse/components/alert';
import { FuseConfigService } from '@fuse/services/config';
import { TenantThemeService, ThemeConfig } from 'app/core/tenant/tenant-theme.service';
import { TenantService } from 'app/core/tenant/tenant.service';
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
export class TenantThemeSettingsComponent implements OnInit {
    selectedScheme: string = 'light';
    selectedTheme: string = 'theme-default';
    selectedLayout: string = 'classy';
    isSaving = false;
    showSuccess = false;

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
        private tenantService: TenantService,
        private fuseConfigService: FuseConfigService,
        private notificationService: NotificationService,
        private router: Router,
    ) {}

    ngOnInit(): void {
        const current = this.tenantThemeService.getCurrentTheme();
        this.selectedScheme = current.scheme;
        this.selectedTheme = current.theme;
        this.selectedLayout = current.layout;
    }

    selectScheme(scheme: string): void {
        this.selectedScheme = scheme;
        this.applyPreview();
    }

    selectTheme(theme: string): void {
        this.selectedTheme = theme;
        this.applyPreview();
    }

    selectLayout(layout: string): void {
        this.selectedLayout = layout;
        this.applyPreview();
    }

    save(): void {
        const tenantId = this.tenantService.resolve();
        if (!tenantId) return;

        this.isSaving = true;
        this.showSuccess = false;

        const config: ThemeConfig = {
            scheme: this.selectedScheme as any,
            theme: this.selectedTheme,
            layout: this.selectedLayout,
        };

        this.tenantThemeService.saveTheme(tenantId, config).subscribe({
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
        this.applyPreview();
    }

    private applyPreview(): void {
        this.fuseConfigService.config = {
            scheme: this.selectedScheme,
            theme: this.selectedTheme,
            layout: this.selectedLayout,
        };
    }
}
