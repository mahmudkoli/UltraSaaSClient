import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ExamResultsService } from '../../../core/exam-results/exam-results.service';
import {
    BulkMarkExamResultEntry,
    BulkMarkExamResultsRequest,
    ExamType,
} from '../../../core/exam-results/exam-results.types';
import { ExamsService } from '../../../core/exams/exams.service';
import { ExamDto } from '../../../core/exams/exams.types';
import { SubjectsService } from '../../../core/subjects/subjects.service';
import { SubjectDto } from '../../../core/subjects/subjects.types';
import { ClassesService } from '../../../core/classes/classes.service';
import { ClassDto } from '../../../core/classes/classes.types';
import { StudentClassesService } from '../../../core/student-classes/student-classes.service';
import { StudentClassDto } from '../../../core/student-classes/student-classes.types';
import { NotificationService } from '../../../core/services/notification.service';
import { DateUtils } from '../../../core/utils/date.utils';
import { UserService } from '../../../core/user/user.service';
import { GradeBandDto, GradeBandsService } from '../../../core/grade-bands/grade-bands.service';

interface MarkRow {
    studentId: string;
    studentName: string;
    rollNumber?: string;
    marksObtained: number;
    totalMarks: number;
    isAbsent: boolean;
    absentReason?: string;
    remarks?: string;
    existing: boolean;
}

@Component({
    selector: 'exam-result-bulk-entry',
    templateUrl: './exam-result-bulk-entry.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule,
        MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatIconModule, MatInputModule,
        MatSelectModule, MatDatepickerModule, MatNativeDateModule,
        MatProgressSpinnerModule, MatTooltipModule
    ]
})
export class ExamResultBulkEntryComponent implements OnInit, OnDestroy {
    filterForm: FormGroup;
    exams: ExamDto[] = [];
    subjects: SubjectDto[] = [];
    classes: ClassDto[] = [];
    gradeBands: GradeBandDto[] = [];
    rows: MarkRow[] = [];
    rosterLoaded = false;
    isLoadingRoster = false;
    isSaving = false;
    currentUserId = '00000000-0000-0000-0000-000000000000';
    currentUserName = '';
    // True once an exam is chosen — Total Marks then comes from the exam and is locked.
    totalMarksLocked = false;

    examTypeOptions = [
        { value: ExamType.UnitTest, label: 'Unit Test' },
        { value: ExamType.MidTerm, label: 'Mid Term' },
        { value: ExamType.Final, label: 'Final' },
        { value: ExamType.Quiz, label: 'Quiz' },
        { value: ExamType.Semester, label: 'Semester' },
        { value: ExamType.Practical, label: 'Practical' }
    ];

    private _unsubscribeAll = new Subject<void>();

    constructor(
        private _fb: FormBuilder,
        private _service: ExamResultsService,
        private _examsService: ExamsService,
        private _subjectsService: SubjectsService,
        private _classesService: ClassesService,
        private _studentClassesService: StudentClassesService,
        private _notification: NotificationService,
        private _dateUtils: DateUtils,
        private _userService: UserService,
        private _gradeBandsService: GradeBandsService,
        private _router: Router,
        private _cdr: ChangeDetectorRef
    ) {
        this.filterForm = this._fb.group({
            examId: ['', [Validators.required]],
            subjectId: ['', [Validators.required]],
            classId: ['', [Validators.required]],
            examType: [ExamType.UnitTest, [Validators.required]],
            examDate: [new Date()],
            totalMarks: [100, [Validators.required, Validators.min(1)]]
        });
    }

