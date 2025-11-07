import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { Observable, forkJoin } from 'rxjs';

import { InstitutesService } from '../../../core/institutes/institutes.service';
import { InstituteDto, InstituteDashboardSummary, InstituteUsageDto } from '../../../core/institutes/institutes.types';

@Component({
    selector: 'app-institute-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        MatChipsModule,
        MatTabsModule,
        RouterModule
    ],
    template: `
        <div class="institute-dashboard flex flex-col min-h-0 bg-gray-50 dark:bg-gray-900">
            <!-- Header -->
            <div class="flex-0 p-4 sm:p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Institute Management</h1>
                <p class="text-gray-600 dark:text-gray-400">Comprehensive overview of all institutes in your system</p>
            </div>

            <!-- Loading State -->
            <div *ngIf="loading" class="flex justify-center items-center h-64">
                <mat-spinner></mat-spinner>
            </div>

            <!-- Dashboard Content -->
            <div *ngIf="!loading" class="flex-1 overflow-auto p-4 sm:p-6">
                <!-- Summary Cards -->
                <div class="summary-cards grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    <mat-card class="summary-card">
                        <mat-card-content>
                            <div class="flex items-center justify-between">
                                <div>
                                    <h3 class="text-2xl font-bold text-blue-600">{{ summary?.totalInstitutes || 0 }}</h3>
                                    <p class="text-sm text-gray-600">Total Institutes</p>
                                </div>
                                <mat-icon class="text-blue-500 text-3xl">school</mat-icon>
                            </div>
                        </mat-card-content>
                    </mat-card>

                    <mat-card class="summary-card">
                        <mat-card-content>
                            <div class="flex items-center justify-between">
                                <div>
                                    <h3 class="text-2xl font-bold text-green-600">{{ summary?.activeInstitutes || 0 }}</h3>
                                    <p class="text-sm text-gray-600">Active Institutes</p>
                                </div>
                                <mat-icon class="text-green-500 text-3xl">check_circle</mat-icon>
                            </div>
                        </mat-card-content>
                    </mat-card>

                    <mat-card class="summary-card">
                        <mat-card-content>
                            <div class="flex items-center justify-between">
                                <div>
                                    <h3 class="text-2xl font-bold text-orange-600">{{ summary?.pendingSetupInstitutes || 0 }}</h3>
                                    <p class="text-sm text-gray-600">Pending Setup</p>
                                </div>
                                <mat-icon class="text-orange-500 text-3xl">hourglass_empty</mat-icon>
                            </div>
                        </mat-card-content>
                    </mat-card>

                    <mat-card class="summary-card">
                        <mat-card-content>
                            <div class="flex items-center justify-between">
                                <div>
                                    <h3 class="text-2xl font-bold text-red-600">{{ summary?.suspendedInstitutes || 0 }}</h3>
                                    <p class="text-sm text-gray-600">Suspended</p>
                                </div>
                                <mat-icon class="text-red-500 text-3xl">block</mat-icon>
                            </div>
                        </mat-card-content>
                    </mat-card>
                </div>

                <!-- Action Buttons -->
                <div class="action-buttons mb-6 sm:mb-8 flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
                    <button mat-raised-button color="primary" [routerLink]="['/admin/institute/create']">
                        <mat-icon>add</mat-icon>
                        Add Institute
                    </button>
                    <button mat-raised-button color="accent" [routerLink]="['/admin/tenant/wizard']">
                        <mat-icon>auto_awesome</mat-icon>
                        Setup Wizard
                    </button>
                    <button mat-stroked-button>
                        <mat-icon>file_upload</mat-icon>
                        Import Institutes
                    </button>
                    <button mat-stroked-button>
                        <mat-icon>file_download</mat-icon>
                        Export Data
                    </button>
                </div>

                <!-- Tabs for Different Views -->
                <mat-tab-group class="dashboard-tabs">
                    <!-- Recent Institutes -->
                    <mat-tab label="Recent Institutes">
                        <div class="tab-content p-6">
                            <div *ngIf="recentInstitutes.length === 0" class="empty-state text-center py-12">
                                <mat-icon class="text-gray-400 text-6xl mb-4">school</mat-icon>
                                <h3 class="text-xl font-semibold text-gray-600 mb-2">No institutes found</h3>
                                <p class="text-gray-500 mb-6">Get started by creating your first institute</p>
                                <button mat-raised-button color="primary" [routerLink]="['/admin/institute/create']">
                                    <mat-icon>add</mat-icon>
                                    Create Institute
                                </button>
                            </div>

                            <div *ngIf="recentInstitutes.length > 0" class="institutes-grid">
                                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                    <mat-card *ngFor="let institute of recentInstitutes" class="institute-card">
                                        <mat-card-header>
                                            <div mat-card-avatar>
                                                <mat-icon>school</mat-icon>
                                            </div>
                                            <mat-card-title>{{ institute.name }}</mat-card-title>
                                            <mat-card-subtitle>{{ institute.code }}</mat-card-subtitle>
                                        </mat-card-header>
                                        <mat-card-content>
                                            <div class="institute-details">
                                                <p class="text-sm text-gray-600 mb-2">
                                                    <mat-icon class="inline-icon">location_on</mat-icon>
                                                    {{ institute.country }}
                                                </p>
                                                <p class="text-sm text-gray-600 mb-2">
                                                    <mat-icon class="inline-icon">category</mat-icon>
                                                    {{ institute.type }}
                                                </p>
                                                <div class="status-chips mb-3">
                                                    <mat-chip-set>
                                                        <mat-chip [ngClass]="{
                                                            'status-active': institute.status === 'Active',
                                                            'status-pending': institute.status === 'PendingSetup',
                                                            'status-suspended': institute.status === 'Suspended'
                                                        }">
                                                            {{ institute.status }}
                                                        </mat-chip>
                                                    </mat-chip-set>
                                                </div>
                                            </div>
                                        </mat-card-content>
                                        <mat-card-actions>
                                            <button mat-button [routerLink]="['/admin/institute', institute.id, 'edit']">
                                                <mat-icon>edit</mat-icon>
                                                Edit
                                            </button>
                                            <button mat-button (click)="viewUsage(institute.id)">
                                                <mat-icon>analytics</mat-icon>
                                                Usage
                                            </button>
                                        </mat-card-actions>
                                    </mat-card>
                                </div>
                            </div>
                        </div>
                    </mat-tab>

                    <!-- Pending Setup -->
                    <mat-tab label="Pending Setup" [badge]="pendingSetupInstitutes.length">
                        <div class="tab-content p-6">
                            <div *ngIf="pendingSetupInstitutes.length === 0" class="empty-state text-center py-12">
                                <mat-icon class="text-green-400 text-6xl mb-4">check_circle</mat-icon>
                                <h3 class="text-xl font-semibold text-gray-600 mb-2">All institutes are set up</h3>
                                <p class="text-gray-500">Great job! All institutes have completed their setup process</p>
                            </div>

                            <div *ngIf="pendingSetupInstitutes.length > 0" class="pending-institutes">
                                <div class="mb-6">
                                    <h3 class="text-lg font-semibold mb-2">Institutes requiring setup completion</h3>
                                    <p class="text-gray-600">These institutes need to complete their setup process</p>
                                </div>

                                <div class="grid grid-cols-1 gap-4">
                                    <mat-card *ngFor="let institute of pendingSetupInstitutes" class="pending-institute-card">
                                        <mat-card-content>
                                            <div class="flex items-center justify-between">
                                                <div class="flex-1">
                                                    <h4 class="font-semibold text-lg">{{ institute.name }}</h4>
                                                    <p class="text-sm text-gray-600">{{ institute.code }} • {{ institute.type }}</p>
                                                    <p class="text-sm text-gray-500 mt-1">Created: {{ institute.createdOn | date:'short' }}</p>
                                                </div>
                                                <div class="flex gap-2">
                                                    <button mat-icon-button (click)="completeSetup(institute.id)"
                                                            matTooltip="Complete Setup">
                                                        <mat-icon>check</mat-icon>
                                                    </button>
                                                    <button mat-icon-button [routerLink]="['/admin/institute', institute.id, 'edit']"
                                                            matTooltip="Edit Institute">
                                                        <mat-icon>edit</mat-icon>
                                                    </button>
                                                </div>
                                            </div>
                                        </mat-card-content>
                                    </mat-card>
                                </div>
                            </div>
                        </div>
                    </mat-tab>

                    <!-- Analytics Overview -->
                    <mat-tab label="Analytics">
                        <div class="tab-content p-6">
                            <div class="analytics-section">
                                <h3 class="text-lg font-semibold mb-4">Institute Distribution</h3>

                                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                                    <!-- By Type -->
                                    <mat-card>
                                        <mat-card-header>
                                            <mat-card-title>By Type</mat-card-title>
                                        </mat-card-header>
                                        <mat-card-content>
                                            <div class="type-distribution">
                                                <div *ngFor="let type of institutesByType" class="type-item flex justify-between items-center py-2">
                                                    <span class="font-medium">{{ type.type }}</span>
                                                    <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">{{ type.count }}</span>
                                                </div>
                                            </div>
                                        </mat-card-content>
                                    </mat-card>

                                    <!-- By Country -->
                                    <mat-card>
                                        <mat-card-header>
                                            <mat-card-title>By Country</mat-card-title>
                                        </mat-card-header>
                                        <mat-card-content>
                                            <div class="country-distribution">
                                                <div *ngFor="let country of institutesByCountry" class="country-item flex justify-between items-center py-2">
                                                    <span class="font-medium">{{ country.country }}</span>
                                                    <span class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">{{ country.count }}</span>
                                                </div>
                                            </div>
                                        </mat-card-content>
                                    </mat-card>
                                </div>

                                <!-- Quick Actions -->
                                <div class="quick-actions">
                                    <h4 class="text-lg font-semibold mb-4">Quick Actions</h4>
                                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                                        <button mat-stroked-button class="action-btn" (click)="exportAnalytics()">
                                            <mat-icon>bar_chart</mat-icon>
                                            Export Analytics
                                        </button>
                                        <button mat-stroked-button class="action-btn" (click)="bulkActivate()">
                                            <mat-icon>check_circle_outline</mat-icon>
                                            Bulk Activate
                                        </button>
                                        <button mat-stroked-button class="action-btn" (click)="bulkSuspend()">
                                            <mat-icon>block</mat-icon>
                                            Bulk Suspend
                                        </button>
                                        <button mat-stroked-button class="action-btn" [routerLink]="['/admin/institute']">
                                            <mat-icon>view_list</mat-icon>
                                            View All
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </mat-tab>
                </mat-tab-group>
            </div>
        </div>
    `,
    styles: [`
        .institute-dashboard {
            height: 100vh;
        }

        .summary-card {
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            cursor: pointer;
        }

        .summary-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }

        .institute-card {
            transition: transform 0.2s ease;
        }

        .institute-card:hover {
            transform: translateY(-2px);
        }

        .inline-icon {
            font-size: 16px;
            width: 16px;
            height: 16px;
            vertical-align: text-top;
            margin-right: 4px;
        }

        .status-active {
            background-color: #dcfce7;
            color: #166534;
        }

        .status-pending {
            background-color: #fef3c7;
            color: #92400e;
        }

        .status-suspended {
            background-color: #fee2e2;
            color: #991b1b;
        }

        .pending-institute-card {
            border-left: 4px solid #f59e0b;
        }

        .action-btn {
            height: 60px;
            flex-direction: column;
            gap: 8px;
        }

        .action-btn mat-icon {
            font-size: 24px;
            width: 24px;
            height: 24px;
        }

        .type-item, .country-item {
            border-bottom: 1px solid #e5e7eb;
        }

        .type-item:last-child, .country-item:last-child {
            border-bottom: none;
        }

        .dashboard-tabs {
            background: white;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .empty-state mat-icon {
            opacity: 0.5;
        }
    `]
})
export class InstituteDashboardComponent implements OnInit {
    private readonly _institutesService = inject(InstitutesService);

