import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { StudentsService } from '../../../core/students/students.service';
import { StudentDto, CreateStudentRequest, UpdateStudentRequest, EnrollmentStatus, EducationLevel } from '../../../core/students/students.types';
import { NotificationService } from '../../../core/services/notification.service';
import { DateUtils } from '../../../core/utils/date.utils';
import { passwordMatchValidator } from '../../../core/validators/password-match.validator';
import { StudentDocumentsTabComponent } from './student-documents-tab.component';
import { StudentAssignmentsTabComponent } from './student-assignments-tab.component';

@Component({
    selector: 'student-form',
    templateUrl: './student-form.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
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
        MatDatepickerModule,
        MatNativeDateModule,
        MatCheckboxModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
        MatTooltipModule,
        StudentDocumentsTabComponent,
        StudentAssignmentsTabComponent,
    ]
})
export class StudentFormComponent implements OnInit, OnDestroy {
    studentForm: FormGroup;
    isEditMode = false;
    isLoading = false;
    isSaving = false; // Added for saving state
    studentId: string | null = null;
    
    // Enum options
    enrollmentStatusOptions = [
        { value: EnrollmentStatus.Enrolled, label: 'Enrolled' },
        { value: EnrollmentStatus.Withdrawn, label: 'Withdrawn' },
        { value: EnrollmentStatus.Graduated, label: 'Graduated' },
        { value: EnrollmentStatus.Suspended, label: 'Suspended' },
        { value: EnrollmentStatus.Transferred, label: 'Transferred' },
        { value: EnrollmentStatus.OnLeave, label: 'On Leave' },
        { value: EnrollmentStatus.Completed, label: 'Completed' },
        { value: EnrollmentStatus.Dropped, label: 'Dropped' },
        { value: EnrollmentStatus.Pending, label: 'Pending' },
        { value: EnrollmentStatus.Provisional, label: 'Provisional' }
    ];
    
    educationLevelOptions = [
        { value: EducationLevel.Primary, label: 'Primary' },
        { value: EducationLevel.Middle, label: 'Middle' },
        { value: EducationLevel.Secondary, label: 'Secondary' },
        { value: EducationLevel.HigherSecondary, label: 'Higher Secondary' },
        { value: EducationLevel.Undergraduate, label: 'Undergraduate' },
        { value: EducationLevel.Postgraduate, label: 'Postgraduate' },
        { value: EducationLevel.Diploma, label: 'Diploma' },
        { value: EducationLevel.Coaching, label: 'Coaching' },
        { value: EducationLevel.TestPreparation, label: 'Test Preparation' },
        { value: EducationLevel.SkillDevelopment, label: 'Skill Development' },
        { value: EducationLevel.Doctoral, label: 'Doctoral' },
        { value: EducationLevel.Research, label: 'Research' },
        { value: EducationLevel.Certificate, label: 'Certificate' },
        { value: EducationLevel.Basic, label: 'Basic' },
        { value: EducationLevel.Advanced, label: 'Advanced' },
        { value: EducationLevel.Professional, label: 'Professional' },
        { value: EducationLevel.Foundation, label: 'Foundation' },
        { value: EducationLevel.Intermediate, label: 'Intermediate' },
        { value: EducationLevel.Expert, label: 'Expert' },
        { value: EducationLevel.MasterClass, label: 'Master Class' },
        { value: EducationLevel.Other, label: 'Other' }
    ];
    
    genderOptions = [
        { value: 'Male', label: 'Male' },
        { value: 'Female', label: 'Female' },
        { value: 'Other', label: 'Other' }
    ];
    
