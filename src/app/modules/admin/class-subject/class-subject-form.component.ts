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
import { ClassSubjectsService } from '../../../core/class-subjects/class-subjects.service';
import { ClassSubjectDto, CreateClassSubjectRequest, UpdateClassSubjectRequest } from '../../../core/class-subjects/class-subjects.types';
import { ClassesService } from '../../../core/classes/classes.service';
import { ClassDto } from '../../../core/classes/classes.types';
import { SubjectsService } from '../../../core/subjects/subjects.service';
import { SubjectDto } from '../../../core/subjects/subjects.types';
import { TeachersService } from '../../../core/teachers/teachers.service';
import { TeacherDto } from '../../../core/teachers/teachers.types';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'class-subject-form',
    templateUrl: './class-subject-form.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule,
        MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatIconModule, MatInputModule,
        MatSelectModule, MatProgressSpinnerModule, MatTooltipModule
    ]
})
export class ClassSubjectFormComponent implements OnInit, OnDestroy {
    form: FormGroup;
    isEditMode = false;
    isLoading = false;
    isSaving = false;
    itemId: string | null = null;

    classes: ClassDto[] = [];
    subjects: SubjectDto[] = [];
    teachers: TeacherDto[] = [];

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _formBuilder: FormBuilder,
        private _service: ClassSubjectsService,
        private _classesService: ClassesService,
        private _subjectsService: SubjectsService,
        private _teachersService: TeachersService,
        private _router: Router,
        private _route: ActivatedRoute,
        private _cdr: ChangeDetectorRef,
        private _notificationService: NotificationService
    ) {
        this.form = this.createForm();
    }

    ngOnInit(): void {
        this.itemId = this._route.snapshot.paramMap.get('id');
        this.isEditMode = !!this.itemId;
        this.loadDropdowns();
        if (this.isEditMode) { this.loadItem(); }
    }

    ngOnDestroy(): void { this._unsubscribeAll.next(null); this._unsubscribeAll.complete(); }

    createForm(): FormGroup {
        return this._formBuilder.group({
            classId: ['', [Validators.required]],
            subjectId: ['', [Validators.required]],
            teacherId: ['', [Validators.required]],
            weeklyHours: [1, [Validators.required, Validators.min(1), Validators.max(40)]],
            isActive: [true]
        });
    }

    loadDropdowns(): void {
        this._classesService.search({ pageNumber: 1, pageSize: 200 })
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({ next: (r) => { this.classes = r.data; this._cdr.markForCheck(); }, error: () => {} });
        this._subjectsService.search({ pageNumber: 1, pageSize: 200 })
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({ next: (r) => { this.subjects = r.data; this._cdr.markForCheck(); }, error: () => {} });
        this._teachersService.search({ pageNumber: 1, pageSize: 200 })
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({ next: (r) => { this.teachers = r.data; this._cdr.markForCheck(); }, error: () => {} });
    }

    loadItem(): void {
        if (!this.itemId) return;
        this.isLoading = true;
        this._cdr.markForCheck();
        this._service.getById(this.itemId).pipe(takeUntil(this._unsubscribeAll)).subscribe({
            next: (item: ClassSubjectDto) => {
                this.form.patchValue({
                    classId: item.classId,
                    subjectId: item.subjectId,
                    teacherId: item.teacherId,
                    weeklyHours: item.weeklyHours,
                    isActive: item.isActive
                });
                this.form.get('classId')?.disable();
                this.form.get('subjectId')?.disable();
                this.isLoading = false;
                this._cdr.markForCheck();
            },
            error: () => { this._notificationService.error('Error loading class subject'); this.isLoading = false; this._cdr.markForCheck(); }
        });
    }

    save(): void {
        if (this.form.invalid) { this.form.markAllAsTouched(); return; }
        this.isSaving = true;
        this._cdr.markForCheck();

        if (this.isEditMode) {
            const fv = this.form.getRawValue();
            const request: UpdateClassSubjectRequest = {
                id: this.itemId!,
                teacherId: fv.teacherId,
                weeklyHours: fv.weeklyHours,
                isActive: fv.isActive
            };
            this._service.update(this.itemId!, request).pipe(takeUntil(this._unsubscribeAll)).subscribe({
                next: () => { this.isSaving = false; this._notificationService.success('Class subject updated'); this._router.navigate(['/class-subjects']); },
                error: () => { this.isSaving = false; this._cdr.markForCheck(); this._notificationService.error('Error updating class subject'); }
            });
        } else {
            const fv = this.form.value;
            const request: CreateClassSubjectRequest = {
                classId: fv.classId,
                subjectId: fv.subjectId,
                teacherId: fv.teacherId,
                weeklyHours: fv.weeklyHours,
                isActive: fv.isActive
            };
            this._service.create(request).pipe(takeUntil(this._unsubscribeAll)).subscribe({
                next: () => { this.isSaving = false; this._notificationService.success('Class subject created'); this._router.navigate(['/class-subjects']); },
                error: () => { this.isSaving = false; this._cdr.markForCheck(); this._notificationService.error('Error creating class subject'); }
            });
        }
    }

    cancel(): void { this._router.navigate(['/class-subjects']); }
    getPageTitle(): string { return this.isEditMode ? 'Edit Class Subject' : 'Assign Subject to Class'; }
    getSaveButtonText(): string { return this.isSaving ? 'Saving...' : (this.isEditMode ? 'Update' : 'Assign'); }
    getTeacherDisplayName(t: TeacherDto): string { return `${t.firstName} ${t.lastName}`.trim(); }
}
