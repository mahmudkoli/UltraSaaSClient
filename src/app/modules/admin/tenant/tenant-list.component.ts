import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { FuseNavigationService } from '@fuse/components/navigation';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { TranslocoModule } from '@ngneat/transloco';
import { NgApexchartsModule } from 'ng-apexcharts';
import { TenantDto } from '../../../core/tenants/tenants.types';
import { TenantsService } from '../../../core/tenants/tenants.service';

@Component({
    selector: 'tenant-list',
    templateUrl: './tenant-list.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatCardModule,
        MatCheckboxModule,
        MatDialogModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatPaginatorModule,
        MatProgressBarModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatSortModule,
        MatTableModule,
        MatTabsModule,
        MatTooltipModule,
        MatMenuModule,
        NgApexchartsModule,
        TranslocoModule,
    ],
})
export class TenantListComponent implements OnInit {
    tenants: TenantDto[] = [];
    loading: boolean = false;
    displayedColumns: string[] = ['name', 'adminEmail', 'url', 'isActive', 'validUpto', 'actions'];

    dataSource: MatTableDataSource<TenantDto> = new MatTableDataSource<TenantDto>([]);
    searchControl = new FormControl<string>('');
    statusControl = new FormControl<'all' | 'active' | 'inactive'>('all');

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    get rangeStart(): number {
        const count = this.totalCount;
        if (!this.paginator || count === 0) return 0;
        return (this.paginator.pageIndex * this.paginator.pageSize) + 1;
    }

    get rangeEnd(): number {
        const count = this.totalCount;
        if (!this.paginator) return count;
        const end = (this.paginator.pageIndex + 1) * this.paginator.pageSize;
        return end > count ? count : end;
    }

    get totalCount(): number {
        return this.dataSource?.data?.length ?? 0;
    }

    constructor(
        private _tenantsService: TenantsService,
        private _router: Router,
        private _fuseConfirmationService: FuseConfirmationService
    ) {}

    ngOnInit(): void {
        this.initFilters();
        this.loadTenants();
    }

    private initFilters(): void {
        this.dataSource.filterPredicate = (data: TenantDto, filter: string) => {
            const parsed = JSON.parse(filter) as { term: string; status: 'all' | 'active' | 'inactive' };
            const term = (parsed.term || '').toLowerCase().trim();
            const matchesTerm = !term || (
                data.name?.toLowerCase().includes(term) ||
                data.id?.toLowerCase().includes(term) ||
                data.adminEmail?.toLowerCase().includes(term) ||
                data.url?.toLowerCase().includes(term)
            );
            const matchesStatus = parsed.status === 'all' || (parsed.status === 'active' ? data.isActive : !data.isActive);
            return matchesTerm && matchesStatus;
        };

        const applyFilter = () => {
            const filter = {
                term: this.searchControl.value ?? '',
                status: this.statusControl.value ?? 'all'
            };
            this.dataSource.filter = JSON.stringify(filter);
            if (this.dataSource.paginator) {
                this.dataSource.paginator.firstPage();
            }
        };

        this.searchControl.valueChanges.subscribe(() => applyFilter());
        this.statusControl.valueChanges.subscribe(() => applyFilter());
    }

    ngAfterViewInit(): void {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }

    loadTenants(): void {
        this.loading = true;
        this._tenantsService.getAll().subscribe({
            next: (tenants) => {
                this.tenants = tenants;
                this.dataSource.data = tenants;
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading tenants:', error);
                this.loading = false;
                this._fuseConfirmationService.open({
                    title: 'Error',
                    message: 'Failed to load tenants. Please refresh the page.',
                    actions: {
                        confirm: {
                            label: 'OK'
                        }
                    }
                });
            }
        });
    }

    createTenant(): void {
        console.log('Creating tenant...');
        this._router.navigate(['/tenant/create']);
    }

    createTenantWithInstitute(): void {
        console.log('Creating tenant with institute...');
        this._router.navigate(['/tenant/create-with-institute']);
    }

    editTenant(tenant: TenantDto): void {
        console.log('Editing tenant:', tenant.id);
        this._router.navigate([`/tenant/${tenant.id}/edit`]);
    }

    managePermissions(tenant: TenantDto): void {
        this._router.navigate([`/tenant/${tenant.id}/permissions`]);
    }

    manageFeatures(tenant: TenantDto): void {
        this._router.navigate([`/tenant/${tenant.id}/features`]);
    }

