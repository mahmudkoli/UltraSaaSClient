import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertService } from '@fuse/components/alert';
import { TeachersService } from '../../../core/teachers/teachers.service';
import { TeacherDto, CreateTeacherRequest, UpdateTeacherRequest, Designation } from '../../../core/teachers/teachers.types';
import { NotificationService } from '../../../core/services/notification.service';
import { DateUtils } from '../../../core/utils/date.utils';

@Component({
    selector: 'teacher-form',
    templateUrl: './teacher-form.component.html',
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
        MatSelectModule,
        MatTabsModule,
    ],
})
export class TeacherFormComponent implements OnInit, OnDestroy {
    teacherForm: FormGroup;
    teacher: TeacherDto | null = null;
    isEditMode = false;
    isLoading = false;
    isSaving = false;
    selectedTabIndex = 0;

    // Designation options for dropdown
    designationOptions = [
        { value: Designation.Principal, label: 'Principal' },
        { value: Designation.VicePrincipal, label: 'Vice Principal' },
        { value: Designation.HeadOfDepartment, label: 'Head Of Department' },
        { value: Designation.SeniorTeacher, label: 'Senior Teacher' },
        { value: Designation.Teacher, label: 'Teacher' },
        { value: Designation.AssistantTeacher, label: 'Assistant Teacher' },
        { value: Designation.Lecturer, label: 'Lecturer' },
        { value: Designation.SeniorLecturer, label: 'Senior Lecturer' },
        { value: Designation.AssistantProfessor, label: 'Assistant Professor' },
        { value: Designation.AssociateProfessor, label: 'Associate Professor' },
        { value: Designation.Professor, label: 'Professor' },
        { value: Designation.VisitingProfessor, label: 'Visiting Professor' },
        { value: Designation.AdjunctProfessor, label: 'Adjunct Professor' },
        { value: Designation.ResearchScholar, label: 'Research Scholar' },
        { value: Designation.TeachingAssistant, label: 'Teaching Assistant' },
        { value: Designation.LabAssistant, label: 'Lab Assistant' },
        { value: Designation.Librarian, label: 'Librarian' },
        { value: Designation.Counselor, label: 'Counselor' },
        { value: Designation.Coordinator, label: 'Coordinator' },
        { value: Designation.Administrator, label: 'Administrator' },
        { value: Designation.Manager, label: 'Manager' },
        { value: Designation.Director, label: 'Director' },
        { value: Designation.Dean, label: 'Dean' },
        { value: Designation.Registrar, label: 'Registrar' },
        { value: Designation.Accountant, label: 'Accountant' },
        { value: Designation.Clerk, label: 'Clerk' },
        { value: Designation.Peon, label: 'Peon' },
        { value: Designation.Driver, label: 'Driver' },
        { value: Designation.SecurityGuard, label: 'Security Guard' },
        { value: Designation.Other, label: 'Other' }
    ];

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _formBuilder: FormBuilder,
        private _teachersService: TeachersService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseAlertService: FuseAlertService,
        private _router: Router,
        private _route: ActivatedRoute,
        private _notificationService: NotificationService,
        private _dateUtils: DateUtils
    ) {
        this.teacherForm = this._formBuilder.group({
            firstName: ['', [Validators.required, Validators.maxLength(75)]],
            lastName: ['', [Validators.required, Validators.maxLength(75)]],
            email: ['', [Validators.email]],
            userName: ['', [Validators.required]],
            phoneNumber: ['', [Validators.required, Validators.maxLength(15)]],
            address: [''],
            gender: [''],
            dateOfBirth: [''],
            designation: [''],
            password: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', [Validators.required]]
        }, { validators: this.passwordMatchValidator });
    }

    ngOnInit(): void {
        const teacherId = this._route.snapshot.paramMap.get('id');
        
        if (teacherId && teacherId !== 'create') {
            this.isEditMode = true;
            this.loadTeacher(teacherId);
            // Remove password validation in edit mode
            this.teacherForm.get('password')?.clearValidators();
            this.teacherForm.get('confirmPassword')?.clearValidators();
            this.teacherForm.get('password')?.updateValueAndValidity();
            this.teacherForm.get('confirmPassword')?.updateValueAndValidity();
        } else {
            this.isEditMode = false;
            // Password is required in create mode
            this.teacherForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
            this.teacherForm.get('confirmPassword')?.setValidators([Validators.required]);
            this.teacherForm.get('password')?.updateValueAndValidity();
            this.teacherForm.get('confirmPassword')?.updateValueAndValidity();
        }
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    loadTeacher(id: string): void {
        this.isLoading = true;
        this._changeDetectorRef.markForCheck();

        this._teachersService.getById(id)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (teacher: TeacherDto) => {
                    this.teacher = teacher;
                    this.patchForm(teacher);
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                },
                error: (error) => {
                    console.error('Error loading teacher:', error);
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                    this._notificationService.error('Error loading teacher');
                }
            });
    }

    patchForm(teacher: TeacherDto): void {
        this.teacherForm.patchValue({
            firstName: teacher.firstName,
            lastName: teacher.lastName,
            email: teacher.email || '',
            userName: teacher.userName,
            phoneNumber: teacher.phoneNumber || '',
            address: teacher.address || '',
            gender: teacher.gender || '',
            dateOfBirth: teacher.dateOfBirth ? new Date(teacher.dateOfBirth) : '',
            designation: teacher.designation || '',
            password: '',
            confirmPassword: ''
        });
    }

    save(): void {
        if (this.teacherForm.invalid) {
            return;
        }

        this.isSaving = true;
        this._changeDetectorRef.markForCheck();

        const formValue = this.teacherForm.value;

        if (this.isEditMode && this.teacher) {
            const updateRequest: UpdateTeacherRequest = {
                id: this.teacher.id,
                firstName: formValue.firstName,
                lastName: formValue.lastName,
                email: formValue.email || undefined,
                userName: formValue.userName,
                phoneNumber: formValue.phoneNumber,
                address: formValue.address || undefined,
                gender: formValue.gender || undefined,
                dateOfBirth: formValue.dateOfBirth ? this._dateUtils.formatDateForAPI(formValue.dateOfBirth) : undefined,
                designation: formValue.designation || undefined
            };

            this._teachersService.update(this.teacher.id, updateRequest)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe({
                    next: () => {
                        this._notificationService.success('Teacher updated successfully');
                        this._router.navigate(['/teachers']);
                    },
                    error: (error) => {
                        console.error('Error updating teacher:', error);
                        this._notificationService.error('Error updating teacher');
                        this.isSaving = false;
                        this._changeDetectorRef.markForCheck();
                    }
                });
        } else {
            const createRequest: CreateTeacherRequest = {
                firstName: formValue.firstName,
                lastName: formValue.lastName,
                email: formValue.email || undefined,
                userName: formValue.userName,
                phoneNumber: formValue.phoneNumber,
                address: formValue.address || undefined,
                gender: formValue.gender || undefined,
                dateOfBirth: formValue.dateOfBirth ? this._dateUtils.formatDateForAPI(formValue.dateOfBirth) : undefined,
                designation: formValue.designation || undefined,
                password: formValue.password
            };

            this._teachersService.create(createRequest)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe({
                    next: () => {
                        this._notificationService.success('Teacher created successfully');
                        this._router.navigate(['/teachers']);
                    },
                    error: (error) => {
                        console.error('Error creating teacher:', error);
                        this._notificationService.error('Error creating teacher');
                        this.isSaving = false;
                        this._changeDetectorRef.markForCheck();
                    }
                });
        }
    }

    cancel(): void {
        this._router.navigate(['/teachers']);
    }

    private passwordMatchValidator(form: FormGroup): { [key: string]: any } | null {
        const password = form.get('password');
        const confirmPassword = form.get('confirmPassword');
        
        if (password && confirmPassword && password.value !== confirmPassword.value) {
            return { passwordMismatch: true };
        }
        
        return null;
    }

    /**
     * Check if form is valid (ignoring password validation in edit mode)
     */
    isFormValid(): boolean {
        if (this.isEditMode) {
            // In edit mode, ignore password fields for validation
            const formValue = this.teacherForm.value;
            const requiredFields = ['firstName', 'lastName', 'userName', 'phoneNumber'];
            
            for (const field of requiredFields) {
                if (!formValue[field]) {
                    return false;
                }
            }
            
            return true;
        }
        
        return this.teacherForm.valid;
    }


} 