import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ExamsService } from '../../../core/exams/exams.service';
import { ExamDto, CreateExamRequest, UpdateExamRequest } from '../../../core/exams/exams.types';
import { AcademicYearsService } from '../../../core/academic-years/academic-years.service';
import { AcademicYearDto } from '../../../core/academic-years/academic-years.types';
import { NotificationService } from '../../../core/services/notification.service';
import { DateUtils } from '../../../core/utils/date.utils';

function dateRangeValidator(control: AbstractControl): ValidationErrors | null {
    const startDate = control.get('startDate')?.value;
    const endDate = control.get('endDate')?.value;
    if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
        return { dateRange: true };
    }
    return null;
}

@Component({
    selector: 'exam-form',
    templateUrl: './exam-form.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule,
        MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule,
        MatSelectModule, MatDatepickerModule, MatNativeDateModule,
        MatProgressSpinnerModule, MatTooltipModule
    ]
})
export class ExamFormComponent implements OnInit, OnDestroy {
    form: FormGroup;
    isEditMode = false;
    isLoading = false;
    isSaving = false;
    itemId: string | null = null;
    academicYears: AcademicYearDto[] = [];

    examTypeOptions = [
        'UnitTest', 'MidTerm', 'Final', 'Quiz', 'Assignment', 'Project', 'Practical',
        'Semester', 'Viva', 'Thesis', 'Dissertation', 'MockTest', 'PracticeTest',
        'Entrance', 'Competitive', 'SkillAssessment', 'Comprehensive', 'Qualifying',
        'Placement', 'Certification', 'Online', 'Proctored', 'Oral', 'Written',
        'Laboratory', 'Field', 'Clinical', 'Portfolio', 'Other'
    ];

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _formBuilder: FormBuilder,
        private _service: ExamsService,
        private _academicYearsService: AcademicYearsService,
        private _router: Router,
        private _route: ActivatedRoute,
        private _cdr: ChangeDetectorRef,
        private _notificationService: NotificationService,
        private _dateUtils: DateUtils
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
            name: ['', [Validators.required, Validators.maxLength(100)]],
            code: ['', [Validators.required, Validators.maxLength(20)]],
            description: ['', [Validators.maxLength(500)]],
            startDate: [null, [Validators.required]],
            endDate: [null, [Validators.required]],
            examType: ['', [Validators.required]],
            academicYearId: ['', [Validators.required]],
            totalMarks: [100, [Validators.required, Validators.min(1)]],
            passingMarks: [40, [Validators.required, Validators.min(1)]]
        }, { validators: dateRangeValidator });
    }

    loadDropdowns(): void {
        this._academicYearsService.search({ pageNumber: 1, pageSize: 200, isActive: true })
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({ next: (r) => { this.academicYears = r.data; this._cdr.markForCheck(); }, error: () => {} });
    }

    loadItem(): void {
        if (!this.itemId) return;
        this.isLoading = true;
        this._cdr.markForCheck();
        this._service.getById(this.itemId).pipe(takeUntil(this._unsubscribeAll)).subscribe({
            next: (item: ExamDto) => {
                this.form.patchValue({
                    name: item.name,
                    code: item.code,
                    description: item.description,
                    startDate: item.startDate ? new Date(item.startDate) : null,
                    endDate: item.endDate ? new Date(item.endDate) : null,
                    examType: item.examType,
                    academicYearId: item.academicYearId,
                    totalMarks: item.totalMarks,
                    passingMarks: item.passingMarks
                });
                this.form.get('examType')?.disable();
                this.form.get('academicYearId')?.disable();
                this.isLoading = false;
                this._cdr.markForCheck();
            },
            error: () => { this._notificationService.error('Error loading exam'); this.isLoading = false; this._cdr.markForCheck(); }
        });
    }

    save(): void {
        if (this.form.invalid) { this.form.markAllAsTouched(); return; }
        this.isSaving = true;
        this._cdr.markForCheck();

        if (this.isEditMode) {
            const fv = this.form.getRawValue();
            const request: UpdateExamRequest = {
                id: this.itemId!,
                name: fv.name,
                code: fv.code,
                description: fv.description || undefined,
                startDate: this._dateUtils.formatDateForAPI(fv.startDate),
                endDate: this._dateUtils.formatDateForAPI(fv.endDate),
                totalMarks: fv.totalMarks,
                passingMarks: fv.passingMarks
            };
            this._service.update(this.itemId!, request).pipe(takeUntil(this._unsubscribeAll)).subscribe({
                next: () => { this.isSaving = false; this._notificationService.success('Exam updated'); this._router.navigate(['/exams']); },
                error: () => { this.isSaving = false; this._cdr.markForCheck(); this._notificationService.error('Error updating exam'); }
            });
        } else {
            const fv = this.form.value;
            const request: CreateExamRequest = {
                name: fv.name,
                code: fv.code,
                description: fv.description || undefined,
                startDate: this._dateUtils.formatDateForAPI(fv.startDate),
                endDate: this._dateUtils.formatDateForAPI(fv.endDate),
                examType: fv.examType,
                academicYearId: fv.academicYearId,
                totalMarks: fv.totalMarks,
                passingMarks: fv.passingMarks
            };
            this._service.create(request).pipe(takeUntil(this._unsubscribeAll)).subscribe({
                next: () => { this.isSaving = false; this._notificationService.success('Exam created'); this._router.navigate(['/exams']); },
                error: () => { this.isSaving = false; this._cdr.markForCheck(); this._notificationService.error('Error creating exam'); }
            });
        }
    }

    cancel(): void { this._router.navigate(['/exams']); }
    getPageTitle(): string { return this.isEditMode ? 'Edit Exam' : 'Create Exam'; }
    getSaveButtonText(): string { return this.isSaving ? 'Saving...' : (this.isEditMode ? 'Update' : 'Save'); }
}
