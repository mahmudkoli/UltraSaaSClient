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
import { FuseNavigationService } from '@fuse/components/navigation';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { TranslocoModule } from '@ngneat/transloco';
import { NgApexchartsModule } from 'ng-apexcharts';
import { TenantDto } from '../../../core/tenants/tenants.types';
import { TenantsService } from '../../../core/tenants/tenants.service';
import { forkJoin, of, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

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
        NgApexchartsModule,
        TranslocoModule,
    ],
})
export class TenantListComponent implements OnInit {
    tenants: TenantDto[] = [];
    loading: boolean = false;
    displayedColumns: string[] = ['select', 'name', 'adminEmail', 'url', 'isActive', 'theme', 'validUpto', 'actions'];

    /** #29 — bulk selection across the (filtered) tenant list. */
    selection = new Set<string>();

    dataSource: MatTableDataSource<TenantDto> = new MatTableDataSource<TenantDto>([]);
    searchControl = new FormControl<string>('');
    statusControl = new FormControl<'all' | 'active' | 'inactive'>('all');

    private _paginator?: MatPaginator;
    private _sort?: MatSort;

    // Paginator/sort live inside *ngIf="dataSource.data.length > 0", so they are not
    // in the DOM at ngAfterViewInit (data loads async). Setter-based ViewChild links
    // them once they render — otherwise the navigator is never wired and shows "0 of 0".
    // The link is DEFERRED to a microtask: assigning during the ViewChild resolution
    // (same change-detection pass) flips the "Showing X" getters mid-cycle and throws
    // NG0100 (ExpressionChangedAfterItHasBeenChecked). Linking on the next tick avoids it.
    @ViewChild(MatPaginator) set paginator(value: MatPaginator) {
        Promise.resolve().then(() => {
            this._paginator = value;
            if (value) { this.dataSource.paginator = value; }
        });
    }
    get paginator(): MatPaginator | undefined {
        return this._paginator;
    }

    @ViewChild(MatSort) set sort(value: MatSort) {
        Promise.resolve().then(() => {
            this._sort = value;
            if (value) { this.dataSource.sort = value; }
        });
    }
    get sort(): MatSort | undefined {
        return this._sort;
    }

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
        // filteredData reflects the active search/status filter; data.length would
        // ignore it and keep the count at the unfiltered total.
        return this.dataSource?.filteredData?.length ?? 0;
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

    viewTenant(tenant: TenantDto): void {
        this._router.navigate([`/tenant/${tenant.id}`]);
    }

    // ----- #29 bulk actions -----
    isSelected(id: string): boolean { return this.selection.has(id); }
    toggleSelection(id: string): void { this.selection.has(id) ? this.selection.delete(id) : this.selection.add(id); }
    get selectedCount(): number { return this.selection.size; }
    private get visibleIds(): string[] { return (this.dataSource.filteredData ?? []).map(t => t.id); }
    get allSelected(): boolean { const ids = this.visibleIds; return ids.length > 0 && ids.every(id => this.selection.has(id)); }
    get someSelected(): boolean { return this.selection.size > 0 && !this.allSelected; }
    toggleAll(): void {
        const ids = this.visibleIds;
        if (this.allSelected) { ids.forEach(id => this.selection.delete(id)); }
        else { ids.forEach(id => this.selection.add(id)); }
    }
    clearSelection(): void { this.selection.clear(); }

    bulkActivate(): void { this.runBulk('activate', 'Activate', id => this._tenantsService.activate(id)); }
    bulkReactivate(): void { this.runBulk('reactivate', 'Reactivate', id => this._tenantsService.reactivate(id)); }
    bulkSuspend(): void {
        // Backend validates Reason against a fixed allowed list (Payment Overdue / Policy
        // Violation / Security Concern / Maintenance / Legal Hold / Contract Dispute / Other).
        this.runBulk('suspend', 'Suspend', id => this._tenantsService.suspend(id, { id, reason: 'Other' }));
    }

    /** Fan out a per-tenant op across the selection, tolerating partial failures. */
    private runBulk(verb: string, label: string, op: (id: string) => Observable<string>): void {
        const ids = Array.from(this.selection);
        if (ids.length === 0) return;
        this._fuseConfirmationService.open({
            title: `${label} ${ids.length} tenant(s)?`,
            message: `This will ${verb} ${ids.length} selected tenant(s).`,
            actions: { confirm: { label }, cancel: { label: 'Cancel' } }
        }).afterClosed().subscribe((result) => {
            if (result !== 'confirmed') return;
            forkJoin(ids.map(id => op(id).pipe(map(() => ({ ok: true })), catchError(() => of({ ok: false })))))
                .subscribe((results) => {
                    const ok = results.filter(r => r.ok).length;
                    const failed = results.length - ok;
                    this._fuseConfirmationService.open({
                        title: 'Bulk action complete',
                        message: `${ok} succeeded${failed ? `, ${failed} failed (e.g. root or invalid state transitions)` : ''}.`,
                        actions: { confirm: { label: 'OK' } }
                    });
                    this.clearSelection();
                    this.loadTenants();
                });
        });
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

    deactivateTenant(tenant: TenantDto): void {
        const confirmation = this._fuseConfirmationService.open({
            title: 'Deactivate Tenant',
            message: `Are you sure you want to deactivate tenant "${tenant.systemName}"?`,
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
                this._tenantsService.suspend(tenant.id, { id: tenant.id, reason: 'Other' }).subscribe({
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
                this._tenantsService.archive(tenant.id, { tenantId: tenant.id, reason: 'Account closed - archived for record keeping' }).subscribe({
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

    /** Theme split into [theme, scheme, layout] parts for chip rendering;
     * returns ['Default'] when no theme is configured. */
    getThemeParts(tenant: TenantDto): string[] {
        if (!tenant.themeConfig) return ['Default'];
        try {
            const config = JSON.parse(tenant.themeConfig);
            const theme = (config.theme || 'default').replace('theme-', '');
            const scheme = config.scheme || 'light';
            const layout = config.layout || 'classy';
            return [theme, scheme, layout];
        } catch {
            return ['Default'];
        }
    }

    // Phase v1-C2.2 — resource-usage counters dropped. Plan-derived caps
    // resolved via PlanId. Tile shows "—" until reattached if/when a
    // metering middleware is built.
    getResourceUsagePercentage(_tenant: TenantDto): number { return 0; }

    getUsageStatusColor(percentage: number): string {
        if (percentage >= 90) return 'text-red-600';
        if (percentage >= 70) return 'text-amber-600';
        return 'text-green-600';
    }

    formatBillingPlan(billingPlan: string): string {
        return billingPlan?.replace(/([A-Z])/g, ' $1').trim() || 'Not Set';
    }


} 