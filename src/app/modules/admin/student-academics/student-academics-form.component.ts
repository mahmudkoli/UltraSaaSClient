import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';

import { StudentAcademicsService } from '../../../core/student-academics/student-academics.service';
import { StudentsService } from '../../../core/students/students.service';
import { NotificationService } from '../../../core/services/notification.service';
import { 
    StudentAcademicDto, 
    CreateStudentAcademicRequest, 
    UpdateStudentAcademicRequest, 
    AcademicStatus 
} from '../../../core/student-academics/student-academics.types';
import { StudentDto } from '../../../core/students/students.types';

@Component({
    selector: 'student-academics-form',
    templateUrl: './student-academics-form.component.html',
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
export class StudentAcademicsFormComponent implements OnInit, OnDestroy {
    academicForm: FormGroup;
    isLoading = false;
    isSaving = false;
    academicId: string | null = null;
    isEditMode = false;
    academic: StudentAcademicDto | null = null;
    students: StudentDto[] = [];
    selectedTabIndex = 0;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    // Enum options
    academicStatusOptions = Object.values(AcademicStatus).filter(v => typeof v === 'number').map(value => ({
        value: value as AcademicStatus,
        label: this.getAcademicStatusLabel(value as AcademicStatus)
    }));

    gradeOptions = [
        { value: 'A+', label: 'A+ (90-100%)' },
        { value: 'A', label: 'A (80-89%)' },
        { value: 'B+', label: 'B+ (70-79%)' },
        { value: 'B', label: 'B (60-69%)' },
        { value: 'C+', label: 'C+ (50-59%)' },
        { value: 'C', label: 'C (40-49%)' },
        { value: 'D', label: 'D (Below 40%)' },
        { value: 'F', label: 'F (Fail)' }
    ];

    constructor(
        private _formBuilder: FormBuilder,
        private _studentAcademicsService: StudentAcademicsService,
        private _studentsService: StudentsService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private _route: ActivatedRoute,
        private _notificationService: NotificationService
    ) {
        this.academicForm = this._formBuilder.group({
            basicInfo: this._formBuilder.group({
                studentId: ['', Validators.required],
                academicYear: ['', Validators.required],
                semester: [''],
                section: [''],
                stream: [''],
                batch: [''],
                currentClass: [''],
                currentSubject: ['']
            }),
            performanceInfo: this._formBuilder.group({
                cgpa: ['', [Validators.min(0), Validators.max(10)]],
                gpa: ['', [Validators.min(0), Validators.max(10)]],
                grade: [''],
                attendancePercentage: ['', [Validators.min(0), Validators.max(100)]],
                totalCredits: ['', [Validators.min(0)]],
                creditsEarned: ['', [Validators.min(0)]],
                rank: ['', [Validators.min(1)]],
                totalStudents: ['', [Validators.min(1)]]
            }),
            scholarshipInfo: this._formBuilder.group({
                isScholarshipHolder: [false],
                scholarshipType: [''],
                scholarshipAmount: ['', [Validators.min(0)]],
                academicStatus: [AcademicStatus.Active]
            })
        });

        // Enable/disable scholarship fields based on checkbox
        this.academicForm.get('scholarshipInfo.isScholarshipHolder')?.valueChanges.subscribe((isHolder) => {
            const scholarshipType = this.academicForm.get('scholarshipInfo.scholarshipType');
            const scholarshipAmount = this.academicForm.get('scholarshipInfo.scholarshipAmount');
            
            if (isHolder) {
                scholarshipType?.setValidators([Validators.required]);
                scholarshipAmount?.setValidators([Validators.required, Validators.min(0)]);
            } else {
                scholarshipType?.clearValidators();
                scholarshipAmount?.clearValidators();
                scholarshipType?.setValue('');
                scholarshipAmount?.setValue('');
            }
            
            scholarshipType?.updateValueAndValidity();
            scholarshipAmount?.updateValueAndValidity();
        });
    }

    ngOnInit(): void {
        // Get academic ID from route
        this.academicId = this._route.snapshot.paramMap.get('id');
        this.isEditMode = !!this.academicId;

        // Load students for dropdown
        this.loadStudents();

        // Load academic data if editing
        if (this.isEditMode && this.academicId) {
            this.loadAcademic();
        } else {
            // Check for pre-filled student data from query params
            const studentId = this._route.snapshot.queryParamMap.get('studentId');
            const studentName = this._route.snapshot.queryParamMap.get('studentName');
            
            if (studentId && studentName) {
                // Pre-fill the student selection
                setTimeout(() => {
                    this.academicForm.get('basicInfo.studentId')?.setValue(studentId);
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

    loadAcademic(): void {
        if (!this.academicId) return;

        this.isLoading = true;
        this._changeDetectorRef.markForCheck();

        this._studentAcademicsService.getById(this.academicId)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (academic) => {
                    this.academic = academic;
                    this.patchForm();
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                },
                error: (error) => {
                    console.error('Error loading academic record:', error);
                    this._notificationService.error('Error loading academic record');
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                }
            });
    }

    patchForm(): void {
        if (!this.academic) return;

        this.academicForm.patchValue({
            basicInfo: {
                studentId: this.academic.studentId,
                academicYear: this.academic.academicYear,
                semester: this.academic.semester,
                section: this.academic.section,
                stream: this.academic.stream,
                batch: this.academic.batch,
                currentClass: this.academic.currentClass,
                currentSubject: this.academic.currentSubject
            },
            performanceInfo: {
                cgpa: this.academic.cgpa,
                gpa: this.academic.gpa,
                grade: this.academic.grade,
                attendancePercentage: this.academic.attendancePercentage,
                totalCredits: this.academic.totalCredits,
                creditsEarned: this.academic.creditsEarned,
                rank: this.academic.rank,
                totalStudents: this.academic.totalStudents
            },
            scholarshipInfo: {
                isScholarshipHolder: this.academic.isScholarshipHolder,
                scholarshipType: this.academic.scholarshipType,
                scholarshipAmount: this.academic.scholarshipAmount,
                academicStatus: this.academic.academicStatus
            }
        });
    }

    save(): void {
        if (this.academicForm.invalid) {
            return;
        }

        this.isSaving = true;
        this._changeDetectorRef.markForCheck();

        if (this.isEditMode) {
            this.updateAcademic();
        } else {
            this.createAcademic();
        }
    }

    createAcademic(): void {
        const formValue = this.academicForm.value;

        const createRequest: CreateStudentAcademicRequest = {
            studentId: formValue.basicInfo.studentId,
            section: formValue.basicInfo.section || undefined,
            stream: formValue.basicInfo.stream || undefined,
            batch: formValue.basicInfo.batch || undefined,
            academicYear: formValue.basicInfo.academicYear || undefined,
            semester: formValue.basicInfo.semester || undefined,
            cgpa: formValue.performanceInfo.cgpa || undefined,
            grade: formValue.performanceInfo.grade || undefined,
            attendancePercentage: formValue.performanceInfo.attendancePercentage || undefined
        };

        this._studentAcademicsService.create(createRequest)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (response) => {
                    this.isSaving = false;
                    this._changeDetectorRef.markForCheck();
                    this._notificationService.success('Academic record created successfully');
                    this._router.navigate(['/student-academics']);
                },
                error: (error) => {
                    console.error('Create academic record error details:', error);
                    this.isSaving = false;
                    this._changeDetectorRef.markForCheck();
                    this._notificationService.error('Error creating academic record');
                }
            });
    }

    updateAcademic(): void {
        if (!this.academic?.id) return;

        const formValue = this.academicForm.value;

        const updateRequest: UpdateStudentAcademicRequest = {
            id: this.academic.id,
            studentId: formValue.basicInfo.studentId,
            section: formValue.basicInfo.section || undefined,
            stream: formValue.basicInfo.stream || undefined,
            batch: formValue.basicInfo.batch || undefined,
            academicYear: formValue.basicInfo.academicYear || undefined,
            semester: formValue.basicInfo.semester || undefined,
            cgpa: formValue.performanceInfo.cgpa || undefined,
            grade: formValue.performanceInfo.grade || undefined,
            attendancePercentage: formValue.performanceInfo.attendancePercentage || undefined
        };

        this._studentAcademicsService.update(this.academic.id, updateRequest)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (response) => {
                    this.isSaving = false;
                    this._changeDetectorRef.markForCheck();
                    this._notificationService.success('Academic record updated successfully');
                    this._router.navigate(['/student-academics']);
                },
                error: (error) => {
                    console.error('Update academic record error details:', error);
                    this.isSaving = false;
                    this._changeDetectorRef.markForCheck();
                    this._notificationService.error('Error updating academic record');
                }
            });
    }

    cancel(): void {
        this._router.navigate(['/student-academics']);
    }

    getPageTitle(): string {
        return this.isEditMode ? 'Edit Academic Record' : 'Create Academic Record';
    }

    getSaveButtonText(): string {
        return this.isSaving ? 'Saving...' : (this.isEditMode ? 'Update Academic Record' : 'Create Academic Record');
    }

    getAcademicStatusLabel(status: AcademicStatus): string {
        const labels = {
            [AcademicStatus.Active]: 'Active',
            [AcademicStatus.Inactive]: 'Inactive',
            [AcademicStatus.Graduated]: 'Graduated',
            [AcademicStatus.Suspended]: 'Suspended',
            [AcademicStatus.Transferred]: 'Transferred',
            [AcademicStatus.Dropped]: 'Dropped'
        };
        return labels[status] || 'Unknown';
    }

    getStudentName(studentId: string): string {
        const student = this.students.find(s => s.id === studentId);
        return student ? `${student.firstName} ${student.lastName}` : '';
    }
} 