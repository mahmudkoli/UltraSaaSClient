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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ExamResultsService } from '../../../core/exam-results/exam-results.service';
import { ExamResultDto, ExamType, CreateExamResultRequest, UpdateExamResultRequest } from '../../../core/exam-results/exam-results.types';
import { StudentsService } from '../../../core/students/students.service';
import { StudentDto } from '../../../core/students/students.types';
import { ExamsService } from '../../../core/exams/exams.service';
import { ExamDto } from '../../../core/exams/exams.types';
import { SubjectsService } from '../../../core/subjects/subjects.service';
import { SubjectDto } from '../../../core/subjects/subjects.types';
import { ClassesService } from '../../../core/classes/classes.service';
import { ClassDto } from '../../../core/classes/classes.types';
import { NotificationService } from '../../../core/services/notification.service';
import { DateUtils } from '../../../core/utils/date.utils';
import { UserService } from '../../../core/user/user.service';

@Component({
    selector: 'exam-result-form',
    templateUrl: './exam-result-form.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule,
        MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule,
        MatSelectModule, MatDatepickerModule, MatNativeDateModule,
        MatProgressSpinnerModule, MatTooltipModule, MatCheckboxModule
    ]
})
export class ExamResultFormComponent implements OnInit, OnDestroy {
    form: FormGroup;
    isEditMode = false;
    isLoading = false;
    isSaving = false;
    itemId: string | null = null;

    students: StudentDto[] = [];
    exams: ExamDto[] = [];
    subjects: SubjectDto[] = [];
    classes: ClassDto[] = [];

    currentUserId: string = '00000000-0000-0000-0000-000000000000';

