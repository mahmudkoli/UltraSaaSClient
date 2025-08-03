import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertService } from '@fuse/components/alert';
import { TeachersService } from '../../../core/teachers/teachers.service';
import { TeacherDto, CreateTeacherRequest, UpdateTeacherRequest, Designation, Department, EmploymentStatus, EmploymentType, WorkShift } from '../../../core/teachers/teachers.types';
import { NotificationService } from '../../../core/services/notification.service';
import { DateUtils } from '../../../core/utils/date.utils';
import { passwordMatchValidator } from '../../../core/validators/password-match.validator';

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
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        MatTabsModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatCheckboxModule,
        MatProgressSpinnerModule
    ],
})
export class TeacherFormComponent implements OnInit, OnDestroy {
    teacherForm: FormGroup;
    teacher: TeacherDto | null = null;
    isEditMode = false;
    isLoading = false;
    isSaving = false;
    selectedTabIndex = 0;

    designationOptions = Object.values(Designation).filter(v => typeof v === 'number').map(value => ({
        value: value as Designation,
        label: this.getDesignationLabel(value as Designation)
    }));

    departmentOptions = Object.values(Department).filter(v => typeof v === 'number').map(value => ({
        value: value as Department,
        label: this.getDepartmentLabel(value as Department)
    }));

    employmentStatusOptions = Object.values(EmploymentStatus).filter(v => typeof v === 'number').map(value => ({
        value: value as EmploymentStatus,
        label: this.getEmploymentStatusLabel(value as EmploymentStatus)
    }));

    employmentTypeOptions = Object.values(EmploymentType).filter(v => typeof v === 'number').map(value => ({
        value: value as EmploymentType,
        label: this.getEmploymentTypeLabel(value as EmploymentType)
    }));

    workShiftOptions = Object.values(WorkShift).filter(v => typeof v === 'number').map(value => ({
        value: value as WorkShift,
        label: this.getWorkShiftLabel(value as WorkShift)
    }));

