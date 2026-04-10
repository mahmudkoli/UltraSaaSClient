import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SubjectsService } from '../../../core/subjects/subjects.service';
import { SubjectDto, SubjectType, CreateSubjectRequest, UpdateSubjectRequest } from '../../../core/subjects/subjects.types';
import { NotificationService } from '../../../core/services/notification.service';
import { EducationLevel } from '../../../core/students/students.types';

@Component({
    selector: 'subject-form',
    templateUrl: './subject-form.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        MatProgressSpinnerModule,
        MatTooltipModule
    ]
})
export class SubjectFormComponent implements OnInit, OnDestroy {
    subjectForm: FormGroup;
    isEditMode = false;
    isLoading = false;
    isSaving = false;
    subjectId: string | null = null;

    subjectTypeOptions = [
        { value: SubjectType.Core, label: 'Core' },
        { value: SubjectType.Elective, label: 'Elective' },
        { value: SubjectType.Optional, label: 'Optional' },
        { value: SubjectType.Practical, label: 'Practical' },
        { value: SubjectType.Theory, label: 'Theory' },
        { value: SubjectType.Lab, label: 'Lab' },
        { value: SubjectType.Major, label: 'Major' },
        { value: SubjectType.Minor, label: 'Minor' },
        { value: SubjectType.Seminar, label: 'Seminar' },
        { value: SubjectType.Project, label: 'Project' },
        { value: SubjectType.Internship, label: 'Internship' },
        { value: SubjectType.TestPrep, label: 'Test Prep' },
        { value: SubjectType.SkillBased, label: 'Skill Based' },
        { value: SubjectType.Workshop, label: 'Workshop' },
        { value: SubjectType.Research, label: 'Research' },
        { value: SubjectType.Dissertation, label: 'Dissertation' },
        { value: SubjectType.Thesis, label: 'Thesis' },
        { value: SubjectType.FieldWork, label: 'Field Work' },
        { value: SubjectType.Clinical, label: 'Clinical' },
        { value: SubjectType.Industrial, label: 'Industrial' },
        { value: SubjectType.Online, label: 'Online' },
        { value: SubjectType.Hybrid, label: 'Hybrid' },
        { value: SubjectType.Blended, label: 'Blended' },
        { value: SubjectType.SelfStudy, label: 'Self Study' }
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

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _formBuilder: FormBuilder,
        private _subjectsService: SubjectsService,
        private _router: Router,
        private _route: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _notificationService: NotificationService
    ) {
        this.subjectForm = this.createForm();
    }

    ngOnInit(): void {
        this.subjectId = this._route.snapshot.paramMap.get('id');
        this.isEditMode = !!this.subjectId;

        if (this.isEditMode) {
            this.loadSubject();
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
            description: ['', [Validators.maxLength(500)]],
            creditHours: [null, [Validators.min(1), Validators.max(10)]],
            subjectType: [''],
            applicableLevel: [''],
            syllabus: [''],
            prerequisites: [''],
            isPractical: [false],
            isTheory: [true],
            theoryHours: [null, [Validators.min(0), Validators.max(100)]],
            practicalHours: [null, [Validators.min(0), Validators.max(100)]],
            department: ['', [Validators.maxLength(100)]]
        });
    }

    loadSubject(): void {
        if (!this.subjectId) return;

        this.isLoading = true;
        this._changeDetectorRef.markForCheck();

        this._subjectsService.getById(this.subjectId)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (subject: SubjectDto) => {
                    this.subjectForm.patchValue({
                        name: subject.name,
                        code: subject.code,
                        description: subject.description,
                        creditHours: subject.creditHours,
                        subjectType: subject.subjectType,
                        applicableLevel: subject.applicableLevel,
                        syllabus: subject.syllabus,
                        prerequisites: subject.prerequisites,
                        isPractical: subject.isPractical,
                        isTheory: subject.isTheory,
                        theoryHours: subject.theoryHours,
                        practicalHours: subject.practicalHours,
                        department: subject.department
                    });
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                },
                error: (error) => {
                    console.error('Error loading subject:', error);
                    this._notificationService.error('Error loading subject details');
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                }
            });
    }

    save(): void {
        if (this.subjectForm.invalid) {
            this.subjectForm.markAllAsTouched();
            return;
        }

        this.isSaving = true;
        this._changeDetectorRef.markForCheck();

        if (this.isEditMode) {
            this.updateSubject();
        } else {
            this.createSubject();
        }
    }

    createSubject(): void {
        const formValue = this.subjectForm.value;

        const request: CreateSubjectRequest = {
            name: formValue.name,
            code: formValue.code,
            description: formValue.description || undefined,
            creditHours: formValue.creditHours || undefined,
            subjectType: formValue.subjectType ? Number(formValue.subjectType) : undefined,
            applicableLevel: formValue.applicableLevel ? Number(formValue.applicableLevel) : undefined,
            syllabus: formValue.syllabus || undefined,
            prerequisites: formValue.prerequisites || undefined,
            isPractical: formValue.isPractical,
            isTheory: formValue.isTheory,
            theoryHours: formValue.theoryHours || undefined,
            practicalHours: formValue.practicalHours || undefined,
            department: formValue.department || undefined
        };

        this._subjectsService.create(request)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: () => {
                    this.isSaving = false;
                    this._changeDetectorRef.markForCheck();
                    this._notificationService.success('Subject created successfully');
                    this._router.navigate(['/subjects']);
                },
                error: (error) => {
                    console.error('Error creating subject:', error);
                    this.isSaving = false;
                    this._changeDetectorRef.markForCheck();
                    this._notificationService.error('Error creating subject');
                }
            });
    }

    updateSubject(): void {
        if (!this.subjectId) return;

        const formValue = this.subjectForm.value;

        const request: UpdateSubjectRequest = {
            id: this.subjectId,
            name: formValue.name,
            code: formValue.code,
            description: formValue.description || undefined,
            creditHours: formValue.creditHours || undefined,
            subjectType: formValue.subjectType ? Number(formValue.subjectType) : undefined,
            applicableLevel: formValue.applicableLevel ? Number(formValue.applicableLevel) : undefined,
            syllabus: formValue.syllabus || undefined,
            prerequisites: formValue.prerequisites || undefined,
            isPractical: formValue.isPractical,
            isTheory: formValue.isTheory,
            theoryHours: formValue.theoryHours || undefined,
            practicalHours: formValue.practicalHours || undefined,
            department: formValue.department || undefined
        };

        this._subjectsService.update(this.subjectId, request)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: () => {
                    this.isSaving = false;
                    this._changeDetectorRef.markForCheck();
                    this._notificationService.success('Subject updated successfully');
                    this._router.navigate(['/subjects']);
                },
                error: (error) => {
                    console.error('Error updating subject:', error);
                    this.isSaving = false;
                    this._changeDetectorRef.markForCheck();
                    this._notificationService.error('Error updating subject');
                }
            });
    }

    cancel(): void {
        this._router.navigate(['/subjects']);
    }

    getPageTitle(): string {
        return this.isEditMode ? 'Edit Subject' : 'Add Subject';
    }

    getSaveButtonText(): string {
        return this.isSaving ? 'Saving...' : (this.isEditMode ? 'Update Subject' : 'Create Subject');
    }
}
