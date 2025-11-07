import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';

import { TenantsService } from '../../../core/tenants/tenants.service';
import { TenantDto } from '../../../core/tenants/tenants.types';
import { PageLayoutComponent, PageHeaderAction } from '../../../shared/components/page-layout.component';
import { ContentCardComponent } from '../../../shared/components/content-card.component';

@Component({
    selector: 'app-tenant-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        MatChipsModule,
        MatTabsModule,
        RouterModule,
        PageLayoutComponent,
        ContentCardComponent
    ],
    template: `
        <app-page-layout
            title="Tenant Dashboard"
            subtitle="Comprehensive overview of all tenants in your system"
            icon="dashboard"
            iconType="dashboard"
            [actions]="headerActions"
            [loading]="loading"
            loadingMessage="Loading dashboard data..."
            maxWidth="full">

            <div class="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <!-- Summary Cards -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <app-content-card padding="standard" elevation="hover">
                    <div class="flex items-center justify-between">
                        <div>
                            <h3 class="text-2xl font-bold text-blue-600">{{ summary?.totalTenants || 0 }}</h3>
                            <p class="text-sm text-gray-600 dark:text-gray-400">Total Tenants</p>
                        </div>
                        <mat-icon class="text-blue-500 text-3xl">business</mat-icon>
                    </div>
                </app-content-card>

                <app-content-card padding="standard" elevation="hover">
                    <div class="flex items-center justify-between">
                        <div>
                            <h3 class="text-2xl font-bold text-green-600">{{ summary?.activeTenants || 0 }}</h3>
                            <p class="text-sm text-gray-600 dark:text-gray-400">Active Tenants</p>
                        </div>
                        <mat-icon class="text-green-500 text-3xl">check_circle</mat-icon>
                    </div>
                </app-content-card>

                <app-content-card padding="standard" elevation="hover">
                    <div class="flex items-center justify-between">
                        <div>
                            <h3 class="text-2xl font-bold text-orange-600">{{ summary?.trialTenants || 0 }}</h3>
                            <p class="text-sm text-gray-600 dark:text-gray-400">Trial Period</p>
                        </div>
                        <mat-icon class="text-orange-500 text-3xl">hourglass_empty</mat-icon>
                    </div>
                </app-content-card>

                <app-content-card padding="standard" elevation="hover">
                    <div class="flex items-center justify-between">
                        <div>
                            <h3 class="text-2xl font-bold text-purple-600">{{ totalRevenue | currency }}</h3>
                            <p class="text-sm text-gray-600 dark:text-gray-400">Monthly Revenue</p>
                        </div>
                        <mat-icon class="text-purple-500 text-3xl">monetization_on</mat-icon>
                    </div>
                </app-content-card>
            </div>

            <!-- Tabs for Different Views -->
            <mat-tab-group class="dashboard-tabs">
                <!-- Recent Tenants -->
                <mat-tab label="Recent Tenants">
                    <div class="py-6">
                        <div *ngIf="recentTenants.length === 0" class="text-center py-12">
                            <mat-icon class="text-gray-400 text-6xl mb-4">business</mat-icon>
                            <h3 class="text-xl font-semibold text-gray-600 mb-2">No tenants found</h3>
                            <p class="text-gray-500 mb-6">Get started by creating your first tenant</p>
                            <button mat-raised-button color="primary" routerLink="/admin/tenant/create">
                                <mat-icon class="mr-2">add</mat-icon>
                                Create Tenant
                            </button>
                        </div>

                        <div *ngIf="recentTenants.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <app-content-card *ngFor="let tenant of recentTenants" padding="standard" elevation="hover">
                                <div class="flex items-center mb-4">
                                    <div class="w-10 h-10 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center mr-3">
                                        <mat-icon class="text-blue-600">business</mat-icon>
                                    </div>
                                    <div>
                                        <h4 class="font-semibold text-gray-900 dark:text-white">{{ tenant.systemName || tenant.name }}</h4>
                                        <p class="text-sm text-gray-500">{{ tenant.subdomain || tenant.url }}</p>
                                    </div>
                                </div>

                                <div class="space-y-2 mb-4">
                                    <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                        <mat-icon class="w-4 h-4 mr-2">email</mat-icon>
                                        {{ tenant.technicalAdminEmail || tenant.adminEmail }}
                                    </div>
                                    <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                        <mat-icon class="w-4 h-4 mr-2">payment</mat-icon>
                                        {{ tenant.billingPlan || 'Basic' }} Plan
                                    </div>
                                </div>

                                <div class="flex items-center justify-between">
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                          [ngClass]="{
                                            'bg-green-100 text-green-800': tenant.isActive || tenant.isSystemActive,
                                            'bg-red-100 text-red-800': !(tenant.isActive || tenant.isSystemActive)
                                          }">
                                        {{ (tenant.isActive || tenant.isSystemActive) ? 'Active' : 'Inactive' }}
                                    </span>
                                    <div class="flex space-x-1">
                                        <button mat-icon-button [routerLink]="['/admin/tenant', tenant.id, 'edit']" matTooltip="Edit">
                                            <mat-icon class="text-blue-600">edit</mat-icon>
                                        </button>
                                        <button mat-icon-button (click)="viewUsage(tenant.id)" matTooltip="Usage">
                                            <mat-icon class="text-green-600">analytics</mat-icon>
                                        </button>
                                    </div>
                                </div>
                            </app-content-card>
                        </div>
                    </div>
                </mat-tab>

                <!-- Billing Overview -->
                <mat-tab label="Billing">
                    <div class="py-6">
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <app-content-card padding="standard">
                                <h3 class="text-lg font-semibold mb-4">Revenue Breakdown</h3>
                                <div class="space-y-3">
                                    <div *ngFor="let plan of billingPlans" class="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                                        <span class="font-medium text-gray-900 dark:text-white">{{ plan.name }}</span>
                                        <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                                            {{ plan.revenue | currency }}
                                        </span>
                                    </div>
                                </div>
                            </app-content-card>

                            <app-content-card padding="standard">
                                <h3 class="text-lg font-semibold mb-4">Payment Status</h3>
                                <div class="space-y-3">
                                    <div *ngFor="let status of paymentStatuses" class="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                                        <span class="font-medium text-gray-900 dark:text-white">{{ status.status }}</span>
                                        <span class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">{{ status.count }}</span>
                                    </div>
                                </div>
                            </app-content-card>
                        </div>
                    </div>
                </mat-tab>

                <!-- System Health -->
                <mat-tab label="System Health">
                    <div class="py-6">
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <app-content-card padding="standard">
                                <h3 class="text-lg font-semibold mb-4">Resource Usage</h3>
                                <div class="space-y-4">
                                    <div>
                                        <div class="flex justify-between mb-2">
                                            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Database Storage</span>
                                            <span class="text-sm text-gray-500">{{ systemHealth?.databaseUsage || 45 }}%</span>
                                        </div>
                                        <div class="w-full bg-gray-200 rounded-full h-2">
                                            <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" [style.width.%]="systemHealth?.databaseUsage || 45"></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div class="flex justify-between mb-2">
                                            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">API Usage</span>
                                            <span class="text-sm text-gray-500">{{ systemHealth?.apiUsage || 67 }}%</span>
                                        </div>
                                        <div class="w-full bg-gray-200 rounded-full h-2">
                                            <div class="bg-green-600 h-2 rounded-full transition-all duration-300" [style.width.%]="systemHealth?.apiUsage || 67"></div>
                                        </div>
                                    </div>
                                </div>
                            </app-content-card>

                            <app-content-card padding="standard">
                                <h3 class="text-lg font-semibold mb-4">System Alerts</h3>
                                <div class="space-y-3">
                                    <div *ngFor="let alert of systemAlerts" class="p-3 rounded-lg border"
                                         [ngClass]="{
                                           'bg-red-50 border-red-200': alert.severity === 'high',
                                           'bg-yellow-50 border-yellow-200': alert.severity === 'medium',
                                           'bg-blue-50 border-blue-200': alert.severity === 'low'
                                         }">
                                        <div class="flex items-start">
                                            <mat-icon class="mr-2 mt-0.5" [ngClass]="{
                                                'text-red-500': alert.severity === 'high',
                                                'text-yellow-500': alert.severity === 'medium',
                                                'text-blue-500': alert.severity === 'low'
                                            }">
                                                {{ alert.severity === 'high' ? 'error' : alert.severity === 'medium' ? 'warning' : 'info' }}
                                            </mat-icon>
                                            <div>
                                                <p class="text-sm font-medium text-gray-900">{{ alert.title }}</p>
                                                <p class="text-xs text-gray-600">{{ alert.message }}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div *ngIf="systemAlerts.length === 0" class="text-center py-4">
                                        <mat-icon class="text-green-400 text-4xl mb-2">check_circle</mat-icon>
                                        <p class="text-sm text-gray-600">All systems operational</p>
                                    </div>
                                </div>
                            </app-content-card>
                        </div>
                    </div>
                </mat-tab>
            </mat-tab-group>
            </div>

        </app-page-layout>
    `,
    styles: [`
        .dashboard-tabs {
            background: white;
            border-radius: 12px;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }

        .dashboard-tabs .mat-mdc-tab-body-wrapper {
            padding: 0 1.5rem;
        }

        .dark .dashboard-tabs {
            background: #1f2937;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.3);
        }
    `]
})
export class TenantDashboardComponent implements OnInit {
    private readonly _tenantsService = inject(TenantsService);

