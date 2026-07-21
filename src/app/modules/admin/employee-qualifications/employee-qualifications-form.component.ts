import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { EmployeeQualificationsService } from '../../../core/employee-qualifications/employee-qualifications.service';
import { EmployeesService } from '../../../core/employees/employees.service';
import { NotificationService } from '../../../core/services/notification.service';
import { 
    EmployeeQualificationDto, 
    CreateEmployeeQualificationRequest, 
    UpdateEmployeeQualificationRequest 
} from '../../../core/employee-qualifications/employee-qualifications.types';
import { EmployeeDto } from '../../../core/employees/employees.types';

@Component({
    selector: 'employee-qualifications-form',
    templateUrl: './employee-qualifications-form.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations,
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        MatTabsModule,
        MatCheckboxModule,
        MatSnackBarModule
    ]
})
export class EmployeeQualificationsFormComponent implements OnInit, OnDestroy {
    qualificationForm: FormGroup;
    isLoading = false;
    isSaving = false;
    qualificationId: string | null = null;
    isEditMode = false;
    qualification: EmployeeQualificationDto | null = null;
    employees: EmployeeDto[] = [];
    selectedTabIndex = 0;
    currentYear = new Date().getFullYear();

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    // Qualification options
    qualificationOptions = [
        { value: 'High School', label: 'High School' },
        { value: 'Intermediate', label: 'Intermediate (12th)' },
        { value: 'Diploma', label: 'Diploma' },
        { value: 'Bachelor\'s Degree', label: 'Bachelor\'s Degree' },
        { value: 'Master\'s Degree', label: 'Master\'s Degree' },
        { value: 'PhD', label: 'PhD' },
        { value: 'Post Doctorate', label: 'Post Doctorate' },
        { value: 'Professional Certificate', label: 'Professional Certificate' }
    ];

    gradeOptions = [
        { value: 'A+', label: 'A+ (90-100%)' },
        { value: 'A', label: 'A (80-89%)' },
        { value: 'B+', label: 'B+ (70-79%)' },
        { value: 'B', label: 'B (60-69%)' },
        { value: 'C+', label: 'C+ (50-59%)' },
        { value: 'C', label: 'C (40-49%)' },
        { value: 'D', label: 'D (Below 40%)' },
        { value: 'First Class', label: 'First Class' },
        { value: 'Second Class', label: 'Second Class' },
        { value: 'Third Class', label: 'Third Class' }
    ];

    divisionOptions = [
        { value: 'First Division', label: 'First Division' },
        { value: 'Second Division', label: 'Second Division' },
        { value: 'Third Division', label: 'Third Division' },
        { value: 'Distinction', label: 'Distinction' },
        { value: 'Honours', label: 'Honours' }
    ];

    constructor(
        private _formBuilder: FormBuilder,
        private _employeeQualificationsService: EmployeeQualificationsService,
        private _employeesService: EmployeesService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private _route: ActivatedRoute,
        private _notificationService: NotificationService
    ) {
        this.qualificationForm = this._formBuilder.group({
            basicInfo: this._formBuilder.group({
                employeeId: ['', Validators.required],
                highestQualification: ['', Validators.required],
                university: [''],
                college: [''],
                yearOfPassing: ['', [Validators.min(1950), Validators.max(this.currentYear)]],
                percentage: ['', [Validators.min(0), Validators.max(100)]]
            }),
            academicDetails: this._formBuilder.group({
                qualificationDetails: [''],
                grade: [''],
                division: [''],
                subject: [''],
                specialization: [''],
                additionalQualifications: [''],
                postGraduateQualifications: [''],
                researchQualifications: ['']
            }),
            professionalInfo: this._formBuilder.group({
                certifications: [''],
                experience: [''],
                teachingExperience: ['', [Validators.min(0)]],
                industryExperience: ['', [Validators.min(0)]],
                publications: [''],
                awards: [''],
                skillSet: [''],
                languagesKnown: ['']
            })
        });
    }