    activateTenant(tenant: TenantDto): void {
        const confirmation = this._fuseConfirmationService.open({
            title: 'Activate Tenant',
            message: `Are you sure you want to activate tenant "${tenant.name}"?`,
            actions: {
                confirm: {
                    label: 'Activate'
                }
            }
        });

        confirmation.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this._tenantsService.activate(tenant.id).subscribe({
                    next: () => {
                        this.loadTenants();
                    },
                    error: (error) => {
                        console.error('Error activating tenant:', error);
                        this._fuseConfirmationService.open({
                            title: 'Error',
                            message: 'Failed to activate tenant. Please try again.',
                            actions: {
                                confirm: {
                                    label: 'OK'
                                }
                            }
                        });
                    }
                });
            }
        });
    }

    deactivateTenant(tenant: TenantDto): void {
        const confirmation = this._fuseConfirmationService.open({
            title: 'Deactivate Tenant',
            message: `Are you sure you want to deactivate tenant "${tenant.name}"?`,
            actions: {
                confirm: {
                    label: 'Deactivate'
                }
            }
        });

        confirmation.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this._tenantsService.deactivate(tenant.id).subscribe({
                    next: () => {
                        this.loadTenants();
                    },
                    error: (error) => {
                        console.error('Error deactivating tenant:', error);
                        this._fuseConfirmationService.open({
                            title: 'Error',
                            message: 'Failed to deactivate tenant. Please try again.',
                            actions: {
                                confirm: {
                                    label: 'OK'
                                }
                            }
                        });
                    }
                });
            }
        });
    }

    getStatusColor(isActive: boolean): string {
        return isActive ? 'text-green-600' : 'text-red-600';
    }

    getStatusText(isActive: boolean): string {
        return isActive ? 'Active' : 'Inactive';
    }

    formatDate(dateString: string): string {
        return new Date(dateString).toLocaleDateString();
    }

    suspendTenant(tenant: TenantDto): void {
        const confirmation = this._fuseConfirmationService.open({
            title: 'Suspend Tenant',
            message: `Are you sure you want to suspend tenant "${tenant.name}"? Users will not be able to access the system.`,
            icon: {
                show: true,
                name: 'heroicons_outline:pause',
                color: 'warn'
            },
            actions: {
                confirm: {
                    label: 'Suspend',
                    color: 'warn'
                },
                cancel: {
                    label: 'Cancel'
                }
            }
        });

        confirmation.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this._tenantsService.suspendTenant(tenant.id, 'Manual suspension by administrator').subscribe({
                    next: () => {
                        this.loadTenants();
                    },
                    error: (error) => {
                        console.error('Error suspending tenant:', error);
                        this._fuseConfirmationService.open({
                            title: 'Error',
                            message: 'Failed to suspend tenant. Please try again.',
                            actions: {
                                confirm: {
                                    label: 'OK'
                                }
                            }
                        });
                    }
                });
            }
        });
    }

    archiveTenant(tenant: TenantDto): void {
        const confirmation = this._fuseConfirmationService.open({
            title: 'Archive Tenant',
            message: `Are you sure you want to archive tenant "${tenant.name}"? The data will be preserved but become read-only. This action should only be taken for closed accounts.`,
            icon: {
                show: true,
                name: 'heroicons_outline:archive',
                color: 'warn'
            },
            actions: {
                confirm: {
                    label: 'Archive',
                    color: 'warn'
                },
                cancel: {
                    label: 'Cancel'
                }
            }
        });

        confirmation.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this._tenantsService.archiveTenant(tenant.id, 'Account closed - archived for record keeping').subscribe({
                    next: () => {
                        this.loadTenants();
                    },
                    error: (error) => {
                        console.error('Error archiving tenant:', error);
                        this._fuseConfirmationService.open({
                            title: 'Error',
                            message: 'Failed to archive tenant. Please try again.',
                            actions: {
                                confirm: {
                                    label: 'OK'
                                }
                            }
                        });
                    }
                });
            }
        });
    }

    upgradeTenant(tenant: TenantDto): void {
        this._router.navigate([`/tenant/${tenant.id}/billing`]);
    }

    manageBilling(tenant: TenantDto): void {
        this._router.navigate([`/tenant/${tenant.id}/billing`]);
    }

    viewUsage(tenant: TenantDto): void {
        this._router.navigate([`/tenant/${tenant.id}/usage`]);
    }

    viewAnalytics(tenant: TenantDto): void {
        this._router.navigate([`/tenant/${tenant.id}/usage`]);
    }

    manageTheme(): void {
        this._router.navigate(['/tenant/theme-settings']);
    }

    extendValidity(tenant: TenantDto): void {
        this._router.navigate([`/tenant/${tenant.id}/billing`]);
    }

    healthCheck(tenant: TenantDto): void {
        this._tenantsService.validateHealth(tenant.id).subscribe({
            next: (isHealthy) => {
                console.log(`Tenant ${tenant.name} health status:`, isHealthy ? 'Healthy' : 'Unhealthy');
            },
            error: (error) => {
                console.error('Error checking tenant health:', error);
            }
        });
    }

    getResourceUsagePercentage(tenant: TenantDto): number {
        if (!tenant.maxApiCallsPerMonth) return 0;
        return (tenant.currentMonthApiCalls / tenant.maxApiCallsPerMonth) * 100;
    }

    getUsageStatusColor(percentage: number): string {
        if (percentage >= 90) return 'text-red-600';
        if (percentage >= 70) return 'text-amber-600';
        return 'text-green-600';
    }

    formatBillingPlan(billingPlan: string): string {
        return billingPlan?.replace(/([A-Z])/g, ' $1').trim() || 'Not Set';
    }


} 