    loading = true;
    summary: InstituteDashboardSummary | null = null;
    recentInstitutes: InstituteDto[] = [];
    pendingSetupInstitutes: InstituteDto[] = [];
    institutesByType: {type: string, count: number}[] = [];
    institutesByCountry: {country: string, count: number}[] = [];

    ngOnInit(): void {
        this.loadDashboardData();
    }

    private loadDashboardData(): void {
        this.loading = true;

        forkJoin({
            summary: this._institutesService.getDashboardSummary(),
            recent: this._institutesService.getPaginated(1, 6),
            pending: this._institutesService.getPendingSetup()
        }).subscribe({
            next: (data) => {
                this.summary = data.summary;
                this.recentInstitutes = data.recent.data || [];
                this.pendingSetupInstitutes = data.pending;
                this.calculateDistributions();
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading dashboard data:', error);
                this.loading = false;
            }
        });
    }

    private calculateDistributions(): void {
        // Calculate type distribution
        const typeMap = new Map<string, number>();
        const countryMap = new Map<string, number>();

        this.recentInstitutes.forEach(institute => {
            // Type distribution
            const currentTypeCount = typeMap.get(institute.type) || 0;
            typeMap.set(institute.type, currentTypeCount + 1);

            // Country distribution
            const currentCountryCount = countryMap.get(institute.country) || 0;
            countryMap.set(institute.country, currentCountryCount + 1);
        });

        this.institutesByType = Array.from(typeMap.entries()).map(([type, count]) => ({type, count}));
        this.institutesByCountry = Array.from(countryMap.entries()).map(([country, count]) => ({country, count}));
    }

    viewUsage(instituteId: string): void {
        // Navigate to usage view or open modal
        console.log('View usage for institute:', instituteId);
    }

    completeSetup(instituteId: string): void {
        this._institutesService.completeSetup(instituteId).subscribe({
            next: () => {
                // Refresh data
                this.loadDashboardData();
            },
            error: (error) => {
                console.error('Error completing setup:', error);
            }
        });
    }

    exportAnalytics(): void {
        console.log('Export analytics clicked');
        // Implement export functionality
    }

    bulkActivate(): void {
        console.log('Bulk activate clicked');
        // Implement bulk activate functionality
    }

    bulkSuspend(): void {
        console.log('Bulk suspend clicked');
        // Implement bulk suspend functionality
    }
}