    loading = true;
    summary: any = null;
    recentTenants: TenantDto[] = [];
    totalRevenue = 0;
    billingPlans: {name: string, revenue: number}[] = [];
    paymentStatuses: {status: string, count: number}[] = [];
    systemHealth: {databaseUsage: number, apiUsage: number} = {databaseUsage: 45, apiUsage: 67};
    systemAlerts: {title: string, message: string, severity: 'high' | 'medium' | 'low'}[] = [];

    headerActions: PageHeaderAction[] = [
        {
            label: 'Add Tenant',
            icon: 'add',
            routerLink: '/admin/tenant/create',
            type: 'primary'
        },
        {
            label: 'Setup Wizard',
            icon: 'auto_awesome',
            routerLink: '/admin/tenant/wizard',
            type: 'secondary',
            color: 'accent'
        },
        {
            label: 'View All',
            icon: 'list',
            routerLink: '/admin/tenant',
            type: 'secondary'
        }
    ];

    ngOnInit(): void {
        this.loadDashboardData();
    }

    private loadDashboardData(): void {
        this.loading = true;

        // Load recent tenants
        this._tenantsService.getPaginated(1, 6).subscribe({
            next: (data) => {
                this.recentTenants = data.data || [];
                this.calculateSummaryData();
                this.generateMockData();
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading dashboard data:', error);
                this.generateMockData();
                this.loading = false;
            }
        });
    }