    genderOptions = [
        { value: 'Male', label: 'Male' },
        { value: 'Female', label: 'Female' },
        { value: 'Other', label: 'Other' }
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
            
            professionalInfo: this._formBuilder.group({
                designation: [''],
                department: [''],
                subject: ['', Validators.maxLength(200)],
                specialization: ['', Validators.maxLength(200)],
                employeeId: ['', Validators.maxLength(50)],
                employeeCode: ['', Validators.maxLength(50)],
                joiningDate: [''],
                confirmationDate: [''],
                resignationDate: [''],
                lastWorkingDate: [''],
                employmentStatus: [''],
                employmentType: [''],
                workLocation: ['', Validators.maxLength(200)],
                workShift: [''],
                workingHours: ['']
            }),
            
            experienceInfo: this._formBuilder.group({
                totalExperience: [''],
                teachingExperience: [''],
                previousEmployers: ['', Validators.maxLength(500)],
                previousPositions: ['', Validators.maxLength(500)],
                previousSchools: ['', Validators.maxLength(500)],
                experienceDetails: ['', Validators.maxLength(1000)],
                achievements: ['', Validators.maxLength(1000)],
                awards: ['', Validators.maxLength(1000)],
                publications: ['', Validators.maxLength(1000)],
                researchWork: ['', Validators.maxLength(1000)]
            }),
            
            salaryInfo: this._formBuilder.group({
                basicSalary: [''],
                grossSalary: [''],
                netSalary: [''],
                salaryStructure: ['', Validators.maxLength(500)],
                allowances: ['', Validators.maxLength(500)],
                benefits: ['', Validators.maxLength(500)]
            }),
            
            financialInfo: this._formBuilder.group({
                bankName: ['', Validators.maxLength(100)],
                bankAccountNumber: ['', Validators.maxLength(20)],
                ifsCode: ['', Validators.maxLength(15)],
                panNumber: ['', Validators.maxLength(15)],
                aadharNumber: ['', Validators.maxLength(20)],
                pfNumber: ['', Validators.maxLength(20)],
                esiNumber: ['', Validators.maxLength(20)]
            }),
            
            organizationalInfo: this._formBuilder.group({
                reportingTo: ['', Validators.maxLength(100)],
                subordinates: ['', Validators.maxLength(500)],
                roles: ['', Validators.maxLength(500)],
                responsibilities: ['', Validators.maxLength(1000)],
                committees: ['', Validators.maxLength(500)],
                projects: ['', Validators.maxLength(500)]
            }),
            
            teachingInfo: this._formBuilder.group({
                isClassTeacher: [false],
                assignedClasses: ['', Validators.maxLength(200)],
                assignedSubjects: ['', Validators.maxLength(200)],
                maxStudents: [''],
                currentStudents: ['']
            }),
            
            performanceInfo: this._formBuilder.group({
                performanceRating: [''],
                lastAppraisalDate: [''],
                appraisalComments: ['', Validators.maxLength(1000)],
                improvementAreas: ['', Validators.maxLength(1000)],
                trainingNeeds: ['', Validators.maxLength(1000)],
                careerGoals: ['', Validators.maxLength(1000)],
                isProbationPeriod: [false],
                probationEndDate: ['']
            }),
            
            emergencyContact: this._formBuilder.group({
                emergencyContact: ['', Validators.maxLength(100)],
                emergencyPhone: ['', [Validators.maxLength(15), Validators.pattern('^[+]?[0-9\\s\\-\\(\\)]+$')]],
                emergencyEmail: ['', [Validators.email]],
                emergencyAddress: ['', Validators.maxLength(500)],
                emergencyRelationship: ['', Validators.maxLength(50)]
            }),
            
            personalInfo: this._formBuilder.group({
                languagesKnown: ['', Validators.maxLength(200)],
                hobbies: ['', Validators.maxLength(200)],
                specialSkills: ['', Validators.maxLength(500)],
                interests: ['', Validators.maxLength(500)],
                remarks: ['', Validators.maxLength(1000)],
                notes: ['', Validators.maxLength(1000)]
            })
        });
    }

    ngOnInit(): void {
        const teacherId = this._route.snapshot.paramMap.get('id');
        
        if (teacherId && teacherId !== 'create') {
            this.isEditMode = true;
            this.loadTeacher(teacherId);
            // Remove password validation in edit mode
            this.teacherForm.get('basicInfo.password')?.clearValidators();
            this.teacherForm.get('basicInfo.confirmPassword')?.clearValidators();
            this.teacherForm.get('basicInfo.password')?.updateValueAndValidity();
            this.teacherForm.get('basicInfo.confirmPassword')?.updateValueAndValidity();
        } else {
            this.isEditMode = false;
            // Password is required in create mode
            this.teacherForm.get('basicInfo.password')?.setValidators([Validators.required, Validators.minLength(6)]);
            this.teacherForm.get('basicInfo.confirmPassword')?.setValidators([Validators.required]);
            this.teacherForm.get('basicInfo.password')?.updateValueAndValidity();
            this.teacherForm.get('basicInfo.confirmPassword')?.updateValueAndValidity();
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
            basicInfo: {
                firstName: teacher.firstName,
                lastName: teacher.lastName,
                userName: teacher.userName,
                email: teacher.email || '',
                phoneNumber: teacher.phoneNumber || '',
                address: teacher.address || '',
                gender: teacher.gender || '',
                dateOfBirth: teacher.dateOfBirth ? new Date(teacher.dateOfBirth) : '',
                password: '',
                confirmPassword: ''
            },
            professionalInfo: {
                designation: teacher.designation || '',
                department: teacher.department || '',
                subject: teacher.subject || '',
                specialization: teacher.specialization || '',
                employeeId: teacher.employeeId || '',
                employeeCode: teacher.employeeCode || '',
                joiningDate: teacher.joiningDate ? new Date(teacher.joiningDate) : '',
                confirmationDate: teacher.confirmationDate ? new Date(teacher.confirmationDate) : '',
                resignationDate: teacher.resignationDate ? new Date(teacher.resignationDate) : '',
                lastWorkingDate: teacher.lastWorkingDate ? new Date(teacher.lastWorkingDate) : '',
                employmentStatus: teacher.employmentStatus || '',
                employmentType: teacher.employmentType || '',
                workLocation: teacher.workLocation || '',
                workShift: teacher.workShift || '',
                workingHours: teacher.workingHours || ''
            },
            experienceInfo: {
                totalExperience: teacher.totalExperience || '',
                teachingExperience: teacher.teachingExperience || '',
                previousEmployers: teacher.previousEmployers || '',
                previousPositions: teacher.previousPositions || '',
                previousSchools: teacher.previousSchools || '',
                experienceDetails: teacher.experienceDetails || '',
                achievements: teacher.achievements || '',
                awards: teacher.awards || '',
                publications: teacher.publications || '',
                researchWork: teacher.researchWork || ''
            },
            salaryInfo: {
                basicSalary: teacher.basicSalary || '',
                grossSalary: teacher.grossSalary || '',
                netSalary: teacher.netSalary || '',
                salaryStructure: teacher.salaryStructure || '',
                allowances: teacher.allowances || '',
                benefits: teacher.benefits || ''
            },
            financialInfo: {
                bankName: teacher.bankName || '',
                bankAccountNumber: teacher.bankAccountNumber || '',
                ifsCode: teacher.ifsCode || '',
                panNumber: teacher.panNumber || '',
                aadharNumber: teacher.aadharNumber || '',
                pfNumber: teacher.pfNumber || '',
                esiNumber: teacher.esiNumber || ''
            },
            organizationalInfo: {
                reportingTo: teacher.reportingTo || '',
                subordinates: teacher.subordinates || '',
                roles: teacher.roles || '',
                responsibilities: teacher.responsibilities || '',
                committees: teacher.committees || '',
                projects: teacher.projects || ''
            },
            teachingInfo: {
                isClassTeacher: teacher.isClassTeacher || false,
                assignedClasses: teacher.assignedClasses || '',
                assignedSubjects: teacher.assignedSubjects || '',
                maxStudents: teacher.maxStudents || '',
                currentStudents: teacher.currentStudents || ''
            },
            performanceInfo: {
                performanceRating: teacher.performanceRating || '',
                lastAppraisalDate: teacher.lastAppraisalDate ? new Date(teacher.lastAppraisalDate) : '',
                appraisalComments: teacher.appraisalComments || '',
                improvementAreas: teacher.improvementAreas || '',
                trainingNeeds: teacher.trainingNeeds || '',
                careerGoals: teacher.careerGoals || '',
                isProbationPeriod: teacher.isProbationPeriod || false,
                probationEndDate: teacher.probationEndDate ? new Date(teacher.probationEndDate) : ''
            },
            emergencyContact: {
                emergencyContact: teacher.emergencyContact || '',
                emergencyPhone: teacher.emergencyPhone || '',
                emergencyEmail: teacher.emergencyEmail || '',
                emergencyAddress: teacher.emergencyAddress || '',
                emergencyRelationship: teacher.emergencyRelationship || ''
            },
            personalInfo: {
                languagesKnown: teacher.languagesKnown || '',
                hobbies: teacher.hobbies || '',
                specialSkills: teacher.specialSkills || '',
                interests: teacher.interests || '',
                remarks: teacher.remarks || '',
                notes: teacher.notes || ''
            }
        });
    }

    save(): void {
        if (this.teacherForm.invalid) {
            return;
        }

        this.isSaving = true;
        this._changeDetectorRef.markForCheck();

        if (this.isEditMode) {
            this.updateTeacher();
        } else {
            this.createTeacher();
        }
    }

    createTeacher(): void {
        const formValue = this.teacherForm.value;

        const createRequest: CreateTeacherRequest = {
            firstName: formValue.basicInfo.firstName,
            lastName: formValue.basicInfo.lastName,
            email: formValue.basicInfo.email || undefined,
            userName: formValue.basicInfo.userName,
            phoneNumber: formValue.basicInfo.phoneNumber,
            address: formValue.basicInfo.address || undefined,
            gender: formValue.basicInfo.gender || undefined,
            dateOfBirth: formValue.basicInfo.dateOfBirth ? this._dateUtils.formatDateForAPI(formValue.basicInfo.dateOfBirth) : undefined,
            designation: formValue.professionalInfo.designation || undefined,
            department: formValue.professionalInfo.department || undefined,
            subject: formValue.professionalInfo.subject || undefined,
            specialization: formValue.professionalInfo.specialization || undefined,
            employeeId: formValue.professionalInfo.employeeId || undefined,
            employeeCode: formValue.professionalInfo.employeeCode || undefined,
            joiningDate: formValue.professionalInfo.joiningDate ? this._dateUtils.formatDateForAPI(formValue.professionalInfo.joiningDate) : undefined,
            confirmationDate: formValue.professionalInfo.confirmationDate ? this._dateUtils.formatDateForAPI(formValue.professionalInfo.confirmationDate) : undefined,
            employmentStatus: formValue.professionalInfo.employmentStatus || undefined,
            employmentType: formValue.professionalInfo.employmentType || undefined,
            workLocation: formValue.professionalInfo.workLocation || undefined,
            workShift: formValue.professionalInfo.workShift || undefined,
            workingHours: formValue.professionalInfo.workingHours || undefined,
            totalExperience: formValue.experienceInfo.totalExperience || undefined,
            teachingExperience: formValue.experienceInfo.teachingExperience || undefined,
            previousEmployers: formValue.experienceInfo.previousEmployers || undefined,
            previousPositions: formValue.experienceInfo.previousPositions || undefined,
            previousSchools: formValue.experienceInfo.previousSchools || undefined,
            experienceDetails: formValue.experienceInfo.experienceDetails || undefined,
            achievements: formValue.experienceInfo.achievements || undefined,
            awards: formValue.experienceInfo.awards || undefined,
            publications: formValue.experienceInfo.publications || undefined,
            researchWork: formValue.experienceInfo.researchWork || undefined,
            basicSalary: formValue.salaryInfo.basicSalary || undefined,
            grossSalary: formValue.salaryInfo.grossSalary || undefined,
            netSalary: formValue.salaryInfo.netSalary || undefined,
            salaryStructure: formValue.salaryInfo.salaryStructure || undefined,
            allowances: formValue.salaryInfo.allowances || undefined,
            benefits: formValue.salaryInfo.benefits || undefined,
            bankName: formValue.financialInfo.bankName || undefined,
            bankAccountNumber: formValue.financialInfo.bankAccountNumber || undefined,
            ifsCode: formValue.financialInfo.ifsCode || undefined,
            panNumber: formValue.financialInfo.panNumber || undefined,
            aadharNumber: formValue.financialInfo.aadharNumber || undefined,
            pfNumber: formValue.financialInfo.pfNumber || undefined,
            esiNumber: formValue.financialInfo.esiNumber || undefined,
            reportingTo: formValue.organizationalInfo.reportingTo || undefined,
            subordinates: formValue.organizationalInfo.subordinates || undefined,
            roles: formValue.organizationalInfo.roles || undefined,
            responsibilities: formValue.organizationalInfo.responsibilities || undefined,
            committees: formValue.organizationalInfo.committees || undefined,
            projects: formValue.organizationalInfo.projects || undefined,
            isClassTeacher: formValue.teachingInfo.isClassTeacher || undefined,
            assignedClasses: formValue.teachingInfo.assignedClasses || undefined,
            assignedSubjects: formValue.teachingInfo.assignedSubjects || undefined,
            maxStudents: formValue.teachingInfo.maxStudents || undefined,
            currentStudents: formValue.teachingInfo.currentStudents || undefined,
            languagesKnown: formValue.personalInfo.languagesKnown || undefined,
            hobbies: formValue.personalInfo.hobbies || undefined,
            specialSkills: formValue.personalInfo.specialSkills || undefined,
            interests: formValue.personalInfo.interests || undefined,
            remarks: formValue.personalInfo.remarks || undefined,
            notes: formValue.personalInfo.notes || undefined,
            password: formValue.basicInfo.password
        };

        this._teachersService.create(createRequest)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (response) => {
                    this.isSaving = false;
                    this._changeDetectorRef.markForCheck();
                    this._notificationService.success('Teacher created successfully');
                    this._router.navigate(['/teachers']);
                },
                error: (error) => {
                    console.error('Create teacher error details:', error);
                    this.isSaving = false;
                    this._changeDetectorRef.markForCheck();
                    this._notificationService.error('Error creating teacher');
                }
            });
    }

    updateTeacher(): void {
        if (!this.teacher?.id) return;

        const formValue = this.teacherForm.value;

        const updateRequest: UpdateTeacherRequest = {
            id: this.teacher.id,
            firstName: formValue.basicInfo.firstName,
            lastName: formValue.basicInfo.lastName,
            email: formValue.basicInfo.email || undefined,
            userName: formValue.basicInfo.userName,
            phoneNumber: formValue.basicInfo.phoneNumber,
            address: formValue.basicInfo.address || undefined,
            gender: formValue.basicInfo.gender || undefined,
            dateOfBirth: formValue.basicInfo.dateOfBirth ? this._dateUtils.formatDateForAPI(formValue.basicInfo.dateOfBirth) : undefined,
            designation: formValue.professionalInfo.designation || undefined,
            department: formValue.professionalInfo.department || undefined,
            subject: formValue.professionalInfo.subject || undefined,
            specialization: formValue.professionalInfo.specialization || undefined,
            employeeId: formValue.professionalInfo.employeeId || undefined,
            employeeCode: formValue.professionalInfo.employeeCode || undefined,
            joiningDate: formValue.professionalInfo.joiningDate ? this._dateUtils.formatDateForAPI(formValue.professionalInfo.joiningDate) : undefined,
            confirmationDate: formValue.professionalInfo.confirmationDate ? this._dateUtils.formatDateForAPI(formValue.professionalInfo.confirmationDate) : undefined,
            employmentStatus: formValue.professionalInfo.employmentStatus || undefined,
            employmentType: formValue.professionalInfo.employmentType || undefined,
            workLocation: formValue.professionalInfo.workLocation || undefined,
            workShift: formValue.professionalInfo.workShift || undefined,
            workingHours: formValue.professionalInfo.workingHours || undefined,
            totalExperience: formValue.experienceInfo.totalExperience || undefined,
            teachingExperience: formValue.experienceInfo.teachingExperience || undefined,
            previousEmployers: formValue.experienceInfo.previousEmployers || undefined,
            previousPositions: formValue.experienceInfo.previousPositions || undefined,
            previousSchools: formValue.experienceInfo.previousSchools || undefined,
            experienceDetails: formValue.experienceInfo.experienceDetails || undefined,
            achievements: formValue.experienceInfo.achievements || undefined,
            awards: formValue.experienceInfo.awards || undefined,
            publications: formValue.experienceInfo.publications || undefined,
            researchWork: formValue.experienceInfo.researchWork || undefined,
            basicSalary: formValue.salaryInfo.basicSalary || undefined,
            grossSalary: formValue.salaryInfo.grossSalary || undefined,
            netSalary: formValue.salaryInfo.netSalary || undefined,
            salaryStructure: formValue.salaryInfo.salaryStructure || undefined,
            allowances: formValue.salaryInfo.allowances || undefined,
            benefits: formValue.salaryInfo.benefits || undefined,
            bankName: formValue.financialInfo.bankName || undefined,
            bankAccountNumber: formValue.financialInfo.bankAccountNumber || undefined,
            ifsCode: formValue.financialInfo.ifsCode || undefined,
            panNumber: formValue.financialInfo.panNumber || undefined,
            aadharNumber: formValue.financialInfo.aadharNumber || undefined,
            pfNumber: formValue.financialInfo.pfNumber || undefined,
            esiNumber: formValue.financialInfo.esiNumber || undefined,
            reportingTo: formValue.organizationalInfo.reportingTo || undefined,
            subordinates: formValue.organizationalInfo.subordinates || undefined,
            roles: formValue.organizationalInfo.roles || undefined,
            responsibilities: formValue.organizationalInfo.responsibilities || undefined,
            committees: formValue.organizationalInfo.committees || undefined,
            projects: formValue.organizationalInfo.projects || undefined,
            isClassTeacher: formValue.teachingInfo.isClassTeacher || undefined,
            assignedClasses: formValue.teachingInfo.assignedClasses || undefined,
            assignedSubjects: formValue.teachingInfo.assignedSubjects || undefined,
            maxStudents: formValue.teachingInfo.maxStudents || undefined,
            currentStudents: formValue.teachingInfo.currentStudents || undefined,
            performanceRating: formValue.performanceInfo.performanceRating || undefined,
            lastAppraisalDate: formValue.performanceInfo.lastAppraisalDate ? this._dateUtils.formatDateForAPI(formValue.performanceInfo.lastAppraisalDate) : undefined,
            appraisalComments: formValue.performanceInfo.appraisalComments || undefined,
            improvementAreas: formValue.performanceInfo.improvementAreas || undefined,
            trainingNeeds: formValue.performanceInfo.trainingNeeds || undefined,
            careerGoals: formValue.performanceInfo.careerGoals || undefined,
            isProbationPeriod: formValue.performanceInfo.isProbationPeriod || undefined,
            probationEndDate: formValue.performanceInfo.probationEndDate ? this._dateUtils.formatDateForAPI(formValue.performanceInfo.probationEndDate) : undefined,
            languagesKnown: formValue.personalInfo.languagesKnown || undefined,
            hobbies: formValue.personalInfo.hobbies || undefined,
            specialSkills: formValue.personalInfo.specialSkills || undefined,
            interests: formValue.personalInfo.interests || undefined,
            remarks: formValue.personalInfo.remarks || undefined,
            notes: formValue.personalInfo.notes || undefined
        };

        this._teachersService.update(this.teacher.id, updateRequest)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (response) => {
                    this.isSaving = false;
                    this._changeDetectorRef.markForCheck();
                    this._notificationService.success('Teacher updated successfully');
                    this._router.navigate(['/teachers']);
                },
                error: (error) => {
                    console.error('Update teacher error details:', error);
                    this.isSaving = false;
                    this._changeDetectorRef.markForCheck();
                    this._notificationService.error('Error updating teacher');
                }
            });
    }

    cancel(): void {
        this._router.navigate(['/teachers']);
    }

    getPageTitle(): string {
        return this.isEditMode ? 'Edit Teacher' : 'Create Teacher';
    }

    getSaveButtonText(): string {
        return this.isSaving ? 'Saving...' : (this.isEditMode ? 'Update Teacher' : 'Create Teacher');
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
            const requiredFields = ['basicInfo.firstName', 'basicInfo.lastName', 'basicInfo.userName', 'basicInfo.phoneNumber'];
            
            for (const field of requiredFields) {
                if (!formValue[field]) {
                    return false;
                }
            }
            
            return true;
        }
        
        return this.teacherForm.valid;
    }

    getDesignationLabel(designation: Designation): string {
        const labels = {
            [Designation.Principal]: 'Principal',
            [Designation.VicePrincipal]: 'Vice Principal',
            [Designation.HeadOfDepartment]: 'Head Of Department',
            [Designation.SeniorTeacher]: 'Senior Teacher',
            [Designation.Teacher]: 'Teacher',
            [Designation.AssistantTeacher]: 'Assistant Teacher',
            [Designation.Lecturer]: 'Lecturer',
            [Designation.SeniorLecturer]: 'Senior Lecturer',
            [Designation.AssistantProfessor]: 'Assistant Professor',
            [Designation.AssociateProfessor]: 'Associate Professor',
            [Designation.Professor]: 'Professor',
            [Designation.VisitingProfessor]: 'Visiting Professor',
            [Designation.AdjunctProfessor]: 'Adjunct Professor',
            [Designation.ResearchScholar]: 'Research Scholar',
            [Designation.TeachingAssistant]: 'Teaching Assistant',
            [Designation.LabAssistant]: 'Lab Assistant',
            [Designation.Librarian]: 'Librarian',
            [Designation.AssistantLibrarian]: 'Assistant Librarian',
            [Designation.SportsTeacher]: 'Sports Teacher',
            [Designation.MusicTeacher]: 'Music Teacher',
            [Designation.ArtTeacher]: 'Art Teacher',
            [Designation.ComputerTeacher]: 'Computer Teacher',
            [Designation.Counselor]: 'Counselor',
            [Designation.Administrator]: 'Administrator',
            [Designation.AccountsOfficer]: 'Accounts Officer',
            [Designation.DataEntryOperator]: 'Data Entry Operator',
            [Designation.Peon]: 'Peon',
            [Designation.Driver]: 'Driver',
            [Designation.SecurityGuard]: 'Security Guard',
            [Designation.Other]: 'Other'
        };
        return labels[designation] || 'Unknown';
    }

    getDepartmentLabel(department: Department): string {
        const labels = {
            [Department.Mathematics]: 'Mathematics',
            [Department.Science]: 'Science',
            [Department.English]: 'English',
            [Department.History]: 'History',
            [Department.Geography]: 'Geography',
            [Department.Physics]: 'Physics',
            [Department.Chemistry]: 'Chemistry',
            [Department.Biology]: 'Biology',
            [Department.Computer]: 'Computer',
            [Department.Commerce]: 'Commerce',
            [Department.Arts]: 'Arts',
            [Department.Sports]: 'Sports',
            [Department.Music]: 'Music',
            [Department.Library]: 'Library',
            [Department.Administration]: 'Administration'
        };
        return labels[department] || 'Unknown';
    }

    getEmploymentStatusLabel(status: EmploymentStatus): string {
        const labels = {
            [EmploymentStatus.Active]: 'Active',
            [EmploymentStatus.Inactive]: 'Inactive',
            [EmploymentStatus.Resigned]: 'Resigned',
            [EmploymentStatus.Terminated]: 'Terminated',
            [EmploymentStatus.Retired]: 'Retired',
            [EmploymentStatus.OnLeave]: 'On Leave',
            [EmploymentStatus.Suspended]: 'Suspended'
        };
        return labels[status] || 'Unknown';
    }

    getEmploymentTypeLabel(type: EmploymentType): string {
        const labels = {
            [EmploymentType.FullTime]: 'Full Time',
            [EmploymentType.PartTime]: 'Part Time',
            [EmploymentType.Contract]: 'Contract',
            [EmploymentType.Temporary]: 'Temporary',
            [EmploymentType.Intern]: 'Intern',
            [EmploymentType.Consultant]: 'Consultant',
            [EmploymentType.Volunteer]: 'Volunteer'
        };
        return labels[type] || 'Unknown';
    }

    getWorkShiftLabel(shift: WorkShift): string {
        const labels = {
            [WorkShift.Morning]: 'Morning',
            [WorkShift.Afternoon]: 'Afternoon',
            [WorkShift.Evening]: 'Evening',
            [WorkShift.Night]: 'Night',
            [WorkShift.Split]: 'Split',
            [WorkShift.Flexible]: 'Flexible'
        };
        return labels[shift] || 'Unknown';
    }
} 