    ngOnInit(): void {
        // Get qualification ID from route
        this.qualificationId = this._route.snapshot.paramMap.get('id');
        this.isEditMode = !!this.qualificationId;

        // Load employees for dropdown
        this.loadEmployees();

        // Load qualification data if editing
        if (this.isEditMode && this.qualificationId) {
            this.loadQualification();
        } else {
            // Check for pre-filled employee data from query params
            const employeeId = this._route.snapshot.queryParamMap.get('employeeId');
            const employeeName = this._route.snapshot.queryParamMap.get('employeeName');
            
            if (employeeId && employeeName) {
                // Pre-fill the employee selection
                setTimeout(() => {
                    this.qualificationForm.get('basicInfo.employeeId')?.setValue(employeeId);
                    this.selectedTabIndex = 0; // Switch to basic info tab
                }, 100);
            }
        }
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    loadEmployees(): void {
        this._employeesService.search({
            pageNumber: 1,
            pageSize: 1000,
            keyword: ''
        }).pipe(takeUntil(this._unsubscribeAll))
        .subscribe({
            next: (response) => {
                this.employees = response.data;
                this._changeDetectorRef.markForCheck();
            },
            error: (error) => {
                console.error('Error loading employees:', error);
                this._notificationService.error('Error loading employees');
            }
        });
    }

    loadQualification(): void {
        if (!this.qualificationId) return;

        this.isLoading = true;
        this._changeDetectorRef.markForCheck();

        this._employeeQualificationsService.getById(this.qualificationId)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (qualification) => {
                    this.qualification = qualification;
                    this.patchForm();
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                },
                error: (error) => {
                    console.error('Error loading qualification record:', error);
                    this._notificationService.error('Error loading qualification record');
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                }
            });
    }

    patchForm(): void {
        if (!this.qualification) return;

        this.qualificationForm.patchValue({
            basicInfo: {
                employeeId: this.qualification.employeeId,
                highestQualification: this.qualification.highestQualification,
                university: this.qualification.university,
                college: this.qualification.college,
                yearOfPassing: this.qualification.yearOfPassing,
                percentage: this.qualification.percentage
            },
            academicDetails: {
                qualificationDetails: this.qualification.qualificationDetails,
                grade: this.qualification.grade,
                division: this.qualification.division,
                subject: this.qualification.subject,
                specialization: this.qualification.specialization,
                additionalQualifications: this.qualification.additionalQualifications,
                postGraduateQualifications: this.qualification.postGraduateQualifications,
                researchQualifications: this.qualification.researchQualifications
            },
            professionalInfo: {
                certifications: this.qualification.certifications,
                experience: this.qualification.experience,
                teachingExperience: this.qualification.teachingExperience,
                industryExperience: this.qualification.industryExperience,
                publications: this.qualification.publications,
                awards: this.qualification.awards,
                skillSet: this.qualification.skillSet,
                languagesKnown: this.qualification.languagesKnown
            }
        });
    }

    save(): void {
        if (this.qualificationForm.invalid) {
            return;
        }

        this.isSaving = true;
        this._changeDetectorRef.markForCheck();

        if (this.isEditMode) {
            this.updateQualification();
        } else {
            this.createQualification();
        }
    }

    createQualification(): void {
        const formValue = this.qualificationForm.value;

        const createRequest: CreateEmployeeQualificationRequest = {
            employeeId: formValue.basicInfo.employeeId,
            highestQualification: formValue.basicInfo.highestQualification || undefined,
            university: formValue.basicInfo.university || undefined,
            college: formValue.basicInfo.college || undefined,
            yearOfPassing: formValue.basicInfo.yearOfPassing || undefined,
            percentage: formValue.basicInfo.percentage || undefined
        };

        this._employeeQualificationsService.create(createRequest)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (response) => {
                    this.isSaving = false;
                    this._changeDetectorRef.markForCheck();
                    this._notificationService.success('Employee qualification created successfully');
                    this._router.navigate(['/employee-qualifications']);
                },
                error: (error) => {
                    console.error('Create qualification record error details:', error);
                    this.isSaving = false;
                    this._changeDetectorRef.markForCheck();
                    this._notificationService.error('Error creating qualification record');
                }
            });
    }

    updateQualification(): void {
        if (!this.qualification?.id) return;

        const formValue = this.qualificationForm.value;

        const updateRequest: UpdateEmployeeQualificationRequest = {
            id: this.qualification.id,
            employeeId: formValue.basicInfo.employeeId,
            highestQualification: formValue.basicInfo.highestQualification || undefined,
            university: formValue.basicInfo.university || undefined,
            college: formValue.basicInfo.college || undefined,
            yearOfPassing: formValue.basicInfo.yearOfPassing || undefined,
            percentage: formValue.basicInfo.percentage || undefined
        };

        this._employeeQualificationsService.update(this.qualification.id, updateRequest)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (response) => {
                    this.isSaving = false;
                    this._changeDetectorRef.markForCheck();
                    this._notificationService.success('Employee qualification updated successfully');
                    this._router.navigate(['/employee-qualifications']);
                },
                error: (error) => {
                    console.error('Update qualification record error details:', error);
                    this.isSaving = false;
                    this._changeDetectorRef.markForCheck();
                    this._notificationService.error('Error updating qualification record');
                }
            });
    }

    cancel(): void {
        this._router.navigate(['/employee-qualifications']);
    }

    getPageTitle(): string {
        return this.isEditMode ? 'Edit Employee Qualification' : 'Create Employee Qualification';
    }

    getSaveButtonText(): string {
        return this.isSaving ? 'Saving...' : (this.isEditMode ? 'Update Qualification' : 'Create Qualification');
    }

    getEmployeeName(employeeId: string): string {
        const employee = this.employees.find(t => t.id === employeeId);
        return employee ? `${employee.firstName} ${employee.lastName}` : '';
    }
} 