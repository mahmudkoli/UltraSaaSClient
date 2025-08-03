import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { StudentHealthService } from '../../../core/student-health/student-health.service';
import { StudentsService } from '../../../core/students/students.service';
import { NotificationService } from '../../../core/services/notification.service';
import { DateUtils } from '../../../core/utils/date.utils';
import { 
    StudentHealthDto, 
    CreateStudentHealthRequest, 
    UpdateStudentHealthRequest, 
    BloodGroup 
} from '../../../core/student-health/student-health.types';
import { StudentDto } from '../../../core/students/students.types';

@Component({
    selector: 'student-health-form',
    templateUrl: './student-health-form.component.html',
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
export class StudentHealthFormComponent implements OnInit, OnDestroy {
    healthForm: FormGroup;
    isLoading = false;
    isSaving = false;
    healthId: string | null = null;
    isEditMode = false;
    health: StudentHealthDto | null = null;
    students: StudentDto[] = [];
    selectedTabIndex = 0;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    // Enum options
    bloodGroupOptions = Object.values(BloodGroup).filter(v => typeof v === 'number').map(value => ({
        value: value as BloodGroup,
        label: this.getBloodGroupLabel(value as BloodGroup)
    }));

    constructor(
        private _formBuilder: FormBuilder,
        private _studentHealthService: StudentHealthService,
        private _studentsService: StudentsService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private _route: ActivatedRoute,
        private _notificationService: NotificationService,
        private _dateUtils: DateUtils
    ) {
        this.healthForm = this._formBuilder.group({
            basicInfo: this._formBuilder.group({
                studentId: ['', Validators.required],
                bloodGroup: [''],
                height: ['', [Validators.pattern(/^\d+(\.\d+)?$/)]],
                weight: ['', [Validators.pattern(/^\d+(\.\d+)?$/)]],
                bmi: [{value: '', disabled: true}],
                visionLeft: [''],
                visionRight: [''],
                dentalHealth: [''],
                hearingStatus: ['']
            }),
            medicalInfo: this._formBuilder.group({
                physicalDisabilities: [''],
                identificationMarks: [''],
                medicalConditions: [''],
                chronicDiseases: [''],
                allergies: [''],
                medications: [''],
                vaccinationStatus: [''],
                remarks: ['']
            }),
            emergencyInfo: this._formBuilder.group({
                emergencyContact: ['', Validators.required],
                emergencyPhone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s\-\(\)]+$/)]],
                healthInsurance: [''],
                insuranceNumber: [''],
                familyDoctor: [''],
                doctorPhone: ['']
            }),
            checkupInfo: this._formBuilder.group({
                lastCheckupDate: [''],
                nextCheckupDate: ['']
            }),
            remarks: ['']
        });

        // Calculate BMI automatically when height/weight change
        this.healthForm.get('basicInfo.height')?.valueChanges.subscribe(() => this.calculateBMI());
        this.healthForm.get('basicInfo.weight')?.valueChanges.subscribe(() => this.calculateBMI());
    }

    ngOnInit(): void {
        // Get health ID from route
        this.healthId = this._route.snapshot.paramMap.get('id');
        this.isEditMode = !!this.healthId;

        // Load students for dropdown
        this.loadStudents();

        // Load health data if editing
        if (this.isEditMode && this.healthId) {
            this.loadHealth();
        } else {
            // Check for pre-filled student data from query params
            const studentId = this._route.snapshot.queryParamMap.get('studentId');
            const studentName = this._route.snapshot.queryParamMap.get('studentName');
            
            if (studentId && studentName) {
                // Pre-fill the student selection
                setTimeout(() => {
                    this.healthForm.get('basicInfo.studentId')?.setValue(studentId);
                    this.selectedTabIndex = 0; // Switch to basic info tab
                }, 100);
            }
        }
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    loadStudents(): void {
        this._studentsService.search({
            pageNumber: 1,
            pageSize: 1000,
            keyword: ''
        }).pipe(takeUntil(this._unsubscribeAll))
        .subscribe({
            next: (response) => {
                this.students = response.data;
                this._changeDetectorRef.markForCheck();
            },
            error: (error) => {
                console.error('Error loading students:', error);
                this._notificationService.error('Error loading students');
            }
        });
    }

    loadHealth(): void {
        if (!this.healthId) return;

        this.isLoading = true;
        this._changeDetectorRef.markForCheck();

        this._studentHealthService.getById(this.healthId)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (health) => {
                    this.health = health;
                    this.patchForm();
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                },
                error: (error) => {
                    console.error('Error loading health record:', error);
                    this._notificationService.error('Error loading health record');
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                }
            });
    }

    patchForm(): void {
        if (!this.health) return;

        this.healthForm.patchValue({
            basicInfo: {
                studentId: this.health.studentId,
                bloodGroup: this.health.bloodGroup,
                height: this.health.height,
                weight: this.health.weight,
                bmi: this.health.bmi,
                visionLeft: this.health.visionLeft,
                visionRight: this.health.visionRight,
                dentalHealth: this.health.dentalHealth,
                hearingStatus: this.health.hearingStatus
            },
            medicalInfo: {
                physicalDisabilities: this.health.physicalDisabilities,
                identificationMarks: this.health.identificationMarks,
                medicalConditions: this.health.medicalConditions,
                chronicDiseases: this.health.chronicDiseases,
                allergies: this.health.allergies,
                medications: this.health.medications,
                vaccinationStatus: this.health.vaccinationStatus,
                remarks: this.health.remarks
            },
            emergencyInfo: {
                emergencyContact: this.health.emergencyContact,
                emergencyPhone: this.health.emergencyPhone,
                healthInsurance: this.health.healthInsurance,
                insuranceNumber: this.health.insuranceNumber,
                familyDoctor: this.health.familyDoctor,
                doctorPhone: this.health.doctorPhone
            },
            checkupInfo: {
                lastCheckupDate: this.health.lastCheckupDate ? new Date(this.health.lastCheckupDate) : null,
                nextCheckupDate: this.health.nextCheckupDate ? new Date(this.health.nextCheckupDate) : null
            },
            remarks: this.health.remarks
        });
    }

    calculateBMI(): void {
        const height = this.healthForm.get('basicInfo.height')?.value;
        const weight = this.healthForm.get('basicInfo.weight')?.value;
        
        if (height && weight && height > 0 && weight > 0) {
            const heightInMeters = parseFloat(height) / 100; // Convert cm to meters
            const bmi = parseFloat(weight) / (heightInMeters * heightInMeters);
            this.healthForm.get('basicInfo.bmi')?.setValue(bmi.toFixed(1));
        } else {
            this.healthForm.get('basicInfo.bmi')?.setValue('');
        }
    }

    save(): void {
        if (this.healthForm.invalid) {
            return;
        }

        this.isSaving = true;
        this._changeDetectorRef.markForCheck();

        if (this.isEditMode) {
            this.updateHealth();
        } else {
            this.createHealth();
        }
    }

    createHealth(): void {
        const formValue = this.healthForm.value;

        const createRequest: CreateStudentHealthRequest = {
            studentId: formValue.basicInfo.studentId,
            bloodGroup: formValue.basicInfo.bloodGroup || undefined,
            height: formValue.basicInfo.height ? String(formValue.basicInfo.height) : undefined,
            weight: formValue.basicInfo.weight ? String(formValue.basicInfo.weight) : undefined,
            medicalConditions: formValue.medicalInfo.medicalConditions || undefined,
            allergies: formValue.medicalInfo.allergies || undefined,
            emergencyContact: formValue.emergencyInfo.emergencyContact || undefined,
            emergencyPhone: formValue.emergencyInfo.emergencyPhone || undefined,
            familyDoctor: formValue.emergencyInfo.familyDoctor || undefined,
            doctorPhone: formValue.emergencyInfo.doctorPhone || undefined,
            remarks: formValue.medicalInfo.remarks || undefined
        };

        this._studentHealthService.create(createRequest)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (response) => {
                    this.isSaving = false;
                    this._changeDetectorRef.markForCheck();
                    this._notificationService.success('Health record created successfully');
                    this._router.navigate(['/student-health']);
                },
                error: (error) => {
                    console.error('Create health record error details:', error);
                    this.isSaving = false;
                    this._changeDetectorRef.markForCheck();
                    this._notificationService.error('Error creating health record');
                }
            });
    }

    updateHealth(): void {
        if (!this.health?.id) return;

        const formValue = this.healthForm.value;

        const updateRequest: UpdateStudentHealthRequest = {
            id: this.health.id,
            studentId: formValue.basicInfo.studentId,
            bloodGroup: formValue.basicInfo.bloodGroup || undefined,
            height: formValue.basicInfo.height ? String(formValue.basicInfo.height) : undefined,
            weight: formValue.basicInfo.weight ? String(formValue.basicInfo.weight) : undefined,
            medicalConditions: formValue.medicalInfo.medicalConditions || undefined,
            allergies: formValue.medicalInfo.allergies || undefined,
            emergencyContact: formValue.emergencyInfo.emergencyContact || undefined,
            emergencyPhone: formValue.emergencyInfo.emergencyPhone || undefined,
            familyDoctor: formValue.emergencyInfo.familyDoctor || undefined,
            doctorPhone: formValue.emergencyInfo.doctorPhone || undefined,
            remarks: formValue.medicalInfo.remarks || undefined
        };

        this._studentHealthService.update(this.health.id, updateRequest)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (response) => {
                    this.isSaving = false;
                    this._changeDetectorRef.markForCheck();
                    this._notificationService.success('Health record updated successfully');
                    this._router.navigate(['/student-health']);
                },
                error: (error) => {
                    console.error('Update health record error details:', error);
                    this.isSaving = false;
                    this._changeDetectorRef.markForCheck();
                    this._notificationService.error('Error updating health record');
                }
            });
    }

    cancel(): void {
        this._router.navigate(['/student-health']);
    }

    getPageTitle(): string {
        return this.isEditMode ? 'Edit Health Record' : 'Create Health Record';
    }

    getSaveButtonText(): string {
        return this.isSaving ? 'Saving...' : (this.isEditMode ? 'Update Health Record' : 'Create Health Record');
    }

    getBloodGroupLabel(bloodGroup: BloodGroup): string {
        const labels = {
            [BloodGroup.APositive]: 'A+',
            [BloodGroup.ANegative]: 'A-',
            [BloodGroup.BPositive]: 'B+',
            [BloodGroup.BNegative]: 'B-',
            [BloodGroup.ABPositive]: 'AB+',
            [BloodGroup.ABNegative]: 'AB-',
            [BloodGroup.OPositive]: 'O+',
            [BloodGroup.ONegative]: 'O-'
        };
        return labels[bloodGroup] || 'Unknown';
    }

    getStudentName(studentId: string): string {
        const student = this.students.find(s => s.id === studentId);
        return student ? `${student.firstName} ${student.lastName}` : '';
    }
} 