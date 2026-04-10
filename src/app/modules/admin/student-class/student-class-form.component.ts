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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { StudentClassesService } from '../../../core/student-classes/student-classes.service';
import { StudentClassDto, CreateStudentClassRequest, UpdateStudentClassRequest } from '../../../core/student-classes/student-classes.types';
import { StudentsService } from '../../../core/students/students.service';
import { StudentDto } from '../../../core/students/students.types';
import { ClassesService } from '../../../core/classes/classes.service';
import { ClassDto } from '../../../core/classes/classes.types';
import { AcademicYearsService } from '../../../core/academic-years/academic-years.service';
import { AcademicYearDto } from '../../../core/academic-years/academic-years.types';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'student-class-form',
    templateUrl: './student-class-form.component.html',
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
        MatProgressSpinnerModule,
        MatTooltipModule
    ]
})
export class StudentClassFormComponent implements OnInit, OnDestroy {
    form: FormGroup;
    isEditMode = false;
    isLoading = false;
    isSaving = false;
    itemId: string | null = null;

    students: StudentDto[] = [];
    classes: ClassDto[] = [];
    academicYears: AcademicYearDto[] = [];

    statusOptions = [
        { value: 'Enrolled', label: 'Enrolled' },
        { value: 'Withdrawn', label: 'Withdrawn' },
        { value: 'Graduated', label: 'Graduated' },
        { value: 'Suspended', label: 'Suspended' }
    ];

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _formBuilder: FormBuilder,
        private _studentClassesService: StudentClassesService,
        private _studentsService: StudentsService,
        private _classesService: ClassesService,
        private _academicYearsService: AcademicYearsService,
        private _router: Router,
        private _route: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _notificationService: NotificationService
    ) {
        this.form = this.createForm();
    }

    ngOnInit(): void {
        this.itemId = this._route.snapshot.paramMap.get('id');
        this.isEditMode = !!this.itemId;

        this.loadDropdowns();

        if (this.isEditMode) {
            this.loadItem();
        }
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    createForm(): FormGroup {
        return this._formBuilder.group({
            studentId: ['', [Validators.required]],
            classId: ['', [Validators.required]],
            academicYearId: ['', [Validators.required]],
            rollNumber: [''],
            status: ['Enrolled', [Validators.required]]
        });
    }

    loadDropdowns(): void {
        this._studentsService.search({ pageNumber: 1, pageSize: 200, isActive: true })
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({ next: (r) => { this.students = r.data; this._changeDetectorRef.markForCheck(); }, error: () => {} });

        this._classesService.search({ pageNumber: 1, pageSize: 200 })
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({ next: (r) => { this.classes = r.data; this._changeDetectorRef.markForCheck(); }, error: () => {} });

        this._academicYearsService.search({ pageNumber: 1, pageSize: 100, isActive: true })
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({ next: (r) => { this.academicYears = r.data; this._changeDetectorRef.markForCheck(); }, error: () => {} });
    }

    loadItem(): void {
        if (!this.itemId) return;
        this.isLoading = true;
        this._changeDetectorRef.markForCheck();

        this._studentClassesService.getById(this.itemId)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (item: StudentClassDto) => {
                    this.form.patchValue({
                        studentId: item.studentId,
                        classId: item.classId,
                        academicYearId: item.academicYearId,
                        rollNumber: item.rollNumber,
                        status: item.status
                    });
                    // Disable fields that can't be changed in edit mode
                    this.form.get('studentId')?.disable();
                    this.form.get('classId')?.disable();
                    this.form.get('academicYearId')?.disable();
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                },
                error: () => {
                    this._notificationService.error('Error loading assignment details');
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                }
            });
    }

    save(): void {
        if (this.form.invalid) { this.form.markAllAsTouched(); return; }
        this.isSaving = true;
        this._changeDetectorRef.markForCheck();

        if (this.isEditMode) {
            const request: UpdateStudentClassRequest = {
                id: this.itemId!,
                rollNumber: this.form.get('rollNumber')?.value || undefined,
                status: this.form.get('status')?.value
            };
            this._studentClassesService.update(this.itemId!, request)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe({
                    next: () => { this.isSaving = false; this._notificationService.success('Assignment updated successfully'); this._router.navigate(['/student-classes']); },
                    error: () => { this.isSaving = false; this._changeDetectorRef.markForCheck(); this._notificationService.error('Error updating assignment'); }
                });
        } else {
            const formValue = this.form.value;
            const request: CreateStudentClassRequest = {
                studentId: formValue.studentId,
                classId: formValue.classId,
                academicYearId: formValue.academicYearId,
                rollNumber: formValue.rollNumber || undefined
            };
            this._studentClassesService.create(request)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe({
                    next: () => { this.isSaving = false; this._notificationService.success('Student assigned to class successfully'); this._router.navigate(['/student-classes']); },
                    error: () => { this.isSaving = false; this._changeDetectorRef.markForCheck(); this._notificationService.error('Error creating assignment'); }
                });
        }
    }

    cancel(): void { this._router.navigate(['/student-classes']); }
    getPageTitle(): string { return this.isEditMode ? 'Edit Assignment' : 'Assign Student to Class'; }
    getSaveButtonText(): string { return this.isSaving ? 'Saving...' : (this.isEditMode ? 'Update' : 'Assign'); }

    getStudentDisplayName(student: StudentDto): string {
        return `${student.firstName} ${student.lastName}`.trim();
    }
}
