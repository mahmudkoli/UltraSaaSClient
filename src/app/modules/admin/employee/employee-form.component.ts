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
import { EmployeesService } from '../../../core/employees/employees.service';
import { EmployeeDto, CreateEmployeeRequest, UpdateEmployeeRequest, Designation, Department, EmploymentStatus, EmploymentType, WorkShift } from '../../../core/employees/employees.types';
import { NotificationService } from '../../../core/services/notification.service';
import { DateUtils } from '../../../core/utils/date.utils';
import { passwordMatchValidator } from '../../../core/validators/password-match.validator';

@Component({
    selector: 'employee-form',
    templateUrl: './employee-form.component.html',
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
export class EmployeeFormComponent implements OnInit, OnDestroy {
    employeeForm: FormGroup;
    employee: EmployeeDto | null = null;
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
        private _employeesService: EmployeesService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseAlertService: FuseAlertService,
        private _router: Router,
        private _route: ActivatedRoute,
        private _notificationService: NotificationService,
        private _dateUtils: DateUtils
    ) {
        this.employeeForm = this._formBuilder.group({
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
                previousEmployers: ['', Validators.maxLength(500)],
                previousPositions: ['', Validators.maxLength(500)],
                experienceDetails: ['', Validators.maxLength(1000)],
                achievements: ['', Validators.maxLength(1000)],
                awards: ['', Validators.maxLength(1000)],
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
        const employeeId = this._route.snapshot.paramMap.get('id');
        
        if (employeeId && employeeId !== 'create') {
            this.isEditMode = true;
            this.loadEmployee(employeeId);
            // Remove password validation in edit mode
            this.employeeForm.get('basicInfo.password')?.clearValidators();
            this.employeeForm.get('basicInfo.confirmPassword')?.clearValidators();
            this.employeeForm.get('basicInfo.password')?.updateValueAndValidity();
            this.employeeForm.get('basicInfo.confirmPassword')?.updateValueAndValidity();
        } else {
            this.isEditMode = false;
            // Password is required in create mode
            this.employeeForm.get('basicInfo.password')?.setValidators([Validators.required, Validators.minLength(6)]);
            this.employeeForm.get('basicInfo.confirmPassword')?.setValidators([Validators.required]);
            this.employeeForm.get('basicInfo.password')?.updateValueAndValidity();
            this.employeeForm.get('basicInfo.confirmPassword')?.updateValueAndValidity();
        }
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    loadEmployee(id: string): void {
        this.isLoading = true;
        this._changeDetectorRef.markForCheck();

        this._employeesService.getById(id)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (employee: EmployeeDto) => {
                    this.employee = employee;
                    this.patchForm(employee);
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                },
                error: (error) => {
                    console.error('Error loading employee:', error);
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                    this._notificationService.error('Error loading employee');
                }
            });
    }

    patchForm(employee: EmployeeDto): void {
        this.employeeForm.patchValue({
            basicInfo: {
                firstName: employee.firstName,
                lastName: employee.lastName,
                userName: employee.userName,
                email: employee.email || '',
                phoneNumber: employee.phoneNumber || '',
                address: employee.address || '',
                gender: employee.gender || '',
                dateOfBirth: employee.dateOfBirth ? new Date(employee.dateOfBirth) : '',
                password: '',
                confirmPassword: ''
            },
            professionalInfo: {
                designation: employee.designation || '',
                department: employee.department || '',
                employeeId: employee.employeeId || '',
                employeeCode: employee.employeeCode || '',
                joiningDate: employee.joiningDate ? new Date(employee.joiningDate) : '',
                confirmationDate: employee.confirmationDate ? new Date(employee.confirmationDate) : '',
                resignationDate: employee.resignationDate ? new Date(employee.resignationDate) : '',
                lastWorkingDate: employee.lastWorkingDate ? new Date(employee.lastWorkingDate) : '',
                employmentStatus: employee.employmentStatus || '',
                employmentType: employee.employmentType || '',
                workLocation: employee.workLocation || '',
                workShift: employee.workShift || '',
                workingHours: employee.workingHours || ''
            },
            experienceInfo: {
                totalExperience: employee.totalExperience || '',
                previousEmployers: employee.previousEmployers || '',
                previousPositions: employee.previousPositions || '',
                experienceDetails: employee.experienceDetails || '',
                achievements: employee.achievements || '',
                awards: employee.awards || '',
            },
            salaryInfo: {
                basicSalary: employee.basicSalary || '',
                grossSalary: employee.grossSalary || '',
                netSalary: employee.netSalary || '',
                salaryStructure: employee.salaryStructure || '',
                allowances: employee.allowances || '',
                benefits: employee.benefits || ''
            },
            financialInfo: {
                bankName: employee.bankName || '',
                bankAccountNumber: employee.bankAccountNumber || '',
                ifsCode: employee.ifsCode || '',
                panNumber: employee.panNumber || '',
                aadharNumber: employee.aadharNumber || '',
                pfNumber: employee.pfNumber || '',
                esiNumber: employee.esiNumber || ''
            },
            organizationalInfo: {
                reportingTo: employee.reportingTo || '',
                subordinates: employee.subordinates || '',
                roles: employee.roles || '',
                responsibilities: employee.responsibilities || '',
                committees: employee.committees || '',
                projects: employee.projects || ''
            },
            performanceInfo: {
                performanceRating: employee.performanceRating || '',
                lastAppraisalDate: employee.lastAppraisalDate ? new Date(employee.lastAppraisalDate) : '',
                appraisalComments: employee.appraisalComments || '',
                improvementAreas: employee.improvementAreas || '',
                trainingNeeds: employee.trainingNeeds || '',
                careerGoals: employee.careerGoals || '',
                isProbationPeriod: employee.isProbationPeriod || false,
                probationEndDate: employee.probationEndDate ? new Date(employee.probationEndDate) : ''
            },
            emergencyContact: {
                emergencyContact: employee.emergencyContact || '',
                emergencyPhone: employee.emergencyPhone || '',
                emergencyEmail: employee.emergencyEmail || '',
                emergencyAddress: employee.emergencyAddress || '',
                emergencyRelationship: employee.emergencyRelationship || ''
            },
            personalInfo: {
                languagesKnown: employee.languagesKnown || '',
                hobbies: employee.hobbies || '',
                specialSkills: employee.specialSkills || '',
                interests: employee.interests || '',
                remarks: employee.remarks || '',
                notes: employee.notes || ''
            }
        });
    }

    save(): void {
        if (this.employeeForm.invalid) {
            return;
        }

        this.isSaving = true;
        this._changeDetectorRef.markForCheck();

        if (this.isEditMode) {
            this.updateEmployee();
        } else {
            this.createEmployee();
        }
    }

    createEmployee(): void {
        const formValue = this.employeeForm.value;

        const createRequest: CreateEmployeeRequest = {
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
            previousEmployers: formValue.experienceInfo.previousEmployers || undefined,
            previousPositions: formValue.experienceInfo.previousPositions || undefined,
            experienceDetails: formValue.experienceInfo.experienceDetails || undefined,
            achievements: formValue.experienceInfo.achievements || undefined,
            awards: formValue.experienceInfo.awards || undefined,
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
            languagesKnown: formValue.personalInfo.languagesKnown || undefined,
            hobbies: formValue.personalInfo.hobbies || undefined,
            specialSkills: formValue.personalInfo.specialSkills || undefined,
            interests: formValue.personalInfo.interests || undefined,
            remarks: formValue.personalInfo.remarks || undefined,
            notes: formValue.personalInfo.notes || undefined,
            password: formValue.basicInfo.password
        };

        this._employeesService.create(createRequest)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (response) => {
                    this.isSaving = false;
                    this._changeDetectorRef.markForCheck();
                    this._notificationService.success('Employee created successfully');
                    this._router.navigate(['/employees']);
                },
                error: (error) => {
                    console.error('Create employee error details:', error);
                    this.isSaving = false;
                    this._changeDetectorRef.markForCheck();
                    this._notificationService.error('Error creating employee');
                }
            });
    }

    updateEmployee(): void {
        if (!this.employee?.id) return;

        const formValue = this.employeeForm.value;

        const updateRequest: UpdateEmployeeRequest = {
            id: this.employee.id,
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
            previousEmployers: formValue.experienceInfo.previousEmployers || undefined,
            previousPositions: formValue.experienceInfo.previousPositions || undefined,
            experienceDetails: formValue.experienceInfo.experienceDetails || undefined,
            achievements: formValue.experienceInfo.achievements || undefined,
            awards: formValue.experienceInfo.awards || undefined,
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

        this._employeesService.update(this.employee.id, updateRequest)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (response) => {
                    this.isSaving = false;
                    this._changeDetectorRef.markForCheck();
                    this._notificationService.success('Employee updated successfully');
                    this._router.navigate(['/employees']);
                },
                error: (error) => {
                    console.error('Update employee error details:', error);
                    this.isSaving = false;
                    this._changeDetectorRef.markForCheck();
                    this._notificationService.error('Error updating employee');
                }
            });
    }

    cancel(): void {
        this._router.navigate(['/employees']);
    }

    getPageTitle(): string {
        return this.isEditMode ? 'Edit Employee' : 'Create Employee';
    }

    getSaveButtonText(): string {
        return this.isSaving ? 'Saving...' : (this.isEditMode ? 'Update Employee' : 'Create Employee');
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
            const formValue = this.employeeForm.value;
            const requiredFields = ['basicInfo.firstName', 'basicInfo.lastName', 'basicInfo.userName', 'basicInfo.phoneNumber'];
            
            for (const field of requiredFields) {
                if (!formValue[field]) {
                    return false;
                }
            }
            
            return true;
        }
        
        return this.employeeForm.valid;
    }

    getDesignationLabel(designation: Designation): string {
        const labels = {
            [Designation.Principal]: 'Principal',
            [Designation.VicePrincipal]: 'Vice Principal',
            [Designation.HeadOfDepartment]: 'Head Of Department',
            [Designation.SeniorEmployee]: 'Senior Employee',
            [Designation.Employee]: 'Employee',
            [Designation.AssistantEmployee]: 'Assistant Employee',
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
            [Designation.SportsEmployee]: 'Sports Employee',
            [Designation.MusicEmployee]: 'Music Employee',
            [Designation.ArtEmployee]: 'Art Employee',
            [Designation.ComputerEmployee]: 'Computer Employee',
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