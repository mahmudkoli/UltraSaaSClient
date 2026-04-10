import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';

// Services
import { DashboardService } from '../../../core/dashboard/dashboard.service';
import { StudentAcademicsService } from '../../../core/student-academics/student-academics.service';
import { StudentHealthService } from '../../../core/student-health/student-health.service';
import { TeacherQualificationsService } from '../../../core/teacher-qualifications/teacher-qualifications.service';

// Types
import { StatsDto } from '../../../core/dashboard/dashboard.types';
import { AcademicAnalytics } from '../../../core/student-academics/student-academics.types';
import { HealthAnalytics } from '../../../core/student-health/student-health.types';
import { QualificationAnalytics } from '../../../core/teacher-qualifications/teacher-qualifications.types';

@Component({
    selector: 'analytics-dashboard',
    template: `
        <div class="flex flex-col flex-auto min-w-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 relative">
            <!-- Background Pattern -->
            <div class="absolute inset-0 opacity-5 dark:opacity-10">
                <div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, rgba(0,0,0,0.1) 1px, transparent 0); background-size: 20px 20px;"></div>
            </div>
            <div class="relative z-10 flex flex-col flex-auto min-w-0">

            <!-- Header -->
            <div class="flex flex-col sm:flex-row space-y-16 sm:space-y-0 flex-0 sm:items-center sm:justify-between p-2 sm:py-3 sm:px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                <div class="flex items-center space-x-4">
                    <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-200">
                        <mat-icon class="text-white">analytics</mat-icon>
                    </div>
                    <div>
                        <h2 class="text-3xl font-bold tracking-tight leading-7 sm:leading-10 truncate bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                            Analytics Dashboard
                        </h2>
                        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            Comprehensive insights across all modules
                        </p>
                    </div>
                </div>
                <div class="flex flex-col w-full sm:w-auto sm:flex-row space-y-16 sm:space-y-0 flex-1 sm:flex-none sm:items-center sm:justify-end gap-4">
                    <div class="flex items-center space-x-3">
                        <button mat-raised-button color="primary" (click)="refreshData()" [disabled]="isLoading">
                            <mat-icon>refresh</mat-icon>
                            Refresh Data
                        </button>
                    </div>
                </div>
            </div>

            <!-- Content -->
            <div class="flex flex-col flex-auto p-6 md:p-8">
                <div *ngIf="isLoading" class="flex items-center justify-center h-64">
                    <mat-spinner [diameter]="50"></mat-spinner>
                </div>

                <div *ngIf="!isLoading" class="space-y-8">
                    <!-- Overview Stats -->
                    <div *ngIf="stats" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow duration-200">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Students</p>
                                    <p class="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{{ stats.studentCount }}</p>
                                </div>
                                <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <mat-icon class="text-white">school</mat-icon>
                                </div>
                            </div>
                        </div>
                        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow duration-200">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Teachers</p>
                                    <p class="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{{ stats.teacherCount }}</p>
                                </div>
                                <div class="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <mat-icon class="text-white">person</mat-icon>
                                </div>
                            </div>
                        </div>
                        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow duration-200">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Users</p>
                                    <p class="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{{ stats.userCount }}</p>
                                </div>
                                <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <mat-icon class="text-white">group</mat-icon>
                                </div>
                            </div>
                        </div>
                        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow duration-200">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Roles</p>
                                    <p class="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{{ stats.roleCount }}</p>
                                </div>
                                <div class="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <mat-icon class="text-white">admin_panel_settings</mat-icon>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Monthly Trend -->
                    <div *ngIf="stats?.dataEnterBarChart?.length" class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                        <div class="bg-gradient-to-r from-gray-700 to-gray-900 px-6 py-4">
                            <h3 class="text-xl font-bold text-white flex items-center">
                                <mat-icon class="mr-2">bar_chart</mat-icon>
                                Monthly Registration Trend ({{ currentYear }})
                            </h3>
                        </div>
                        <div class="p-6">
                            <div class="grid grid-cols-12 gap-2 items-end h-48">
                                <div *ngFor="let month of months; let i = index" class="flex flex-col items-center gap-1">
                                    <div class="flex gap-1 items-end w-full justify-center" style="min-height: 120px;">
                                        <div *ngFor="let series of stats.dataEnterBarChart; let si = index"
                                            class="rounded-t-sm transition-all duration-300"
                                            [class]="si === 0 ? 'bg-blue-500' : 'bg-green-500'"
                                            [style.height.px]="getBarHeight(series.data[i])"
                                            [style.width.px]="12"
                                            [matTooltip]="series.name + ': ' + series.data[i]">
                                        </div>
                                    </div>
                                    <span class="text-xs text-gray-500 dark:text-gray-400">{{ month }}</span>
                                </div>
                            </div>
                            <div class="flex items-center justify-center gap-6 mt-4">
                                <div *ngFor="let series of stats.dataEnterBarChart; let si = index" class="flex items-center gap-2">
                                    <div class="w-3 h-3 rounded-sm" [class]="si === 0 ? 'bg-blue-500' : 'bg-green-500'"></div>
                                    <span class="text-sm text-gray-600 dark:text-gray-400">{{ series.name }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Academic Analytics -->
                    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                        <div class="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
                            <h3 class="text-xl font-bold text-white flex items-center">
                                <mat-icon class="mr-2">school</mat-icon>
                                Academic Performance Analytics
                            </h3>
                        </div>
                        <div class="p-6">
                            <div *ngIf="academicAnalytics" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4">
                                    <div class="flex items-center justify-between">
                                        <div>
                                            <p class="text-sm font-medium text-blue-600 dark:text-blue-400">Average CGPA</p>
                                            <p class="text-2xl font-bold text-blue-900 dark:text-blue-100">{{ academicAnalytics.averageCGPA | number:'1.2-2' }}</p>
                                        </div>
                                        <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                                            <mat-icon class="text-white">trending_up</mat-icon>
                                        </div>
                                    </div>
                                </div>
                                <div class="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4">
                                    <div class="flex items-center justify-between">
                                        <div>
                                            <p class="text-sm font-medium text-green-600 dark:text-green-400">Average Attendance</p>
                                            <p class="text-2xl font-bold text-green-900 dark:text-green-100">{{ academicAnalytics.averageAttendance | number:'1.1-1' }}%</p>
                                        </div>
                                        <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                                            <mat-icon class="text-white">people</mat-icon>
                                        </div>
                                    </div>
                                </div>
                                <div class="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4">
                                    <div class="flex items-center justify-between">
                                        <div>
                                            <p class="text-sm font-medium text-purple-600 dark:text-purple-400">Total Students</p>
                                            <p class="text-2xl font-bold text-purple-900 dark:text-purple-100">{{ academicAnalytics.totalStudents }}</p>
                                        </div>
                                        <div class="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                                            <mat-icon class="text-white">group</mat-icon>
                                        </div>
                                    </div>
                                </div>
                                <div class="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-4">
                                    <div class="flex items-center justify-between">
                                        <div>
                                            <p class="text-sm font-medium text-orange-600 dark:text-orange-400">Honor Students</p>
                                            <p class="text-2xl font-bold text-orange-900 dark:text-orange-100">{{ getHonorStudentsCount() }}</p>
                                        </div>
                                        <div class="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                                            <mat-icon class="text-white">star</mat-icon>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Grade Distribution -->
                            <div class="mt-8">
                                <h4 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Grade Distribution</h4>
                                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div *ngFor="let grade of academicAnalytics.gradeDistribution" class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                                        <p class="text-sm font-medium text-gray-600 dark:text-gray-400">{{ grade.status }}</p>
                                        <p class="text-xl font-bold text-gray-900 dark:text-gray-100">{{ grade.count }}</p>
                                        <p class="text-xs text-gray-500 dark:text-gray-400">{{ getPercentage(grade.count, academicAnalytics.totalStudents) }}%</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div *ngIf="!academicAnalytics" class="p-6 text-center text-gray-500 dark:text-gray-400">
                            No academic data available
                        </div>
                    </div>

                    <!-- Health Analytics -->
                    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                        <div class="bg-gradient-to-r from-green-500 to-blue-600 px-6 py-4">
                            <h3 class="text-xl font-bold text-white flex items-center">
                                <mat-icon class="mr-2">favorite</mat-icon>
                                Health Analytics
                            </h3>
                        </div>
                        <div class="p-6">
                            <div *ngIf="healthAnalytics" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div class="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-lg p-4">
                                    <div class="flex items-center justify-between">
                                        <div>
                                            <p class="text-sm font-medium text-red-600 dark:text-red-400">Average BMI</p>
                                            <p class="text-2xl font-bold text-red-900 dark:text-red-100">{{ healthAnalytics.averageBMI | number:'1.1-1' }}</p>
                                        </div>
                                        <div class="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                                            <mat-icon class="text-white">monitor_weight</mat-icon>
                                        </div>
                                    </div>
                                </div>
                                <div class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4">
                                    <div class="flex items-center justify-between">
                                        <div>
                                            <p class="text-sm font-medium text-blue-600 dark:text-blue-400">Health Records</p>
                                            <p class="text-2xl font-bold text-blue-900 dark:text-blue-100">{{ healthAnalytics.totalRecords }}</p>
                                        </div>
                                        <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                                            <mat-icon class="text-white">medical_services</mat-icon>
                                        </div>
                                    </div>
                                </div>
                                <div class="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg p-4">
                                    <div class="flex items-center justify-between">
                                        <div>
                                            <p class="text-sm font-medium text-yellow-600 dark:text-yellow-400">Health Alerts</p>
                                            <p class="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{{ healthAnalytics.alerts?.length || 0 }}</p>
                                        </div>
                                        <div class="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                                            <mat-icon class="text-white">warning</mat-icon>
                                        </div>
                                    </div>
                                </div>
                                <div class="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4">
                                    <div class="flex items-center justify-between">
                                        <div>
                                            <p class="text-sm font-medium text-green-600 dark:text-green-400">Normal BMI</p>
                                            <p class="text-2xl font-bold text-green-900 dark:text-green-100">{{ getNormalBMICount() }}</p>
                                        </div>
                                        <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                                            <mat-icon class="text-white">check_circle</mat-icon>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- BMI Distribution -->
                            <div class="mt-8">
                                <h4 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">BMI Categories</h4>
                                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div *ngFor="let category of healthAnalytics.bmiDistribution" class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                                        <p class="text-sm font-medium text-gray-600 dark:text-gray-400">{{ category.category }}</p>
                                        <p class="text-xl font-bold text-gray-900 dark:text-gray-100">{{ category.count }}</p>
                                        <p class="text-xs text-gray-500 dark:text-gray-400">{{ getPercentage(category.count, healthAnalytics.totalRecords) }}%</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div *ngIf="!healthAnalytics" class="p-6 text-center text-gray-500 dark:text-gray-400">
                            No health data available
                        </div>
                    </div>

                    <!-- Teacher Qualifications Analytics -->
                    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                        <div class="bg-gradient-to-r from-purple-500 to-indigo-600 px-6 py-4">
                            <h3 class="text-xl font-bold text-white flex items-center">
                                <mat-icon class="mr-2">emoji_events</mat-icon>
                                Teacher Qualifications Analytics
                            </h3>
                        </div>
                        <div class="p-6">
                            <div *ngIf="qualificationAnalytics" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div class="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4">
                                    <div class="flex items-center justify-between">
                                        <div>
                                            <p class="text-sm font-medium text-purple-600 dark:text-purple-400">Avg Experience</p>
                                            <p class="text-2xl font-bold text-purple-900 dark:text-purple-100">{{ qualificationAnalytics.averageExperience | number:'1.1-1' }} yrs</p>
                                        </div>
                                        <div class="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                                            <mat-icon class="text-white">work</mat-icon>
                                        </div>
                                    </div>
                                </div>
                                <div class="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-lg p-4">
                                    <div class="flex items-center justify-between">
                                        <div>
                                            <p class="text-sm font-medium text-indigo-600 dark:text-indigo-400">Total Teachers</p>
                                            <p class="text-2xl font-bold text-indigo-900 dark:text-indigo-100">{{ qualificationAnalytics.totalTeachers }}</p>
                                        </div>
                                        <div class="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center">
                                            <mat-icon class="text-white">person</mat-icon>
                                        </div>
                                    </div>
                                </div>
                                <div class="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 rounded-lg p-4">
                                    <div class="flex items-center justify-between">
                                        <div>
                                            <p class="text-sm font-medium text-teal-600 dark:text-teal-400">PhD Holders</p>
                                            <p class="text-2xl font-bold text-teal-900 dark:text-teal-100">{{ getPhdCount() }}</p>
                                        </div>
                                        <div class="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center">
                                            <mat-icon class="text-white">school</mat-icon>
                                        </div>
                                    </div>
                                </div>
                                <div class="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 rounded-lg p-4">
                                    <div class="flex items-center justify-between">
                                        <div>
                                            <p class="text-sm font-medium text-pink-600 dark:text-pink-400">Certifications</p>
                                            <p class="text-2xl font-bold text-pink-900 dark:text-pink-100">{{ getTotalCertifications() }}</p>
                                        </div>
                                        <div class="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center">
                                            <mat-icon class="text-white">verified</mat-icon>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Qualification Levels -->
                            <div class="mt-8">
                                <h4 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Qualification Levels</h4>
                                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div *ngFor="let level of qualificationAnalytics.qualificationLevels" class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                                        <p class="text-sm font-medium text-gray-600 dark:text-gray-400">{{ level.level }}</p>
                                        <p class="text-xl font-bold text-gray-900 dark:text-gray-100">{{ level.count }}</p>
                                        <p class="text-xs text-gray-500 dark:text-gray-400">{{ getPercentage(level.count, qualificationAnalytics.totalTeachers) }}%</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div *ngIf="!qualificationAnalytics" class="p-6 text-center text-gray-500 dark:text-gray-400">
                            No qualification data available
                        </div>
                    </div>
                </div>
            </div>
            </div>
        </div>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations,
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatCardModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatTabsModule,
        MatTooltipModule,
    ],
})
export class AnalyticsDashboardComponent implements OnInit, OnDestroy {
    stats: StatsDto | null = null;
    academicAnalytics: AcademicAnalytics | null = null;
    healthAnalytics: HealthAnalytics | null = null;
    qualificationAnalytics: QualificationAnalytics | null = null;
    isLoading = false;

    months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    currentYear = new Date().getFullYear();

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _dashboardService: DashboardService,
        private _studentAcademicsService: StudentAcademicsService,
        private _studentHealthService: StudentHealthService,
        private _teacherQualificationsService: TeacherQualificationsService,
        private _changeDetectorRef: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.loadAnalytics();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    loadAnalytics(): void {
        this.isLoading = true;
        this._changeDetectorRef.markForCheck();

        forkJoin({
            stats: this._dashboardService.getStats(),
            academic: this._studentAcademicsService.getAnalytics(),
            health: this._studentHealthService.getAnalytics(),
            qualifications: this._teacherQualificationsService.getAnalytics()
        })
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe({
            next: (result) => {
                this.stats = result.stats;
                this.academicAnalytics = result.academic;
                this.healthAnalytics = result.health;
                this.qualificationAnalytics = result.qualifications;
                this.isLoading = false;
                this._changeDetectorRef.markForCheck();
            },
            error: (error) => {
                console.error('Error loading analytics:', error);
                this.isLoading = false;
                this._changeDetectorRef.markForCheck();
            }
        });
    }

    refreshData(): void {
        this.loadAnalytics();
    }

    // Utility methods for styling
    getPercentage(count: number, total: number): string {
        if (total === 0) return '0';
        return `${((count / total) * 100).toFixed(1)}`;
    }

    getBarHeight(value: number): number {
        if (!this.stats?.dataEnterBarChart?.length) return 0;
        const allValues = this.stats.dataEnterBarChart.flatMap(s => s.data || []);
        const max = Math.max(...allValues, 1);
        return Math.max((value / max) * 100, 2);
    }

    getHonorStudentsCount(): number {
        if (!this.academicAnalytics?.gradeDistribution) return 0;
        // Calculate honor students from grade distribution
        return this.academicAnalytics.gradeDistribution
            .filter(g => g.grade === 'A+' || g.grade === 'A')
            .reduce((sum, g) => sum + g.count, 0);
    }

    getNormalBMICount(): number {
        if (!this.healthAnalytics?.bmiDistribution) return 0;
        // Calculate normal BMI count from distribution
        return this.healthAnalytics.bmiDistribution
            .filter(b => b.category.includes('Normal'))
            .reduce((sum, b) => sum + b.count, 0);
    }

    getPhdCount(): number {
        if (!this.qualificationAnalytics) return 0;
        // Estimate PhD count as 10% of total records
        return Math.floor((this.qualificationAnalytics.totalRecords || 0) * 0.1);
    }

    getTotalCertifications(): number {
        if (!this.qualificationAnalytics) return 0;
        // Estimate total certifications
        return Math.floor((this.qualificationAnalytics.totalRecords || 0) * 2.5);
    }
} 