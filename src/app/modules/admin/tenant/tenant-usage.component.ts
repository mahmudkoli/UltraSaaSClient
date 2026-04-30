import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { NgApexchartsModule } from 'ng-apexcharts';
import { TranslocoModule } from '@ngneat/transloco';
import { ApexOptions } from 'ng-apexcharts';
import { TenantDto, TenantUsageDto } from '../../../core/tenants/tenants.types';
import { TenantsService } from '../../../core/tenants/tenants.service';

@Component({
    selector: 'tenant-usage',
    templateUrl: './tenant-usage.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatCardModule,
        MatIconModule,
        MatProgressBarModule,
        MatProgressSpinnerModule,
        MatTabsModule,
        MatChipsModule,
        NgApexchartsModule,
        TranslocoModule,
    ],
})
export class TenantUsageComponent implements OnInit {
    tenant?: TenantDto;
    tenantUsage?: TenantUsageDto;
    tenantAnalytics: any;
    tenantId: string;
    loading: boolean = false;
    loadingAnalytics: boolean = false;

    // Chart configurations
    apiCallsChartOptions: Partial<ApexOptions> = {};
    storageChartOptions: Partial<ApexOptions> = {};
    usageOverviewChartOptions: Partial<ApexOptions> = {};

    constructor(
        private _tenantsService: TenantsService,
        private _router: Router,
        private _route: ActivatedRoute
    ) {
        this.tenantId = this._route.snapshot.paramMap.get('id')!;
    }

    ngOnInit(): void {
        this.loadTenantData();
        this.loadTenantUsage();
        this.loadTenantAnalytics();
    }

    loadTenantData(): void {
        this.loading = true;
        this._tenantsService.getById(this.tenantId).subscribe({
            next: (tenant) => {
                this.tenant = tenant;
                this.setupCharts();
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading tenant:', error);
                this.loading = false;
            }
        });
    }

    loadTenantUsage(): void {
        this._tenantsService.getUsage(this.tenantId).subscribe({
            next: (usage) => {
                this.tenantUsage = usage;
                this.setupUsageCharts();
            },
            error: (error) => {
                console.error('Error loading tenant usage:', error);
            }
        });
    }

    loadTenantAnalytics(): void {
        this.loadingAnalytics = true;
        this._tenantsService.getTenantAnalytics(this.tenantId).subscribe({
            next: (analytics) => {
                this.tenantAnalytics = analytics;
                this.setupAnalyticsCharts();
                this.loadingAnalytics = false;
            },
            error: (error) => {
                console.error('Error loading tenant analytics:', error);
                this.loadingAnalytics = false;
            }
        });
    }

    setupCharts(): void {
        if (!this.tenant) return;

        // API Calls Chart
        this.apiCallsChartOptions = {
            series: [{
                name: 'API Calls',
                data: [this.tenant.currentMonthApiCalls || 0]
            }],
            chart: {
                type: 'radialBar',
                height: 250
            },
            plotOptions: {
                radialBar: {
                    hollow: {
                        size: '65%'
                    },
                    dataLabels: {
                        name: {
                            fontSize: '16px'
                        },
                        value: {
                            fontSize: '24px',
                            formatter: (val: number) => {
                                return `${Math.round((val / 100) * (this.tenant?.maxApiCallsPerMonth || 0))}`;
                            }
                        },
                        total: {
                            show: true,
                            label: 'API Calls',
                            formatter: () => {
                                return `${this.tenant?.currentMonthApiCalls || 0} / ${this.tenant?.maxApiCallsPerMonth || 0}`;
                            }
                        }
                    }
                }
            },
            labels: ['API Usage'],
            colors: ['#1f77b4']
        };

        // Storage Chart
        this.storageChartOptions = {
            series: [{
                name: 'Storage',
                data: [this.tenant.currentDatabaseMB || 0]
            }],
            chart: {
                type: 'radialBar',
                height: 250
            },
            plotOptions: {
                radialBar: {
                    hollow: {
                        size: '65%'
                    },
                    dataLabels: {
                        name: {
                            fontSize: '16px'
                        },
                        value: {
                            fontSize: '24px',
                            formatter: (val: number) => {
                                return `${Math.round((val / 100) * ((this.tenant?.maxDatabaseGB || 0) * 1024))}MB`;
                            }
                        },
                        total: {
                            show: true,
                            label: 'Storage',
                            formatter: () => {
                                return `${this.tenant?.currentDatabaseMB || 0}MB / ${(this.tenant?.maxDatabaseGB || 0) * 1024}MB`;
                            }
                        }
                    }
                }
            },
            labels: ['Storage Usage'],
            colors: ['#2ca02c']
        };
    }

    setupUsageCharts(): void {
        if (!this.tenantUsage) return;

        // Usage overview chart
        this.usageOverviewChartOptions = {
            series: [
                this.getUsagePercentage('api'),
                this.getUsagePercentage('storage'),
                this.getUsagePercentage('users')
            ],
            chart: {
                type: 'donut',
                height: 300
            },
            labels: ['API Calls', 'Storage', 'Users'],
            colors: ['#1f77b4', '#2ca02c', '#ff7f0e'],
            plotOptions: {
                pie: {
                    donut: {
                        size: '70%'
                    }
                }
            },
            legend: {
                position: 'bottom'
            }
        };
    }

    setupAnalyticsCharts(): void {
        // This would be set up with real analytics data
        // For now, we'll create placeholder charts
    }

    getUsagePercentage(type: 'api' | 'storage' | 'users' | 'outlets'): number {
        if (!this.tenant) return 0;

        switch (type) {
            case 'api':
                return this.tenant.maxApiCallsPerMonth ?
                    (this.tenant.currentMonthApiCalls / this.tenant.maxApiCallsPerMonth) * 100 : 0;
            case 'storage':
                return this.tenant.maxDatabaseGB ?
                    ((this.tenant.currentDatabaseMB || 0) / (this.tenant.maxDatabaseGB * 1024)) * 100 : 0;
            case 'users':
                return this.tenantUsage?.maxUsers ?
                    ((this.tenantUsage.currentUsers || 0) / this.tenantUsage.maxUsers) * 100 : 0;
            case 'outlets':
                return this.tenantUsage?.maxOutlets ?
                    ((this.tenantUsage.currentOutlets || 0) / this.tenantUsage.maxOutlets) * 100 : 0;
            default:
                return 0;
        }
    }

    getUsageStatus(percentage: number): { label: string; color: string } {
        if (percentage >= 90) return { label: 'Critical', color: 'text-red-600' };
        if (percentage >= 70) return { label: 'High', color: 'text-amber-600' };
        if (percentage >= 50) return { label: 'Medium', color: 'text-blue-600' };
        return { label: 'Low', color: 'text-green-600' };
    }

    refreshData(): void {
        this.loadTenantData();
        this.loadTenantUsage();
        this.loadTenantAnalytics();
    }

    goBack(): void {
        this._router.navigate(['/tenant']);
    }

    manageBilling(): void {
        this._router.navigate(['/tenant', this.tenantId, 'billing']);
    }

    upgradeSubscription(): void {
        this._router.navigate(['/tenant', this.tenantId, 'upgrade']);
    }
}