    examTypeOptions = [
        { value: ExamType.UnitTest, label: 'Unit Test' },
        { value: ExamType.MidTerm, label: 'Mid Term' },
        { value: ExamType.Final, label: 'Final' },
        { value: ExamType.Quiz, label: 'Quiz' },
        { value: ExamType.Assignment, label: 'Assignment' },
        { value: ExamType.Project, label: 'Project' },
        { value: ExamType.Practical, label: 'Practical' },
        { value: ExamType.Semester, label: 'Semester' },
        { value: ExamType.Viva, label: 'Viva' },
        { value: ExamType.Thesis, label: 'Thesis' },
        { value: ExamType.Dissertation, label: 'Dissertation' },
        { value: ExamType.MockTest, label: 'Mock Test' },
        { value: ExamType.PracticeTest, label: 'Practice Test' },
        { value: ExamType.Entrance, label: 'Entrance' },
        { value: ExamType.Competitive, label: 'Competitive' },
        { value: ExamType.SkillAssessment, label: 'Skill Assessment' },
        { value: ExamType.Comprehensive, label: 'Comprehensive' },
        { value: ExamType.Qualifying, label: 'Qualifying' },
        { value: ExamType.Placement, label: 'Placement' },
        { value: ExamType.Certification, label: 'Certification' },
        { value: ExamType.Online, label: 'Online' },
        { value: ExamType.Proctored, label: 'Proctored' },
        { value: ExamType.Oral, label: 'Oral' },
        { value: ExamType.Written, label: 'Written' },
        { value: ExamType.Laboratory, label: 'Laboratory' },
        { value: ExamType.Field, label: 'Field' },
        { value: ExamType.Clinical, label: 'Clinical' },
        { value: ExamType.Portfolio, label: 'Portfolio' },
        { value: ExamType.Other, label: 'Other' }
    ];

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _formBuilder: FormBuilder,
        private _service: ExamResultsService,
        private _studentsService: StudentsService,
        private _examsService: ExamsService,
        private _subjectsService: SubjectsService,
        private _classesService: ClassesService,
        private _router: Router,
        private _route: ActivatedRoute,
        private _cdr: ChangeDetectorRef,
        private _notificationService: NotificationService,
        private _dateUtils: DateUtils,
        private _userService: UserService
    ) {
        this.form = this.createForm();
    }

    ngOnInit(): void {
        this.itemId = this._route.snapshot.paramMap.get('id');
        this.isEditMode = !!this.itemId;
        this._userService.user$.pipe(takeUntil(this._unsubscribeAll)).subscribe(user => {
            if (user?.id) { this.currentUserId = user.id; }
        });
        this.loadDropdowns();
        if (this.isEditMode) { this.loadItem(); }
    }

    ngOnDestroy(): void { this._unsubscribeAll.next(null); this._unsubscribeAll.complete(); }

    createForm(): FormGroup {
        return this._formBuilder.group({
            studentId: ['', [Validators.required]],
            examId: ['', [Validators.required]],
            subjectId: ['', [Validators.required]],
            classId: ['', [Validators.required]],
            marksObtained: [0, [Validators.required, Validators.min(0)]],
            totalMarks: [100, [Validators.required, Validators.min(1)]],
            examType: [ExamType.Written, [Validators.required]],
            examDate: [null],
            evaluatedBy: [''],
            remarks: ['', [Validators.maxLength(500)]],
            isAbsent: [false],
            absentReason: ['', [Validators.maxLength(500)]]
        });
    }

    loadDropdowns(): void {
        this._studentsService.search({ pageNumber: 1, pageSize: 200, isActive: true })
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({ next: (r) => { this.students = r.data; this._cdr.markForCheck(); }, error: () => {} });
        this._examsService.search({ pageNumber: 1, pageSize: 200 })
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({ next: (r) => { this.exams = r.data; this._cdr.markForCheck(); }, error: () => {} });
        this._subjectsService.search({ pageNumber: 1, pageSize: 200 })
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({ next: (r) => { this.subjects = r.data; this._cdr.markForCheck(); }, error: () => {} });
        this._classesService.search({ pageNumber: 1, pageSize: 200 })
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({ next: (r) => { this.classes = r.data; this._cdr.markForCheck(); }, error: () => {} });
    }

    loadItem(): void {
        if (!this.itemId) return;
        this.isLoading = true;
        this._cdr.markForCheck();
        this._service.getById(this.itemId).pipe(takeUntil(this._unsubscribeAll)).subscribe({
            next: (item: ExamResultDto) => {
                this.form.patchValue({
                    studentId: item.studentId,
                    examId: item.examId,
                    subjectId: item.subjectId,
                    classId: item.classId,
                    marksObtained: item.marksObtained,
                    totalMarks: item.totalMarks,
                    examType: item.examType,
                    examDate: item.examDate ? new Date(item.examDate) : null,
                    evaluatedBy: item.evaluatedBy,
                    remarks: item.remarks,
                    isAbsent: item.isAbsent,
                    absentReason: item.absentReason
                });
                this.form.get('studentId')?.disable();
                this.form.get('examId')?.disable();
                this.form.get('subjectId')?.disable();
                this.form.get('classId')?.disable();
                this.form.get('examType')?.disable();
                this.form.get('examDate')?.disable();
                this.isLoading = false;
                this._cdr.markForCheck();
            },
            error: () => { this._notificationService.error('Error loading exam result'); this.isLoading = false; this._cdr.markForCheck(); }
        });
    }

    save(): void {
        if (this.form.invalid) { this.form.markAllAsTouched(); return; }
        this.isSaving = true;
        this._cdr.markForCheck();

        if (this.isEditMode) {
            const fv = this.form.getRawValue();
            const request: UpdateExamResultRequest = {
                id: this.itemId!,
                marksObtained: fv.marksObtained,
                totalMarks: fv.totalMarks,
                remarks: fv.remarks || undefined,
                isAbsent: fv.isAbsent,
                absentReason: fv.absentReason || undefined
            };
            this._service.update(this.itemId!, request).pipe(takeUntil(this._unsubscribeAll)).subscribe({
                next: () => { this.isSaving = false; this._notificationService.success('Exam result updated'); this._router.navigate(['/exam-results']); },
                error: () => { this.isSaving = false; this._cdr.markForCheck(); this._notificationService.error('Error updating exam result'); }
            });
        } else {
            const fv = this.form.value;
            const request: CreateExamResultRequest = {
                studentId: fv.studentId,
                examId: fv.examId,
                subjectId: fv.subjectId,
                classId: fv.classId,
                marksObtained: fv.marksObtained,
                totalMarks: fv.totalMarks,
                markedBy: this.currentUserId,
                examType: fv.examType,
                remarks: fv.remarks || undefined,
                examDate: fv.examDate ? this._dateUtils.formatDateForAPI(fv.examDate) : undefined,
                evaluatedBy: fv.evaluatedBy || undefined,
                isAbsent: fv.isAbsent,
                absentReason: fv.absentReason || undefined
            };
            this._service.create(request).pipe(takeUntil(this._unsubscribeAll)).subscribe({
                next: () => { this.isSaving = false; this._notificationService.success('Exam result created'); this._router.navigate(['/exam-results']); },
                error: () => { this.isSaving = false; this._cdr.markForCheck(); this._notificationService.error('Error creating exam result'); }
            });
        }
    }

    cancel(): void { this._router.navigate(['/exam-results']); }
    getPageTitle(): string { return this.isEditMode ? 'Edit Exam Result' : 'Add Exam Result'; }
    getSaveButtonText(): string { return this.isSaving ? 'Saving...' : (this.isEditMode ? 'Update' : 'Save'); }
    getStudentDisplayName(s: StudentDto): string { return `${s.firstName} ${s.lastName}`.trim(); }
}
