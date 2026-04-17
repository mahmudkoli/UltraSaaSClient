import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AttendancesService } from '../../../core/attendances/attendances.service';
import {
    AttendanceStatus,
    BulkMarkAttendanceEntry,
    BulkMarkAttendanceRequest
} from '../../../core/attendances/attendances.types';
import { ClassesService } from '../../../core/classes/classes.service';
import { ClassDto } from '../../../core/classes/classes.types';
import { SubjectsService } from '../../../core/subjects/subjects.service';
import { SubjectDto } from '../../../core/subjects/subjects.types';
import { StudentClassesService } from '../../../core/student-classes/student-classes.service';
import { StudentClassDto } from '../../../core/student-classes/student-classes.types';
import { NotificationService } from '../../../core/services/notification.service';
import { DateUtils } from '../../../core/utils/date.utils';
import { UserService } from '../../../core/user/user.service';

interface RosterRow {
    studentId: string;
    studentName: string;
    rollNumber?: string;
    status: AttendanceStatus;
    remarks?: string;
    existing: boolean;
}

@Component({
    selector: 'attendance-bulk-mark',
    templateUrl: './attendance-bulk-mark.component.html',
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
export class AttendanceBulkMarkComponent implements OnInit, OnDestroy {
    filterForm: FormGroup;
    classes: ClassDto[] = [];
    subjects: SubjectDto[] = [];
    roster: RosterRow[] = [];
    rosterLoaded = false;
    isLoadingRoster = false;
    isSaving = false;
    currentUserId = '00000000-0000-0000-0000-000000000000';
    currentUserName = '';

    statusOptions = [
        { value: AttendanceStatus.Present, label: 'Present', class: 'bg-green-100 text-green-800' },
        { value: AttendanceStatus.Absent, label: 'Absent', class: 'bg-red-100 text-red-800' },
        { value: AttendanceStatus.Late, label: 'Late', class: 'bg-yellow-100 text-yellow-800' },
        { value: AttendanceStatus.HalfDay, label: 'Half Day', class: 'bg-orange-100 text-orange-800' },
        { value: AttendanceStatus.Excused, label: 'Excused', class: 'bg-blue-100 text-blue-800' },
        { value: AttendanceStatus.Medical, label: 'Medical', class: 'bg-blue-100 text-blue-800' }
    ];

    private _unsubscribeAll = new Subject<void>();

    constructor(
        private _fb: FormBuilder,
        private _attendancesService: AttendancesService,
        private _classesService: ClassesService,
        private _subjectsService: SubjectsService,
        private _studentClassesService: StudentClassesService,
        private _notification: NotificationService,
        private _dateUtils: DateUtils,
        private _userService: UserService,
        private _router: Router,
        private _cdr: ChangeDetectorRef
    ) {
        this.filterForm = this._fb.group({
            classId: ['', [Validators.required]],
            subjectId: [''],
            date: [new Date(), [Validators.required]]
        });
    }

    ngOnInit(): void {
        this._userService.user$.pipe(takeUntil(this._unsubscribeAll)).subscribe(u => {
            if (u?.id) { this.currentUserId = u.id; this.currentUserName = u.name || ''; }
        });
        this._classesService.search({ pageNumber: 1, pageSize: 200 })
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(r => { this.classes = r.data; this._cdr.markForCheck(); });
        this._subjectsService.search({ pageNumber: 1, pageSize: 200 })
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(r => { this.subjects = r.data; this._cdr.markForCheck(); });
    }

    ngOnDestroy(): void { this._unsubscribeAll.next(); this._unsubscribeAll.complete(); }

    loadRoster(): void {
        if (this.filterForm.invalid) { this.filterForm.markAllAsTouched(); return; }
        const { classId, subjectId, date } = this.filterForm.value;
        const isoDate = this._dateUtils.formatDateForAPI(date);

        this.isLoadingRoster = true;
        this.rosterLoaded = false;
        this._cdr.markForCheck();

        forkJoin({
            enrollments: this._studentClassesService.search({ pageNumber: 1, pageSize: 500, classId }),
            existing: this._attendancesService.search({
                pageNumber: 1, pageSize: 500,
                classId,
                subjectId: subjectId || undefined,
                fromDate: isoDate,
                toDate: isoDate
            })
        }).pipe(takeUntil(this._unsubscribeAll)).subscribe({
            next: ({ enrollments, existing }) => {
                const existingMap = new Map(existing.data.map(a => [a.studentId, a]));
                this.roster = (enrollments.data as StudentClassDto[])
                    .filter(e => !e.withdrawalDate)
                    .map(e => {
                        const prior = existingMap.get(e.studentId);
                        return {
                            studentId: e.studentId,
                            studentName: e.studentName,
                            rollNumber: e.rollNumber,
                            status: prior?.status ?? AttendanceStatus.Present,
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

    setAll(status: AttendanceStatus): void {
        this.roster = this.roster.map(r => ({ ...r, status }));
        this._cdr.markForCheck();
    }

    updateStatus(studentId: string, status: AttendanceStatus): void {
        const row = this.roster.find(r => r.studentId === studentId);
        if (row) { row.status = status; this._cdr.markForCheck(); }
    }

    updateRemarks(studentId: string, remarks: string): void {
        const row = this.roster.find(r => r.studentId === studentId);
        if (row) { row.remarks = remarks; }
    }

    save(): void {
        if (this.roster.length === 0) return;
        const { classId, subjectId, date } = this.filterForm.value;
        const request: BulkMarkAttendanceRequest = {
            classId,
            subjectId: subjectId || undefined,
            date: this._dateUtils.formatDateForAPI(date),
            markedBy: this.currentUserId,
            markedByName: this.currentUserName || undefined,
            entries: this.roster.map<BulkMarkAttendanceEntry>(r => ({
                studentId: r.studentId,
                status: r.status,
                remarks: r.remarks || undefined
            }))
        };

        this.isSaving = true;
        this._cdr.markForCheck();
        this._attendancesService.bulkMark(request).pipe(takeUntil(this._unsubscribeAll)).subscribe({
            next: (res) => {
                this.isSaving = false;
                this._notification.success(`Saved — ${res.created} created, ${res.updated} updated`);
                this._router.navigate(['/attendances']);
            },
            error: () => {
                this.isSaving = false;
                this._cdr.markForCheck();
                this._notification.error('Error saving attendance');
            }
        });
    }

    cancel(): void { this._router.navigate(['/attendances']); }

    presentCount(): number { return this.roster.filter(r => r.status === AttendanceStatus.Present).length; }
    absentCount(): number { return this.roster.filter(r => r.status === AttendanceStatus.Absent).length; }
    lateCount(): number { return this.roster.filter(r => r.status === AttendanceStatus.Late).length; }
}