    private calculateSummaryData(): void {
        this.summary = {
            totalTenants: this.recentTenants.length * 2, // Mock multiplier
            activeTenants: this.recentTenants.filter(t => t.isActive || t.isSystemActive).length * 2,
            trialTenants: Math.floor(this.recentTenants.length * 0.3)
        };
    }

    private generateMockData(): void {
        // Mock billing data
        this.billingPlans = [
            {name: 'Basic', revenue: 12500},
            {name: 'Standard', revenue: 24800},
            {name: 'Premium', revenue: 45200},
            {name: 'Enterprise', revenue: 78500}
        ];

        this.totalRevenue = this.billingPlans.reduce((sum, plan) => sum + plan.revenue, 0);

        this.paymentStatuses = [
            {status: 'Current', count: 142},
            {status: 'Overdue', count: 8},
            {status: 'Trial', count: 23},
            {status: 'Suspended', count: 3}
        ];

        // Mock system alerts
        this.systemAlerts = [
            {
                title: 'High Database Usage',
                message: 'Database usage has exceeded 80% capacity',
                severity: 'medium'
            },
            {
                title: 'Tenant License Expiring',
                message: '5 tenants have licenses expiring within 7 days',
                severity: 'low'
            }
        ];
    }

    viewUsage(tenantId: string): void {
        console.log('View usage for tenant:', tenantId);
        // Navigate to usage view or open modal
    }
}