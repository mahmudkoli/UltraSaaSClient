import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { NgApexchartsModule } from 'ng-apexcharts';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { TranslocoModule } from '@ngneat/transloco';
import { ApexOptions } from 'ng-apexcharts';
import { InstituteDto, UpdateInstituteCapacityRequest, UpdateInstituteStatisticsRequest } from '../../../core/institutes/institutes.types';
import { InstitutesService } from '../../../core/institutes/institutes.service';

@Component({
    selector: 'institute-capacity',
    templateUrl: './institute-capacity.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatCardModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatProgressSpinnerModule,
        MatProgressBarModule,
        MatTabsModule,
        MatChipsModule,
        NgApexchartsModule,
        TranslocoModule,
    ],
})
export class InstituteCapacityComponent implements OnInit {
    institute?: InstituteDto;
    instituteId: string;
    capacityForm: FormGroup;
    statisticsForm: FormGroup;
    loading: boolean = false;
    saving: boolean = false;

    // Chart configurations
    capacityChartOptions: Partial<ApexOptions> = {};
    utilizationChartOptions: Partial<ApexOptions> = {};

    constructor(
        private _formBuilder: FormBuilder,
        private _institutesService: InstitutesService,
        private _router: Router,
        private _route: ActivatedRoute,
        private _fuseConfirmationService: FuseConfirmationService
    ) {
        this.instituteId = this._route.snapshot.paramMap.get('id')!;

        this.capacityForm = this._formBuilder.group({
            maxStudents: [100, [Validators.required, Validators.min(1), Validators.max(100000)]],
            maxTeachers: [10, [Validators.required, Validators.min(1), Validators.max(1000)]],
            maxStaff: [5, [Validators.required, Validators.min(1), Validators.max(500)]],
            maxClassrooms: [10, [Validators.min(1), Validators.max(1000)]],
            maxCourses: [50, [Validators.min(1), Validators.max(10000)]],
            storageLimit: [1000, [Validators.min(100), Validators.max(100000)]] // in MB
        });

        this.statisticsForm = this._formBuilder.group({
            currentStudents: [0, [Validators.required, Validators.min(0)]],
            currentTeachers: [0, [Validators.required, Validators.min(0)]],
            currentStaff: [0, [Validators.required, Validators.min(0)]],
            currentStorageUsed: [0, [Validators.min(0)]], // in MB
            activeClassrooms: [0, [Validators.min(0)]],
            activeCourses: [0, [Validators.min(0)]],
            totalEnrollments: [0, [Validators.min(0)]]
        });
    }

    ngOnInit(): void {
        this.loadInstitute();
    }

    loadInstitute(): void {
        this.loading = true;
        this._institutesService.getById(this.instituteId).subscribe({
            next: (institute) => {
                this.institute = institute;
                this.populateForms(institute);
                this.setupCharts();
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading institute:', error);
                this.loading = false;
            }
        });
    }

    populateForms(institute: InstituteDto): void {
        // Populate capacity form
        this.capacityForm.patchValue({
            maxStudents: institute.maxStudents || 100,
            maxTeachers: institute.maxTeachers || 10,
            maxStaff: institute.maxStaff || 5,
            maxClassrooms: institute.maxClassrooms || 10,
            maxCourses: institute.maxCourses || 50,
            storageLimit: institute.storageLimit || 1000
        });

        // Populate statistics form
        this.statisticsForm.patchValue({
            currentStudents: institute.currentStudents || 0,
            currentTeachers: institute.currentTeachers || 0,
            currentStaff: institute.currentStaff || 0,
            currentStorageUsed: institute.currentStorageUsed || 0,
            activeClassrooms: institute.activeClassrooms || 0,
            activeCourses: institute.activeCourses || 0,
            totalEnrollments: institute.totalEnrollments || 0
        });
    }

    setupCharts(): void {
        if (!this.institute) return;

        // Capacity Chart
        this.capacityChartOptions = {
            series: [{
                name: 'Current',
                data: [
                    this.institute.currentStudents || 0,
                    this.institute.currentTeachers || 0,
                    this.institute.currentStaff || 0
                ]
            }, {
                name: 'Maximum',
                data: [
                    this.institute.maxStudents || 100,
                    this.institute.maxTeachers || 10,
                    this.institute.maxStaff || 5
                ]
            }],
            chart: {
                type: 'bar',
                height: 350
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: '55%',
                    borderRadius: 4
                }
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                show: true,
                width: 2,
                colors: ['transparent']
            },
            xaxis: {
                categories: ['Students', 'Teachers', 'Staff']
            },
            yaxis: {
                title: {
                    text: 'Count'
                }
            },
            fill: {
                opacity: 1
            },
            tooltip: {
                y: {
                    formatter: (val: number) => val.toString()
                }
            },
            colors: ['#1976d2', '#dc3545']
        };