    ngOnInit(): void {
        this._userService.user$.pipe(takeUntil(this._unsubscribeAll)).subscribe(u => {
            if (u?.id) { this.currentUserId = u.id; this.currentUserName = u.name || ''; }
        });
        this._examsService.search({ pageNumber: 1, pageSize: 200 })
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(r => { this.exams = r.data; this._cdr.markForCheck(); });
        this._subjectsService.search({ pageNumber: 1, pageSize: 200 })
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(r => { this.subjects = r.data; this._cdr.markForCheck(); });
        this._classesService.search({ pageNumber: 1, pageSize: 200 })
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(r => { this.classes = r.data; this._cdr.markForCheck(); });
        this._gradeBandsService.list()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: bands => {
                    this.gradeBands = [...bands].sort((a, b) => a.displayOrder - b.displayOrder);
                    this._cdr.markForCheck();
                },
                error: () => { /* no bands configured -> legacy fallback */ }
            });
        // Selecting an exam fills Type / Date / Total Marks from the exam record and
        // locks Total Marks so the grid can't diverge from the exam definition.
        this.filterForm.get('examId')?.valueChanges
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((examId: string) => this.applyExamDefaults(examId));
    }

    applyExamDefaults(examId: string): void {
        const exam = this.exams.find(e => e.id === examId);
        if (!exam) { this.totalMarksLocked = false; this._cdr.markForCheck(); return; }
        const patch: any = {};
        const mappedType = (ExamType as any)[exam.examType];
        if (mappedType !== undefined) { patch.examType = mappedType; }
        if (exam.startDate) { patch.examDate = new Date(exam.startDate); }
        if (exam.totalMarks != null) { patch.totalMarks = exam.totalMarks; }
        this.filterForm.patchValue(patch);
        this.totalMarksLocked = true;
        this._cdr.markForCheck();
    }

    ngOnDestroy(): void { this._unsubscribeAll.next(); this._unsubscribeAll.complete(); }

    loadRoster(): void {
        if (this.filterForm.invalid) { this.filterForm.markAllAsTouched(); return; }
        const { examId, subjectId, classId, totalMarks } = this.filterForm.value;

        this.isLoadingRoster = true;
        this.rosterLoaded = false;
        this._cdr.markForCheck();

        forkJoin({
            enrollments: this._studentClassesService.search({ pageNumber: 1, pageSize: 500, classId }),
            existing: this._service.search({ pageNumber: 1, pageSize: 500, examId, subjectId, classId })
        }).pipe(takeUntil(this._unsubscribeAll)).subscribe({
            next: ({ enrollments, existing }) => {
                const existingMap = new Map(existing.data.map(r => [r.studentId, r]));
                this.rows = (enrollments.data as StudentClassDto[])
                    .filter(e => !e.withdrawalDate)
                    .map(e => {
                        const prior = existingMap.get(e.studentId);
                        return {
                            studentId: e.studentId,
                            studentName: e.studentName,
                            rollNumber: e.rollNumber,
                            marksObtained: prior?.marksObtained ?? 0,
                            totalMarks: prior?.totalMarks ?? totalMarks,
                            isAbsent: prior?.isAbsent ?? false,
                            absentReason: prior?.absentReason,
                            remarks: prior?.remarks,
                            existing: !!prior
                        };
                    })
                    .sort((a, b) => (a.rollNumber || a.studentName).localeCompare(b.rollNumber || b.studentName));
                this.rosterLoaded = true;
                this.isLoadingRoster = false;
                this._cdr.markForCheck();
            },
            error: () => {
                this.isLoadingRoster = false;
                this._cdr.markForCheck();
                this._notification.error('Error loading class roster');
            }
        });
    }

    percentage(row: MarkRow): number {
        if (row.isAbsent || row.totalMarks <= 0) return 0;
        return Math.round((row.marksObtained / row.totalMarks) * 1000) / 10;
    }

    private bandFor(row: MarkRow): GradeBandDto | undefined {
        if (this.gradeBands.length === 0) return undefined;
        const pct = this.percentage(row);
        return this.gradeBands.find(b => pct >= b.lowerPercent && pct <= b.upperPercent);
    }

    grade(row: MarkRow): string {
        if (row.isAbsent) return 'ABS';
        const band = this.bandFor(row);
        if (band) return band.label;
        const pct = this.percentage(row);
        if (pct >= 90) return 'A+';
        if (pct >= 80) return 'A';
        if (pct >= 70) return 'B+';
        if (pct >= 60) return 'B';
        if (pct >= 50) return 'C+';
        if (pct >= 40) return 'C';
        if (pct >= 33) return 'D';
        return 'F';
    }

    gpa(row: MarkRow): number | null {
        if (row.isAbsent) return null;
        return this.bandFor(row)?.gpa ?? null;
    }

    gradeClass(row: MarkRow): string {
        const label = this.grade(row);
        if (label === 'ABS') return 'bg-gray-100 text-gray-800';
        const head = label.charAt(0).toUpperCase();
        if (head === 'A') return 'bg-green-100 text-green-800';
        if (head === 'B') return 'bg-blue-100 text-blue-800';
        if (head === 'C') return 'bg-yellow-100 text-yellow-800';
        if (head === 'D') return 'bg-orange-100 text-orange-800';
        return 'bg-red-100 text-red-800';
    }

    updateMarks(studentId: string, value: string): void {
        const row = this.rows.find(r => r.studentId === studentId);
        if (row) { row.marksObtained = Number(value) || 0; this._cdr.markForCheck(); }
    }

    updateAbsent(studentId: string, checked: boolean): void {
        const row = this.rows.find(r => r.studentId === studentId);
        if (row) { row.isAbsent = checked; if (checked) row.marksObtained = 0; this._cdr.markForCheck(); }
    }

    updateRemarks(studentId: string, value: string): void {
        const row = this.rows.find(r => r.studentId === studentId);
        if (row) { row.remarks = value; }
    }

    setAllAbsent(value: boolean): void {
        this.rows = this.rows.map(r => ({ ...r, isAbsent: value, marksObtained: value ? 0 : r.marksObtained }));
        this._cdr.markForCheck();
    }

    save(): void {
        if (this.rows.length === 0) return;
        const fv = this.filterForm.value;
        const request: BulkMarkExamResultsRequest = {
            examId: fv.examId,
            subjectId: fv.subjectId,
            classId: fv.classId,
            examType: fv.examType,
            markedBy: this.currentUserId,
            evaluatedBy: this.currentUserName || undefined,
            examDate: fv.examDate ? this._dateUtils.formatDateForAPI(fv.examDate) : undefined,
            entries: this.rows.map<BulkMarkExamResultEntry>(r => ({
                studentId: r.studentId,
                marksObtained: r.marksObtained,
                totalMarks: r.totalMarks,
                isAbsent: r.isAbsent,
                absentReason: r.absentReason || undefined,
                remarks: r.remarks || undefined
            }))
        };

        this.isSaving = true;
        this._cdr.markForCheck();
        this._service.bulkMark(request).pipe(takeUntil(this._unsubscribeAll)).subscribe({
            next: (res) => {
                this.isSaving = false;
                this._notification.success(`Saved — ${res.created} created, ${res.updated} updated`);
                this._router.navigate(['/exam-results']);
            },
            error: () => {
                this.isSaving = false;
                this._cdr.markForCheck();
                this._notification.error('Error saving exam results');
            }
        });
    }

    cancel(): void { this._router.navigate(['/exam-results']); }

    absentCount(): number { return this.rows.filter(r => r.isAbsent).length; }
    passCount(): number { return this.rows.filter(r => !r.isAbsent && this.percentage(r) >= 33).length; }
    failCount(): number { return this.rows.filter(r => !r.isAbsent && this.percentage(r) < 33).length; }
}
