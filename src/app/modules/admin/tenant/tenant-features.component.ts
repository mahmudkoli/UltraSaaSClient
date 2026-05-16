import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { TranslocoModule } from '@ngneat/transloco';
import { TenantDto } from '../../../core/tenants/tenants.types';
import { TenantsService } from '../../../core/tenants/tenants.service';
import {
    TenantFeatureManagementDto,
    FeatureWithStatusDto,
} from '../../../core/features/features.types';
import { FeaturesService } from '../../../core/features/features.service';

@Component({
    selector: 'tenant-features',
    templateUrl: './tenant-features.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatCardModule,
        MatCheckboxModule,
        MatChipsModule,
        MatDividerModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        MatMenuModule,
        MatProgressBarModule,
        MatProgressSpinnerModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatTabsModule,
        MatTooltipModule,
        TranslocoModule,
    ],
})
export class TenantFeaturesComponent implements OnInit {
    tenant: TenantDto | null = null;
    tenantFeatureManagement: TenantFeatureManagementDto | null = null;
    loading: boolean = false;
    saving: boolean = false;
    searchTerm: string = '';
    selectedFeatures: Set<string> = new Set();

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _tenantsService: TenantsService,
        private _featuresService: FeaturesService,
        private _fuseConfirmationService: FuseConfirmationService
    ) {}

    ngOnInit(): void {
        const tenantId = this._route.snapshot.paramMap.get('id');

        if (tenantId) {
            this.loadTenant(tenantId);
            this.loadTenantFeatures(tenantId);
        }
    }

    loadTenant(tenantId: string): void {
        this._tenantsService.getById(tenantId).subscribe({
            next: (tenant) => {
                this.tenant = tenant;
            },
            error: (error) => {
                console.error('Error loading tenant:', error);
            }
        });
    }

    loadTenantFeatures(tenantId: string): void {
        this.loading = true;
        this._featuresService.getTenantFeatureManagement(tenantId).subscribe({
            next: (data) => {
                this.tenantFeatureManagement = data;
                // Initialize selected features
                this.selectedFeatures = new Set(
                    data.features.filter(f => f.isEnabled).map(f => f.id)
                );
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading tenant features:', error);
                this.loading = false;
            }
        });
    }

    toggleFeature(featureId: string): void {
        if (this.selectedFeatures.has(featureId)) {
            this.selectedFeatures.delete(featureId);
        } else {
            this.selectedFeatures.add(featureId);
        }
    }

    isFeatureSelected(featureId: string): boolean {
        return this.selectedFeatures.has(featureId);
    }

    cancel(): void {
        this._router.navigate(['/tenant']);
    }

    getFilteredFeatures(): FeatureWithStatusDto[] {
        if (!this.tenantFeatureManagement) return [];

        let features = this.tenantFeatureManagement.features;

        // Apply search filter
        if (this.searchTerm && this.searchTerm.trim().length > 0) {
            const searchLower = this.searchTerm.toLowerCase().trim();
            features = features.filter(feature =>
                feature.name.toLowerCase().includes(searchLower) ||
                feature.description.toLowerCase().includes(searchLower) ||
                feature.code.toLowerCase().includes(searchLower) ||
                (feature.category && feature.category.toLowerCase().includes(searchLower))
            );
        }

        return features;
    }

    getUniqueCategories(): string[] {
        if (!this.tenantFeatureManagement) return [];

        const categories = this.tenantFeatureManagement.features
            .map(f => f.category || 'Uncategorized')
            .filter((value, index, self) => self.indexOf(value) === index);

        return categories.sort();
    }

    getFilteredUniqueCategories(): string[] {
        const filteredFeatures = this.getFilteredFeatures();
        const categories = filteredFeatures
            .map(f => f.category || 'Uncategorized')
            .filter((value, index, self) => self.indexOf(value) === index);

        return categories.sort();
    }

    getFilteredFeaturesByCategory(category: string): FeatureWithStatusDto[] {
        return this.getFilteredFeatures().filter(f =>
            (f.category || 'Uncategorized') === category
        );
    }

    selectCategoryFeatures(category: string): void {
        const categoryFeatures = this.getFilteredFeaturesByCategory(category);
        categoryFeatures
            .filter(f => f.isActive)
            .forEach(feature => {
                this.selectedFeatures.add(feature.id);
            });
    }

    deselectCategoryFeatures(category: string): void {
        const categoryFeatures = this.getFilteredFeaturesByCategory(category);
        categoryFeatures.forEach(feature => {
            this.selectedFeatures.delete(feature.id);
        });
    }

    getFeatureIcon(feature: FeatureWithStatusDto): string {
        // Map feature categories or codes to icons
        const categoryIcons: { [key: string]: string } = {
            'Academic': 'school',
            'Administrative': 'business',
            'Communication': 'message',
            'Analytics': 'analytics',
            'Technology': 'devices',
            'Finance': 'attach_money',
            'Library': 'library_books',
            'Transport': 'directions_bus',
            'Hostel': 'hotel',
            'Events': 'event',
            'Uncategorized': 'extension'
        };

        return categoryIcons[feature.category || 'Uncategorized'] || 'extension';
    }

    getFeatureStatus(feature: FeatureWithStatusDto): 'enabled' | 'disabled' | 'inactive' {
        if (!feature.isActive) return 'inactive';
        return feature.isEnabled ? 'enabled' : 'disabled';
    }

    getFeatureStatusText(feature: FeatureWithStatusDto): string {
        const status = this.getFeatureStatus(feature);
        switch (status) {
            case 'enabled': return 'Currently Enabled';
            case 'disabled': return 'Currently Disabled';
            case 'inactive': return 'Feature Inactive';
        }
    }

    getFeatureStatusColor(feature: FeatureWithStatusDto): string {
        const status = this.getFeatureStatus(feature);
        switch (status) {
            case 'enabled': return 'text-green-600';
            case 'disabled': return 'text-gray-500';
            case 'inactive': return 'text-red-600';
        }
    }

    formatDate(dateString?: string): string {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    }

    get enabledFeaturesCount(): number {
        return Array.from(this.selectedFeatures).length;
    }

    get availableFeaturesCount(): number {
        return this.tenantFeatureManagement?.features.filter(f => f.isActive).length || 0;
    }

    get totalFeaturesCount(): number {
        return this.tenantFeatureManagement?.features.length || 0;
    }
}