    relationshipOptions = [
        { value: 'Father', label: 'Father' },
        { value: 'Mother', label: 'Mother' },
        { value: 'Guardian', label: 'Guardian' },
        { value: 'Uncle', label: 'Uncle' },
        { value: 'Aunt', label: 'Aunt' },
        { value: 'Grandparent', label: 'Grandparent' },
        { value: 'Sibling', label: 'Sibling' },
        { value: 'Other', label: 'Other' }
    ];

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _formBuilder: FormBuilder,
        private _studentsService: StudentsService,
        private _router: Router,
        private _route: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _notificationService: NotificationService,
        private _dateUtils: DateUtils
    ) {
        this.studentForm = this.createStudentForm();
    }

    ngOnInit(): void {
        // Get student ID from route
        this.studentId = this._route.snapshot.paramMap.get('id');
        this.isEditMode = !!this.studentId;

        if (this.isEditMode) {
            this.loadStudent();
            // Remove password validation in edit mode
            this.studentForm.get('basicInfo.password')?.clearValidators();
            this.studentForm.get('basicInfo.confirmPassword')?.clearValidators();
            this.studentForm.get('basicInfo.password')?.updateValueAndValidity();
            this.studentForm.get('basicInfo.confirmPassword')?.updateValueAndValidity();
        }
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    createStudentForm(): FormGroup {
        return this._formBuilder.group({
            basicInfo: this._formBuilder.group({
                firstName: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(75)]],
                lastName: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(75)]],
                userName: ['', [Validators.required, Validators.minLength(1)]],
                email: ['', [Validators.email]],
                phoneNumber: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(15)]],
                address: [''],
                gender: [''],
                dateOfBirth: [''],
                password: ['', [Validators.required, Validators.minLength(6)]],
                confirmPassword: ['', Validators.required]
            }, { validators: passwordMatchValidator }),
            
            familyInfo: this._formBuilder.group({
                fathersName: ['', [Validators.required, Validators.maxLength(100)]],
                fathersPhoneNumber: ['', [Validators.maxLength(15), Validators.pattern('^[+]?[0-9\\s\\-\\(\\)]+$')]],
                fathersEmail: ['', [Validators.email]],
                fathersOccupation: [''],
                fathersIncome: [''],
                mothersName: ['', [Validators.required, Validators.maxLength(100)]],
                mothersPhoneNumber: ['', [Validators.maxLength(15), Validators.pattern('^[+]?[0-9\\s\\-\\(\\)]+$')]],
                mothersEmail: ['', [Validators.email]],
                mothersOccupation: [''],
                mothersIncome: ['']
            }),
            
            guardianInfo: this._formBuilder.group({
                familyCode: ['', Validators.maxLength(64)],
                guardianName: ['', Validators.maxLength(100)],
                guardianPhone: ['', [Validators.maxLength(15), Validators.pattern('^[+]?[0-9\\s\\-\\(\\)]+$')]],
                guardianEmail: ['', [Validators.email]],
                guardianRelationship: [''],
                guardianAddress: ['', Validators.maxLength(500)],
                guardianOccupation: ['', Validators.maxLength(100)]
            }),
            
            emergencyContact: this._formBuilder.group({
                emergencyContactName: ['', Validators.maxLength(100)],
                emergencyContactPhone: ['', [Validators.maxLength(15), Validators.pattern('^[+]?[0-9\\s\\-\\(\\)]+$')]],
                emergencyContactEmail: ['', [Validators.email]],
                emergencyContactRelationship: [''],
                emergencyContactAddress: ['', Validators.maxLength(500)]
            }),
            
            academicInfo: this._formBuilder.group({
                enrollmentStatus: [''],
                currentLevel: [''],
                enrollmentDate: [''],
                graduationDate: [''],
                studentId: ['', Validators.maxLength(50)],
                rollNumber: ['', Validators.maxLength(20)],
                admissionNumber: ['', Validators.maxLength(50)]
            }),
            
            personalInfo: this._formBuilder.group({
                category: [''],
                religion: [''],
                nationality: [''],
                motherTongue: [''],
                languagesKnown: [''],
                hobbies: [''],
                specialTalents: [''],
                remarks: ['', Validators.maxLength(1000)],
                notes: ['', Validators.maxLength(1000)],
                specialInstructions: ['']
            })
        });
    }

    loadStudent(): void {
        if (!this.studentId) return;

        this.isLoading = true;
        this._changeDetectorRef.markForCheck();

        this._studentsService.getById(this.studentId)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (student: StudentDto) => {
                    this.patchForm(student);
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                },
                error: (error) => {
                    console.error('Error loading student:', error);
                    this._notificationService.error('Error loading student details');
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                }
            });
    }

    patchForm(student: StudentDto): void {
        this.studentForm.patchValue({
            basicInfo: {
                firstName: student.firstName,
                lastName: student.lastName,
                userName: student.userName,
                email: student.email,
                phoneNumber: student.phoneNumber,
                address: student.address,
                gender: student.gender,
                dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth) : null
            },
            familyInfo: {
                fathersName: student.fathersName,
                fathersPhoneNumber: student.fathersPhoneNumber,
                fathersEmail: student.fathersEmail,
                fathersOccupation: student.fathersOccupation,
                fathersIncome: student.fathersIncome,
                mothersName: student.mothersName,
                mothersPhoneNumber: student.mothersPhoneNumber,
                mothersEmail: student.mothersEmail,
                mothersOccupation: student.mothersOccupation,
                mothersIncome: student.mothersIncome
            },
            guardianInfo: {
                familyCode: student.familyCode,
                guardianName: student.guardianName,
                guardianPhone: student.guardianPhone,
                guardianEmail: student.guardianEmail,
                guardianRelationship: student.guardianRelationship,
                guardianAddress: student.guardianAddress,
                guardianOccupation: student.guardianOccupation
            },
            emergencyContact: {
                emergencyContactName: student.emergencyContactName,
                emergencyContactPhone: student.emergencyContactPhone,
                emergencyContactEmail: student.emergencyContactEmail,
                emergencyContactRelationship: student.emergencyContactRelationship,
                emergencyContactAddress: student.emergencyContactAddress
            },
            academicInfo: {
                enrollmentStatus: student.enrollmentStatus,
                currentLevel: student.currentLevel,
                enrollmentDate: student.enrollmentDate ? new Date(student.enrollmentDate) : null,
                graduationDate: student.graduationDate ? new Date(student.graduationDate) : null,
                studentId: student.studentId,
                rollNumber: student.rollNumber,
                admissionNumber: student.admissionNumber
            },
            personalInfo: {
                category: student.category,
                religion: student.religion,
                nationality: student.nationality,
                motherTongue: student.motherTongue,
                languagesKnown: student.languagesKnown,
                hobbies: student.hobbies,
                specialTalents: student.specialTalents,
                remarks: student.remarks,
                notes: student.notes,
                specialInstructions: student.specialInstructions
            }
        });
    }

    save(): void {
        if (this.studentForm.invalid) {
            return;
        }

        this.isSaving = true;
        this._changeDetectorRef.markForCheck();

        if (this.isEditMode) {
            this.updateStudent();
        } else {
            this.createStudent();
        }
    }

    createStudent(): void {
        const formValue = this.studentForm.value;
        
        // Prepare the request object
        const studentData = {
            ...formValue.basicInfo,
            ...formValue.familyInfo,
            ...formValue.guardianInfo,
            ...formValue.emergencyContact,
            ...formValue.academicInfo,
            ...formValue.personalInfo
        };

        // Remove confirmPassword field - it's only for frontend validation
        delete studentData.confirmPassword;

        // Format dates
        if (studentData.dateOfBirth) {
            studentData.dateOfBirth = this._dateUtils.formatDateForAPI(studentData.dateOfBirth);
        }
        if (studentData.enrollmentDate) {
            studentData.enrollmentDate = this._dateUtils.formatDateForAPI(studentData.enrollmentDate);
        }
        if (studentData.graduationDate) {
            studentData.graduationDate = this._dateUtils.formatDateForAPI(studentData.graduationDate);
        }

        // Handle enum values - convert to numbers if they exist
        if (studentData.enrollmentStatus !== null && studentData.enrollmentStatus !== undefined && studentData.enrollmentStatus !== '') {
            studentData.enrollmentStatus = Number(studentData.enrollmentStatus);
        } else {
            delete studentData.enrollmentStatus;
        }
        
        if (studentData.currentLevel !== null && studentData.currentLevel !== undefined && studentData.currentLevel !== '') {
            studentData.currentLevel = Number(studentData.currentLevel);
        } else {
            delete studentData.currentLevel;
        }

        // Clean up empty/null fields
        Object.keys(studentData).forEach(key => {
            const value = studentData[key];
            if (value === null || value === undefined || value === '') {
                delete studentData[key];
            }
        });

        this._studentsService.create(studentData as CreateStudentRequest)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (response) => {
                    this.isSaving = false;
                    this._changeDetectorRef.markForCheck();
                    this._notificationService.success('Student created successfully');
                    this._router.navigate(['/students']);
                },
                error: (error) => {
                    console.error('Create student error details:', error);
                    this.isSaving = false;
                    this._changeDetectorRef.markForCheck();
                    this._notificationService.error('Error creating student');
                }
            });
    }

    updateStudent(): void {
        if (!this.studentId) return;

        const formValue = this.studentForm.value;
        
        // Prepare the request object
        const studentData = {
            ...formValue.basicInfo,
            ...formValue.familyInfo,
            ...formValue.guardianInfo,
            ...formValue.emergencyContact,
            ...formValue.academicInfo,
            ...formValue.personalInfo
        };

        // Remove password fields in edit mode
        delete studentData.password;
        delete studentData.confirmPassword;

        // Format dates
        if (studentData.dateOfBirth) {
            studentData.dateOfBirth = this._dateUtils.formatDateForAPI(studentData.dateOfBirth);
        }
        if (studentData.enrollmentDate) {
            studentData.enrollmentDate = this._dateUtils.formatDateForAPI(studentData.enrollmentDate);
        }
        if (studentData.graduationDate) {
            studentData.graduationDate = this._dateUtils.formatDateForAPI(studentData.graduationDate);
        }

        // Handle enum values - convert to numbers if they exist
        if (studentData.enrollmentStatus !== null && studentData.enrollmentStatus !== undefined && studentData.enrollmentStatus !== '') {
            studentData.enrollmentStatus = Number(studentData.enrollmentStatus);
        } else {
            delete studentData.enrollmentStatus;
        }
        
        if (studentData.currentLevel !== null && studentData.currentLevel !== undefined && studentData.currentLevel !== '') {
            studentData.currentLevel = Number(studentData.currentLevel);
        } else {
            delete studentData.currentLevel;
        }

        // Clean up empty/null fields
        Object.keys(studentData).forEach(key => {
            const value = studentData[key];
            if (value === null || value === undefined || value === '') {
                delete studentData[key];
            }
        });

        this._studentsService.update(this.studentId, { id: this.studentId, ...studentData } as UpdateStudentRequest)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (response) => {
                    this.isSaving = false;
                    this._changeDetectorRef.markForCheck();
                    this._notificationService.success('Student updated successfully');
                    this._router.navigate(['/students']);
                },
                error: (error) => {
                    console.error('Update student error details:', error);
                    this.isSaving = false;
                    this._changeDetectorRef.markForCheck();
                    this._notificationService.error('Error updating student');
                }
            });
    }

    cancel(): void {
        this._router.navigate(['/students']);
    }

    isFormInvalid(): boolean {
        if (this.isEditMode) {
            // In edit mode, exclude password validation but check all required fields
            const basicInfoValid = this.studentForm.get('basicInfo')?.get('firstName')?.valid &&
                                 this.studentForm.get('basicInfo')?.get('lastName')?.valid &&
                                 this.studentForm.get('basicInfo')?.get('userName')?.valid &&
                                 this.studentForm.get('basicInfo')?.get('phoneNumber')?.valid;
            const familyInfoValid = this.studentForm.get('familyInfo')?.get('fathersName')?.valid &&
                                  this.studentForm.get('familyInfo')?.get('mothersName')?.valid;
            return !(basicInfoValid && familyInfoValid);
        }
        return this.studentForm.invalid;
    }

    getPageTitle(): string {
        return this.isEditMode ? 'Edit Student' : 'Add Student';
    }

    getSaveButtonText(): string {
        return this.isSaving ? 'Saving...' : (this.isEditMode ? 'Update Student' : 'Create Student');
    }
} 