        // Utilization Chart
        this.utilizationChartOptions = {
            series: [
                this.getUtilizationPercentage('students'),
                this.getUtilizationPercentage('teachers'),
                this.getUtilizationPercentage('staff')
            ],
            chart: {
                type: 'donut',
                height: 300
            },
            labels: ['Students', 'Teachers', 'Staff'],
            colors: ['#1976d2', '#2ca02c', '#ff7f0e'],
            plotOptions: {
                pie: {
                    donut: {
                        size: '70%',
                        labels: {
                            show: true,
                            total: {
                                show: true,
                                label: 'Average Utilization',
                                formatter: () => {
                                    const avg = (
                                        this.getUtilizationPercentage('students') +
                                        this.getUtilizationPercentage('teachers') +
                                        this.getUtilizationPercentage('staff')
                                    ) / 3;
                                    return Math.round(avg) + '%';
                                }
                            }
                        }
                    }
                }
            },
            legend: {
                position: 'bottom'
            }
        };
    }

    updateCapacity(): void {
        if (this.capacityForm.invalid) {
            return;
        }

        this.saving = true;
        const formData = this.capacityForm.getRawValue();

        const request: UpdateInstituteCapacityRequest = {
            id: this.instituteId,
            maxStudents: formData.maxStudents,
            maxTeachers: formData.maxTeachers,
            maxStaff: formData.maxStaff,
            maxClassrooms: formData.maxClassrooms,
            maxCourses: formData.maxCourses,
            storageLimit: formData.storageLimit
        };

        this._institutesService.updateCapacity(this.instituteId, request).subscribe({
            next: () => {
                this.saving = false;
                this._fuseConfirmationService.open({
                    title: 'Success',
                    message: 'Institute capacity updated successfully!',
                    actions: {
                        confirm: { label: 'OK' }
                    }
                });
                this.loadInstitute();
            },
            error: (error) => {
                console.error('Error updating capacity:', error);
                this.saving = false;
                this._fuseConfirmationService.open({
                    title: 'Error',
                    message: 'Failed to update capacity. Please try again.',
                    actions: {
                        confirm: { label: 'OK' }
                    }
                });
            }
        });
    }

    updateStatistics(): void {
        if (this.statisticsForm.invalid) {
            return;
        }

        this.saving = true;
        const formData = this.statisticsForm.getRawValue();

        const request: UpdateInstituteStatisticsRequest = {
            id: this.instituteId,
            currentStudentCount: formData.currentStudents,
            currentTeacherCount: formData.currentTeachers,
            currentStaffCount: formData.currentStaff,
            currentStorageUsedMB: formData.currentStorageUsed
        };

        this._institutesService.updateStatistics(this.instituteId, request).subscribe({
            next: () => {
                this.saving = false;
                this._fuseConfirmationService.open({
                    title: 'Success',
                    message: 'Institute statistics updated successfully!',
                    actions: {
                        confirm: { label: 'OK' }
                    }
                });
                this.loadInstitute();
            },
            error: (error) => {
                console.error('Error updating statistics:', error);
                this.saving = false;
                this._fuseConfirmationService.open({
                    title: 'Error',
                    message: 'Failed to update statistics. Please try again.',
                    actions: {
                        confirm: { label: 'OK' }
                    }
                });
            }
        });
    }

    getUtilizationPercentage(type: 'students' | 'teachers' | 'staff'): number {
        if (!this.institute) return 0;

        switch (type) {
            case 'students':
                return this.institute.maxStudents ?
                    ((this.institute.currentStudents || 0) / this.institute.maxStudents) * 100 : 0;
            case 'teachers':
                return this.institute.maxTeachers ?
                    ((this.institute.currentTeachers || 0) / this.institute.maxTeachers) * 100 : 0;
            case 'staff':
                return this.institute.maxStaff ?
                    ((this.institute.currentStaff || 0) / this.institute.maxStaff) * 100 : 0;
            default:
                return 0;
        }
    }

    getUtilizationStatus(percentage: number): { label: string; color: string } {
        if (percentage >= 95) return { label: 'Critical', color: 'text-red-600' };
        if (percentage >= 80) return { label: 'High', color: 'text-amber-600' };
        if (percentage >= 60) return { label: 'Medium', color: 'text-blue-600' };
        if (percentage >= 30) return { label: 'Low', color: 'text-green-600' };
        return { label: 'Very Low', color: 'text-gray-600' };
    }

    validateCapacityForm(): void {
        // Add custom validation to ensure current values don't exceed max values
        const capacityData = this.capacityForm.value;
        const statisticsData = this.statisticsForm.value;

        if (statisticsData.currentStudents > capacityData.maxStudents) {
            this.statisticsForm.get('currentStudents')?.setErrors({ exceeds: true });
        }
        if (statisticsData.currentTeachers > capacityData.maxTeachers) {
            this.statisticsForm.get('currentTeachers')?.setErrors({ exceeds: true });
        }
        if (statisticsData.currentStaff > capacityData.maxStaff) {
            this.statisticsForm.get('currentStaff')?.setErrors({ exceeds: true });
        }
    }

    goBack(): void {
        this._router.navigate(['/institute']);
    }
}