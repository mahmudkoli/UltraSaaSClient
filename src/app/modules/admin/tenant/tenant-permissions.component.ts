import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { TranslocoModule } from '@ngneat/transloco';
import { TenantWithPermissionsDto, UpdateTenantPermissionsRequest, PermissionDto } from '../../../core/tenants/tenants.types';
import { TenantsService } from '../../../core/tenants/tenants.service';

@Component({
    selector: 'tenant-permissions',
    templateUrl: './tenant-permissions.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatCardModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        MatProgressBarModule,
        MatProgressSpinnerModule,
        MatSlideToggleModule,
        MatTooltipModule,
        TranslocoModule,
    ],
})
export class TenantPermissionsComponent implements OnInit {
    tenant: TenantWithPermissionsDto | null = null;
    tenantId: string | null = null;
    loading: boolean = false;
    saving: boolean = false;

    // Permissions loaded from backend
    availablePermissions: PermissionDto[] = [];
    selectedPermissions: Set<string> = new Set();

    /**
     * Count of selected permissions that are within the managed (available) set.
     * The raw selectedPermissions set can contain claims outside this page's scope
     * — e.g. the root tenant holds root-only permissions that aren't in the admin
     * permission registry rendered here — which made the old `available - selected`
     * math go negative (Selected 185 > Total 168). Counting the intersection keeps
     * Selected + Available = Total by construction.
     */
    get selectedCount(): number {
        return this.availablePermissions.filter(p => this.selectedPermissions.has(p.name)).length;
    }

    get availableRemaining(): number {
        return Math.max(0, this.availablePermissions.length - this.selectedCount);
    }

    constructor(
        private _tenantsService: TenantsService,
        private _router: Router,
        private _route: ActivatedRoute,
        private _fuseConfirmationService: FuseConfirmationService
    ) {}

    ngOnInit(): void {
        this.tenantId = this._route.snapshot.paramMap.get('id');

        if (this.tenantId) {
            this.loadAvailablePermissions();
            this.loadTenantWithPermissions();
        }
    }

    loadAvailablePermissions(): void {
        this._tenantsService.getAvailablePermissions().subscribe({
            next: (permissions) => {
                this.availablePermissions = permissions;
            },
            error: (error) => {
                console.error('Error loading available permissions:', error);
            }
        });
    }

    loadTenantWithPermissions(): void {
        if (!this.tenantId) return;

        this.loading = true;
        this._tenantsService.getWithPermissions(this.tenantId).subscribe({
            next: (tenant) => {
                this.tenant = tenant;
                this.selectedPermissions = new Set(tenant.permissions || []);
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading tenant permissions:', error);
                this.loading = false;
            }
        });
    }

    togglePermission(permissionName: string): void {
        if (this.selectedPermissions.has(permissionName)) {
            this.selectedPermissions.delete(permissionName);
        } else {
            this.selectedPermissions.add(permissionName);
        }
    }

    isPermissionSelected(permission: string): boolean {
        return this.selectedPermissions.has(permission);
    }

    savePermissions(): void {
        if (!this.tenantId) return;

        this.saving = true;
        const request: UpdateTenantPermissionsRequest = {
            tenantId: this.tenantId,
            permissions: Array.from(this.selectedPermissions)
        };

        this._tenantsService.updatePermissions(this.tenantId, request).subscribe({
            next: () => {
                this._fuseConfirmationService.open({
                    title: 'Success',
                    message: 'Tenant permissions updated successfully!',
                    actions: {
                        confirm: {
                            label: 'OK'
                        }
                    }
                                    }).afterClosed().subscribe(() => {
                        this._router.navigate(['/tenant']);
                    });
            },
            error: (error) => {
                console.error('Error updating tenant permissions:', error);
                this._fuseConfirmationService.open({
                    title: 'Error',
                    message: 'Failed to update tenant permissions. Please try again.',
                    actions: {
                        confirm: {
                            label: 'OK'
                        }
                    }
                });
                this.saving = false;
            }
        });
    }

    cancel(): void {
        this._router.navigate(['/tenant']);
    }

    selectAll(): void {
        this.availablePermissions.forEach(permission => {
            this.selectedPermissions.add(permission.name);
        });
    }

    deselectAll(): void {
        this.selectedPermissions.clear();
    }

    getPermissionCategory(permission: PermissionDto): string {
        return permission.category;
    }

    getPermissionDescription(permission: PermissionDto): string {
        return permission.description;
    }

    getUniqueCategories(): string[] {
        const categories = this.availablePermissions.map(p => p.category);
        return [...new Set(categories)];
    }

    getPermissionsByCategory(category: string): PermissionDto[] {
        return this.availablePermissions.filter(p => p.category === category);
    }

    getPermissionRiskLevel(permission: PermissionDto): 'low' | 'medium' | 'high' {
        return permission.riskLevel;
    }

    selectCategoryPermissions(category: string): void {
        const categoryPermissions = this.getPermissionsByCategory(category);
        categoryPermissions.forEach(permission => {
            this.selectedPermissions.add(permission.name);
        });
    }

    deselectCategoryPermissions(category: string): void {
        const categoryPermissions = this.getPermissionsByCategory(category);
        categoryPermissions.forEach(permission => {
            this.selectedPermissions.delete(permission.name);
        });
    }

    selectDefaultPermissions(): void {
        // Add default/safe permissions for a typical tenant (View permissions)
        this.availablePermissions
            .filter(p => p.action === 'View' || p.action === 'Search')
            .forEach(permission => {
                this.selectedPermissions.add(permission.name);
            });
    }

    searchTerm: string = '';

    getFilteredPermissions(): PermissionDto[] {
        if (!this.searchTerm || this.searchTerm.trim().length === 0) {
            return this.availablePermissions;
        }

        const searchLower = this.searchTerm.toLowerCase().trim();
        return this.availablePermissions.filter(permission => {
            const category = permission.category.toLowerCase();
            const description = permission.description.toLowerCase();
            const permissionName = permission.name.toLowerCase();
            const action = permission.action.toLowerCase();
            const resource = permission.resource.toLowerCase();

            return permissionName.includes(searchLower) ||
                   description.includes(searchLower) ||
                   category.includes(searchLower) ||
                   action.includes(searchLower) ||
                   resource.includes(searchLower);
        });
    }

    getFilteredUniqueCategories(): string[] {
        const filteredPermissions = this.getFilteredPermissions();
        const categories = filteredPermissions.map(p => p.category);
        return [...new Set(categories)];
    }

    getFilteredPermissionsByCategory(category: string): PermissionDto[] {
        const filteredPermissions = this.getFilteredPermissions();
        return filteredPermissions.filter(p => p.category === category);
    }
} 