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
import { ClassesService } from '../../../core/classes/classes.service';
import { ClassDto, CreateClassRequest, UpdateClassRequest } from '../../../core/classes/classes.types';
import { AcademicYearsService } from '../../../core/academic-years/academic-years.service';
import { AcademicYearDto } from '../../../core/academic-years/academic-years.types';
import { NotificationService } from '../../../core/services/notification.service';
import { EducationLevel } from '../../../core/students/students.types';
import { TeachersService } from '../../../core/teachers/teachers.service';
import { TeacherDto } from '../../../core/teachers/teachers.types';

@Component({
    selector: 'class-form',
    templateUrl: './class-form.component.html',
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
export class ClassFormComponent implements OnInit, OnDestroy {
    classForm: FormGroup;
    isEditMode = false;
    isLoading = false;
    isSaving = false;
    classId: string | null = null;

    academicYears: AcademicYearDto[] = [];
    teachers: TeacherDto[] = [];
    gradeOptions = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `Grade ${i + 1}` }));

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

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _formBuilder: FormBuilder,
        private _classesService: ClassesService,
        private _academicYearsService: AcademicYearsService,
        private _teachersService: TeachersService,
        private _router: Router,
        private _route: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _notificationService: NotificationService
    ) {
        this.classForm = this.createForm();
    }

    ngOnInit(): void {
        this.classId = this._route.snapshot.paramMap.get('id');
        this.isEditMode = !!this.classId;

        this.loadAcademicYears();
        this.loadTeachers();

        if (this.isEditMode) {
            this.loadClass();
        }
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    createForm(): FormGroup {
        return this._formBuilder.group({
            name: ['', [Validators.required, Validators.maxLength(100)]],
            code: ['', [Validators.required, Validators.maxLength(20)]],
            grade: [null, [Validators.required, Validators.min(1), Validators.max(12)]],
            section: ['', [Validators.maxLength(10)]],
            capacity: [30, [Validators.required, Validators.min(1), Validators.max(100)]],
            description: ['', [Validators.maxLength(500)]],
            roomNumber: ['', [Validators.maxLength(20)]],
            floor: ['', [Validators.maxLength(20)]],
            building: ['', [Validators.maxLength(50)]],
            academicYearId: ['', [Validators.required]],
            educationLevel: [''],
            // Phase v1 QA BUG-3 — class teacher is now picked from the teachers
            // list (id) rather than free text; the name is derived on save.
            classTeacherId: ['']
        });
    }

    loadTeachers(): void {
        this._teachersService.search({ pageNumber: 1, pageSize: 200 })
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (response) => {
                    this.teachers = response.data;
                    this._changeDetectorRef.markForCheck();
                },
                error: () => {}
            });
    }

    teacherName(id: string | null | undefined): string | undefined {
        const t = this.teachers.find(x => x.id === id);
        if (!t) return undefined;
        return `${t.firstName ?? ''} ${t.lastName ?? ''}`.trim() || t.userName;
    }

    loadAcademicYears(): void {
        this._academicYearsService.search({ pageNumber: 1, pageSize: 100, isActive: true })
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (response) => {
                    this.academicYears = response.data;
                    this._changeDetectorRef.markForCheck();
                },
                error: () => {}
            });
    }

    loadClass(): void {
        if (!this.classId) return;

        this.isLoading = true;
        this._changeDetectorRef.markForCheck();

        this._classesService.getById(this.classId)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (classItem: ClassDto) => {
                    this.classForm.patchValue({
                        name: classItem.name,
                        code: classItem.code,
                        grade: classItem.grade,
                        section: classItem.section,
                        capacity: classItem.capacity,
                        description: classItem.description,
                        roomNumber: classItem.roomNumber,
                        floor: classItem.floor,
                        building: classItem.building,
                        academicYearId: classItem.academicYearId,
                        educationLevel: classItem.educationLevel,
                        classTeacherId: classItem.classTeacherId
                    });
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                },
                error: (error) => {
                    console.error('Error loading class:', error);
                    this._notificationService.error('Error loading class details');
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                }
            });
    }

    save(): void {
        if (this.classForm.invalid) {
            this.classForm.markAllAsTouched();
            return;
        }

        this.isSaving = true;
        this._changeDetectorRef.markForCheck();

        if (this.isEditMode) {
            this.updateClass();
        } else {
            this.createClass();
        }
    }

    createClass(): void {
        const formValue = this.classForm.value;

        const request: CreateClassRequest = {
            name: formValue.name,
            code: formValue.code,
            grade: formValue.grade,
            capacity: formValue.capacity,
            academicYearId: formValue.academicYearId,
            section: formValue.section || undefined,
            description: formValue.description || undefined,
            roomNumber: formValue.roomNumber || undefined,
            floor: formValue.floor || undefined,
            building: formValue.building || undefined,
            educationLevel: formValue.educationLevel ? Number(formValue.educationLevel) : undefined,
            classTeacherId: formValue.classTeacherId || undefined,
            classTeacherName: this.teacherName(formValue.classTeacherId)
        };

        this._classesService.create(request)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: () => {
                    this.isSaving = false;
                    this._changeDetectorRef.markForCheck();
                    this._notificationService.success('Class created successfully');
                    this._router.navigate(['/classes']);
                },
                error: (error) => {
                    console.error('Error creating class:', error);
                    this.isSaving = false;
                    this._changeDetectorRef.markForCheck();
                    this._notificationService.error('Error creating class');
                }
            });
    }

    updateClass(): void {
        if (!this.classId) return;

        const formValue = this.classForm.value;

        const request: UpdateClassRequest = {
            id: this.classId,
            name: formValue.name,
            code: formValue.code,
            grade: formValue.grade,
            capacity: formValue.capacity,
            academicYearId: formValue.academicYearId,
            section: formValue.section || undefined,
            description: formValue.description || undefined,
            roomNumber: formValue.roomNumber || undefined,
            floor: formValue.floor || undefined,
            building: formValue.building || undefined,
            educationLevel: formValue.educationLevel ? Number(formValue.educationLevel) : undefined,
            classTeacherId: formValue.classTeacherId || undefined,
            classTeacherName: this.teacherName(formValue.classTeacherId)
        };

        this._classesService.update(this.classId, request)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: () => {
                    this.isSaving = false;
                    this._changeDetectorRef.markForCheck();
                    this._notificationService.success('Class updated successfully');
                    this._router.navigate(['/classes']);
                },
                error: (error) => {
                    console.error('Error updating class:', error);
                    this.isSaving = false;
                    this._changeDetectorRef.markForCheck();
                    this._notificationService.error('Error updating class');
                }
            });
    }

    cancel(): void {
        this._router.navigate(['/classes']);
    }

    getPageTitle(): string {
        return this.isEditMode ? 'Edit Class' : 'Add Class';
    }

    getSaveButtonText(): string {
        return this.isSaving ? 'Saving...' : (this.isEditMode ? 'Update Class' : 'Create Class');
    }
}
