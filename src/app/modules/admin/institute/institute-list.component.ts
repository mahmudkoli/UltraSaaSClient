import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
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
import { InstituteDto } from '../../../core/institutes/institutes.types';
import { InstitutesService } from '../../../core/institutes/institutes.service';
import { TenantService } from '../../../core/tenant/tenant.service';
import { TenantsService } from '../../../core/tenants/tenants.service';
import { TenantDto } from '../../../core/tenants/tenants.types';

@Component({
    selector: 'institute-list',
    templateUrl: './institute-list.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        CommonModule,
        TitleCasePipe,
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
export class InstituteListComponent implements OnInit {
    institutes: InstituteDto[] = [];
    loading: boolean = false;
    displayedColumns: string[] = ['name', 'code', 'type', 'contactInfo', 'isActive', 'setupStatus', 'actions'];

    dataSource: MatTableDataSource<InstituteDto> = new MatTableDataSource<InstituteDto>([]);
    searchControl = new FormControl<string>('');
    typeControl = new FormControl<'all' | 'school' | 'college' | 'university'>('all');
    statusControl = new FormControl<'all' | 'active' | 'inactive'>('all');

    /** Platform/root admin sees a tenant selector + a Tenant column; regular tenant
     * admins are scoped to their own tenant by the backend and see neither. */
    isRoot = false;
    tenants: TenantDto[] = [];
    tenantFilterControl = new FormControl<string>('all');
    private _tenantNameById: Record<string, string> = {};

    private _paginator?: MatPaginator;
    private _sort?: MatSort;

    // Deferred setter-based ViewChild: paginator/sort live inside *ngIf so they aren't
    // present at ngAfterViewInit; linking on a microtask (next tick) avoids the navigator
    // showing "0 of 0" AND the NG0100 ExpressionChangedAfterChecked that a same-tick link causes.
    @ViewChild(MatPaginator) set paginator(value: MatPaginator) {
        Promise.resolve().then(() => {
            this._paginator = value;
            if (value) { this.dataSource.paginator = value; }
        });
    }
    get paginator(): MatPaginator | undefined { return this._paginator; }

    @ViewChild(MatSort) set sort(value: MatSort) {
        Promise.resolve().then(() => {
            this._sort = value;
            if (value) { this.dataSource.sort = value; }
        });
    }
    get sort(): MatSort | undefined { return this._sort; }

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
        // filteredData reflects the active client filters (search/type/status); data.length
        // would ignore them.
        return this.dataSource?.filteredData?.length ?? 0;
    }

    constructor(
        private _institutesService: InstitutesService,
        private _router: Router,
        private _fuseConfirmationService: FuseConfirmationService,
        private _tenantService: TenantService,
        private _tenantsService: TenantsService
    ) {}

    ngOnInit(): void {
        this.isRoot = this._tenantService.resolve() === 'root';
        if (this.isRoot) {
            // Insert a Tenant column (between Institute and Code) and load the tenant
            // list for the selector + id→name mapping.
            this.displayedColumns = ['name', 'tenant', 'code', 'type', 'contactInfo', 'isActive', 'setupStatus', 'actions'];
            this.loadTenants();
            this.tenantFilterControl.valueChanges.subscribe(() => this.loadInstitutes());
        }
        this.initFilters();
        this.loadInstitutes();
    }

    private loadTenants(): void {
        this._tenantsService.getAll().subscribe({
            next: (tenants) => {
                this.tenants = tenants;
                this._tenantNameById = {};
                tenants.forEach(t => this._tenantNameById[t.id] = t.systemName);
            },
            error: (error) => console.error('Error loading tenants:', error)
        });
    }

    getTenantName(tenantId: string): string {
        return this._tenantNameById[tenantId] ?? tenantId;
    }

    private initFilters(): void {
        this.dataSource.filterPredicate = (data: InstituteDto, filter: string) => {
            const parsed = JSON.parse(filter) as { term: string; type: 'all' | 'school' | 'college' | 'university'; status: 'all' | 'active' | 'inactive' };
            const term = (parsed.term || '').toLowerCase().trim();
            const matchesTerm = !term || (
                data.name?.toLowerCase().includes(term) ||
                data.code?.toLowerCase().includes(term) ||
                data.type?.toLowerCase().includes(term)
            );
            const matchesType = parsed.type === 'all' || data.type?.toLowerCase() === parsed.type.toLowerCase();
            const matchesStatus = parsed.status === 'all' || (parsed.status === 'active' ? data.isActive : !data.isActive);
            return matchesTerm && matchesType && matchesStatus;
        };

        const applyFilter = () => {
            const filter = {
                term: this.searchControl.value ?? '',
                type: this.typeControl.value ?? '',
                status: this.statusControl.value ?? 'all'
            };
            this.dataSource.filter = JSON.stringify(filter);
            if (this.dataSource.paginator) {
                this.dataSource.paginator.firstPage();
            }
        };

        this.searchControl.valueChanges.subscribe(() => applyFilter());
        this.typeControl.valueChanges.subscribe(() => applyFilter());
        this.statusControl.valueChanges.subscribe(() => applyFilter());
    }

    loadInstitutes(): void {
        this.loading = true;
        const tenantFilter = this.isRoot && this.tenantFilterControl.value && this.tenantFilterControl.value !== 'all'
            ? this.tenantFilterControl.value
            : undefined;
        this._institutesService.getAll(tenantFilter ? { TenantId: tenantFilter } : undefined).subscribe({
            next: (institutes) => {
                this.institutes = institutes;
                this.dataSource.data = institutes;
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading institutes:', error);
                this.loading = false;
                this._fuseConfirmationService.open({
                    title: 'Error',
                    message: 'Failed to load institutes. Please refresh the page.',
                    actions: {
                        confirm: {
                            label: 'OK'
                        }
                    }
                });
            }
        });
    }

    createInstitute(): void {
        this._router.navigate(['/institute/create']);
    }

    importCsv(): void {
        this._router.navigate(['/institute/import']);
    }

    editInstitute(institute: InstituteDto): void {
        this._router.navigate([`/institute/${institute.id}/edit`]);
    }

    activateInstitute(institute: InstituteDto): void {
        const confirmation = this._fuseConfirmationService.open({
            title: 'Activate Institute',
            message: `Are you sure you want to activate institute "${institute.name}"?`,
            actions: {
                confirm: {
                    label: 'Activate'
                }
            }
        });

        confirmation.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this._institutesService.activate(institute.id).subscribe({
                    next: () => {
                        this.loadInstitutes();
                    },
                    error: (error) => {
                        console.error('Error activating institute:', error);
                        this._fuseConfirmationService.open({
                            title: 'Error',
                            message: 'Failed to activate institute. Please try again.',
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

    deactivateInstitute(institute: InstituteDto): void {
        const confirmation = this._fuseConfirmationService.open({
            title: 'Deactivate Institute',
            message: `Are you sure you want to deactivate institute "${institute.name}"?`,
            actions: {
                confirm: {
                    label: 'Deactivate'
                }
            }
        });

        confirmation.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this._institutesService.deactivate(institute.id).subscribe({
                    next: () => {
                        this.loadInstitutes();
                    },
                    error: (error) => {
                        console.error('Error deactivating institute:', error);
                        this._fuseConfirmationService.open({
                            title: 'Error',
                            message: 'Failed to deactivate institute. Please try again.',
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

    completeSetup(institute: InstituteDto): void {
        const confirmation = this._fuseConfirmationService.open({
            title: 'Complete Setup',
            message: `Are you sure you want to mark institute "${institute.name}" as setup complete?`,
            actions: {
                confirm: {
                    label: 'Complete Setup'
                }
            }
        });

        confirmation.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this._institutesService.completeSetup(institute.id).subscribe({
                    next: () => {
                        this.loadInstitutes();
                    },
                    error: (error) => {
                        console.error('Error completing institute setup:', error);
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

    viewDetails(institute: InstituteDto): void {
        this._router.navigate([`/institute/${institute.id}/details`]);
    }

    manageSettings(institute: InstituteDto): void {
        this._router.navigate([`/institute/${institute.id}/settings`]);
    }

    manageUsers(institute: InstituteDto): void {
        this._router.navigate([`/institute/${institute.id}/users`]);
    }

    suspendInstitute(institute: InstituteDto): void {
        const confirmation = this._fuseConfirmationService.open({
            title: 'Suspend Institute',
            message: `Are you sure you want to suspend institute "${institute.name}"? This will prevent access until reactivated.`,
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
                this._institutesService.suspend(institute.id, { id: institute.id, reason: 'Manual suspension by administrator' }).subscribe({
                    next: () => {
                        this.loadInstitutes();
                    },
                    error: (error) => {
                        console.error('Error suspending institute:', error);
                        this._fuseConfirmationService.open({
                            title: 'Error',
                            message: 'Failed to suspend institute. Please try again.',
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

    archiveInstitute(institute: InstituteDto): void {
        const confirmation = this._fuseConfirmationService.open({
            title: 'Archive Institute',
            message: `Are you sure you want to archive institute "${institute.name}"? Data will be preserved but access will be restricted.`,
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
                this._institutesService.archive(institute.id, { id: institute.id, reason: 'Institute closed - archived for record keeping' }).subscribe({
                    next: () => {
                        this.loadInstitutes();
                    },
                    error: (error) => {
                        console.error('Error archiving institute:', error);
                        this._fuseConfirmationService.open({
                            title: 'Error',
                            message: 'Failed to archive institute. Please try again.',
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

    updateBranding(institute: InstituteDto): void {
        this._router.navigate([`/institute/${institute.id}/branding`]);
    }

    updateCapacity(institute: InstituteDto): void {
        this._router.navigate([`/institute/${institute.id}/capacity`]);
    }

    updateStatistics(institute: InstituteDto): void {
        this._router.navigate([`/institute/${institute.id}/statistics`]);
    }

    viewUsage(institute: InstituteDto): void {
        this._router.navigate([`/institute/${institute.id}/usage`]);
    }

    viewAnalytics(institute: InstituteDto): void {
        this._router.navigate([`/institute/${institute.id}/analytics`]);
    }

    healthCheck(institute: InstituteDto): void {
        this._institutesService.validateHealth(institute.id).subscribe({
            next: (isHealthy) => {
                console.log(`Institute ${institute.name} health status:`, isHealthy ? 'Healthy' : 'Unhealthy');
            },
            error: (error) => {
                console.error('Error checking institute health:', error);
            }
        });
    }

    getCapacityStatus(institute: InstituteDto): string {
        if (!institute.maxEmployees) return 'Not Set';
        const percentage = (institute.currentEmployeeCount / institute.maxEmployees) * 100;
        if (percentage >= 95) return 'Full';
        if (percentage >= 80) return 'High';
        if (percentage >= 60) return 'Medium';
        return 'Low';
    }

    getCapacityColor(institute: InstituteDto): string {
        if (!institute.maxEmployees) return 'text-gray-500';
        const percentage = (institute.currentEmployeeCount / institute.maxEmployees) * 100;
        if (percentage >= 95) return 'text-red-600';
        if (percentage >= 80) return 'text-amber-600';
        if (percentage >= 60) return 'text-blue-600';
        return 'text-green-600';
    }

    manageBranding(institute: InstituteDto): void {
        this._router.navigate([`/institute/${institute.id}/branding`]);
    }

    manageCapacity(institute: InstituteDto): void {
        this._router.navigate([`/institute/${institute.id}/capacity`]);
    }

}