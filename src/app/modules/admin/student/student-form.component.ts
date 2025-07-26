import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { StudentsService } from '../../../core/students/students.service';
import { CreateStudentRequest, UpdateStudentRequest, StudentDto } from '../../../core/students/students.types';
import { NotificationService } from '../../../core/services/notification.service';
import { DateUtils } from '../../../core/utils/date.utils';

@Component({
    selector: 'student-form',
    templateUrl: './student-form.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations,
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatNativeDateModule,
        MatProgressBarModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatTabsModule,
        MatTooltipModule,
    ],
})
export class StudentFormComponent implements OnInit, OnDestroy {
    studentForm: FormGroup;
    isLoading = false;
    isSaving = false;
    studentId: string | null = null;
    isEditMode = false;
    student: StudentDto | null = null;
    
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _formBuilder: FormBuilder,
        private _studentsService: StudentsService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _router: Router,
        private _route: ActivatedRoute,
        private _notificationService: NotificationService,
        private _dateUtils: DateUtils
    ) {
        this.studentForm = this._formBuilder.group({
            userName: ['', [Validators.required, Validators.minLength(3)]],
            firstName: ['', [Validators.required, Validators.minLength(2)]],
            lastName: ['', [Validators.required, Validators.minLength(2)]],
            email: ['', [Validators.email]],
            phoneNumber: ['', [Validators.required]],
            address: [''],
            gender: [''],
            dateOfBirth: [''],
            fathersName: ['', [Validators.required]],
            fathersPhoneNumber: [''],
            mothersName: ['', [Validators.required]],
            mothersPhoneNumber: [''],
            password: ['', [Validators.minLength(6)]],
            confirmPassword: ['']
        }, { validators: this.passwordMatchValidator });
    }

    ngOnInit(): void {
        this.studentId = this._route.snapshot.paramMap.get('id');
        this.isEditMode = !!this.studentId;
        
        // Set password validation based on mode
        const passwordControl = this.studentForm.get('password');
        const confirmPasswordControl = this.studentForm.get('confirmPassword');
        if (this.isEditMode) {
            // In edit mode, password is optional
            passwordControl?.clearValidators();
            confirmPasswordControl?.clearValidators();
        } else {
            // In create mode, password is required
            passwordControl?.setValidators([Validators.required, Validators.minLength(6)]);
            confirmPasswordControl?.setValidators([Validators.required]);
        }
        passwordControl?.updateValueAndValidity();
        confirmPasswordControl?.updateValueAndValidity();
        
        if (this.isEditMode) {
            this.loadStudent();
        }
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    loadStudent(): void {
        if (!this.studentId) return;

        this.isLoading = true;
        this._changeDetectorRef.markForCheck();

        this._studentsService.getById(this.studentId)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (student) => {
                    this.student = student;
                    this.populateForm(student);
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                },
                error: (error) => {
                    console.error('Error loading student:', error);
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                    this._notificationService.error('Error loading student');
                }
            });
    }

    populateForm(student: StudentDto): void {
        this.studentForm.patchValue({
            userName: student.userName || '',
            firstName: student.firstName || '',
            lastName: student.lastName || '',
            email: student.email || '',
            phoneNumber: student.phoneNumber || '',
            address: student.address || '',
            gender: student.gender || '',
            dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth) : '',
            fathersName: student.fathersName || '',
            fathersPhoneNumber: student.fathersPhoneNumber || '',
            mothersName: student.mothersName || '',
            mothersPhoneNumber: student.mothersPhoneNumber || ''
        });
    }

    save(): void {
        // Check if form is valid, but handle password validation differently for edit mode
        if (this.isEditMode) {
            // In edit mode, temporarily disable password validation
            const passwordControl = this.studentForm.get('password');
            const originalValidators = passwordControl?.validator;
            passwordControl?.clearValidators();
            passwordControl?.updateValueAndValidity();
            
            const isValid = this.studentForm.valid;
            
            // Restore original validators
            passwordControl?.setValidators(originalValidators);
            passwordControl?.updateValueAndValidity();
            
            if (!isValid) {
                return;
            }
        } else {
            // In create mode, check all validations including password
            if (this.studentForm.invalid) {
                return;
            }
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
        
        // Convert date to ISO string if provided
        let dateOfBirth = null;
        if (formValue.dateOfBirth) {
            dateOfBirth = this._dateUtils.formatDateForAPI(formValue.dateOfBirth);
        }
        
        const request: CreateStudentRequest = {
            userName: formValue.userName,
            firstName: formValue.firstName,
            lastName: formValue.lastName,
            email: formValue.email,
            phoneNumber: formValue.phoneNumber,
            address: formValue.address,
            gender: formValue.gender,
            dateOfBirth: dateOfBirth,
            fathersName: formValue.fathersName,
            fathersPhoneNumber: formValue.fathersPhoneNumber,
            mothersName: formValue.mothersName,
            mothersPhoneNumber: formValue.mothersPhoneNumber,
            password: formValue.password || ''
        };

        this._studentsService.create(request)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (response) => {
                    console.log('Student created successfully with response:', response);
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
        
        // Convert date to ISO string if provided
        let dateOfBirth = null;
        if (formValue.dateOfBirth) {
            dateOfBirth = this._dateUtils.formatDateForAPI(formValue.dateOfBirth);
        }
        
        const request: UpdateStudentRequest = {
            id: this.studentId,
            userName: formValue.userName,
            firstName: formValue.firstName,
            lastName: formValue.lastName,
            email: formValue.email,
            phoneNumber: formValue.phoneNumber,
            address: formValue.address,
            gender: formValue.gender,
            dateOfBirth: dateOfBirth,
            fathersName: formValue.fathersName,
            fathersPhoneNumber: formValue.fathersPhoneNumber,
            mothersName: formValue.mothersName,
            mothersPhoneNumber: formValue.mothersPhoneNumber
        };

        this._studentsService.update(this.studentId, request)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (response) => {
                    console.log('Student updated successfully with response:', response);
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



    getPageTitle(): string {
        return this.isEditMode ? 'Edit Student' : 'Create Student';
    }

    getSaveButtonText(): string {
        return this.isSaving ? 'Saving...' : (this.isEditMode ? 'Update Student' : 'Create Student');
    }

    isFormInvalid(): boolean {
        if (this.isEditMode) {
            // In edit mode, temporarily disable password validation for button state
            const passwordControl = this.studentForm.get('password');
            const originalValidators = passwordControl?.validator;
            passwordControl?.clearValidators();
            passwordControl?.updateValueAndValidity();
            
            const isValid = this.studentForm.valid;
            
            // Restore original validators
            passwordControl?.setValidators(originalValidators);
            passwordControl?.updateValueAndValidity();
            
            return !isValid;
        } else {
            // In create mode, check all validations including password
            return this.studentForm.invalid;
        }
    }

    private passwordMatchValidator(form: FormGroup): { [key: string]: any } | null {
        const password = form.get('password');
        const confirmPassword = form.get('confirmPassword');
        
        if (password && confirmPassword && password.value !== confirmPassword.value) {
            return { passwordMismatch: true };
        }
        
        return null;
    }
} 