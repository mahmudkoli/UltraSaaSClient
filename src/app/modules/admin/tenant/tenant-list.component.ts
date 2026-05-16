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
import { MatDialog } from '@angular/material/dialog';
import { FuseNavigationService } from '@fuse/components/navigation';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { TranslocoModule } from '@ngneat/transloco';
import { NgApexchartsModule } from 'ng-apexcharts';
import { TenantDto } from '../../../core/tenants/tenants.types';
import { TenantsService } from '../../../core/tenants/tenants.service';
import { PlansService } from '../../../core/billing/billing.service';
import { PlanDto } from '../../../core/billing/billing.types';
import { RecordPaymentDialogComponent } from './record-payment-dialog.component';

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
    displayedColumns: string[] = ['name', 'adminEmail', 'plan', 'url', 'isActive', 'validUpto', 'actions'];

    dataSource: MatTableDataSource<TenantDto> = new MatTableDataSource<TenantDto>([]);
    searchControl = new FormControl<string>('');
    statusControl = new FormControl<'all' | 'active' | 'inactive'>('all');

    /** All active plans cached for the inline Plan chip column. */
    private plansById = new Map<string, PlanDto>();

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
        private _plansService: PlansService,
        private _router: Router,
        private _fuseConfirmationService: FuseConfirmationService,
        private _dialog: MatDialog,
    ) {}

    ngOnInit(): void {
        this.initFilters();
        this.loadTenants();
        this._plansService.getAll().subscribe({
            next: (plans) => { this.plansById = new Map(plans.map(p => [p.id, p])); },
            error: () => { /* leave plan column blank */ },
        });
    }

    /** Resolve a tenant's plan name via the cached PlansService dictionary. */
    planNameFor(tenant: TenantDto): string {
        if (!tenant.planId) return 'Not set';
        return this.plansById.get(tenant.planId)?.name ?? '—';
    }

    /** Severity tag for ValidUpto traffic light (matches tenant-billing). */
    validitySeverity(tenant: TenantDto): 'expired' | 'urgent' | 'warning' | 'ok' | 'none' {
        if (!tenant.validUpto) return 'none';
        const days = Math.floor((new Date(tenant.validUpto).getTime() - Date.now()) / 86400000);
        if (days < 0) return 'expired';
        if (days <= 1) return 'urgent';
        if (days <= 7) return 'warning';
        return 'ok';
    }

    openRecordPayment(tenant: TenantDto): void {
        const ref = this._dialog.open(RecordPaymentDialogComponent, {
            data: {
                tenantId: tenant.id,
                tenantName: tenant.systemName ?? tenant.id,
                currentValidUpto: tenant.validUpto,
            },
        });
        ref.afterClosed().subscribe((recorded) => {
            if (recorded) this.loadTenants();
        });
    }

    private initFilters(): void {
        this.dataSource.filterPredicate = (data: TenantDto, filter: string) => {
            const parsed = JSON.parse(filter) as { term: string; status: 'all' | 'active' | 'inactive' };
            const term = (parsed.term || '').toLowerCase().trim();
            const matchesTerm = !term || (
                data.systemName?.toLowerCase().includes(term) ||
                data.id?.toLowerCase().includes(term) ||
                data.technicalAdminEmail?.toLowerCase().includes(term) ||
                data.subdomain?.toLowerCase().includes(term)
            );
            const matchesStatus = parsed.status === 'all' || (parsed.status === 'active' ? data.isSystemActive : !data.isSystemActive);
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
        this._router.navigate(['/tenant/create']);
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
            message: `Are you sure you want to activate tenant "${tenant.systemName}"?`,
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

    /** Phase 2.51 — the legacy "Deactivate" path is gone; use Suspend with a reason. */
    deactivateTenant(tenant: TenantDto): void {
        this.suspendTenant(tenant);
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
            message: `Are you sure you want to suspend tenant "${tenant.systemName}"? Users will not be able to access the system.`,
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
            message: `Are you sure you want to archive tenant "${tenant.systemName}"? The data will be preserved but become read-only. This action should only be taken for closed accounts.`,
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

    manageTheme(tenant: TenantDto): void {
        this._router.navigate([`/tenant/${tenant.id}/theme-settings`]);
    }

    extendValidity(tenant: TenantDto): void {
        this._router.navigate([`/tenant/${tenant.id}/billing`]);
    }

    getThemeLabel(tenant: TenantDto): string {
        if (!tenant.themeConfig) return 'Default';
        try {
            const config = JSON.parse(tenant.themeConfig);
            const theme = (config.theme || 'default').replace('theme-', '');
            const scheme = config.scheme || 'light';
            const layout = config.layout || 'classy';
            return `${theme} / ${scheme} / ${layout}`;
        } catch {
            return 'Default';
        }
    }


}