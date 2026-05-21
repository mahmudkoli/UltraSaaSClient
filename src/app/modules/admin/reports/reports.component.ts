import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Subject, takeUntil } from 'rxjs';
import { ClassesService } from '../../../core/classes/classes.service';
import { ClassDto } from '../../../core/classes/classes.types';
import { ReportsService } from '../../../core/reports/reports.service';
import { StudentsService } from '../../../core/students/students.service';
import { StudentDto } from '../../../core/students/students.types';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'reports',
    templateUrl: './reports.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CommonModule, FormsModule, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, MatSelectModule],
})
export class ReportsComponent implements OnInit, OnDestroy {
    students: StudentDto[] = [];
    classes: ClassDto[] = [];

    transcriptStudentId = '';
    feeFrom = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
    feeTo = new Date().toISOString().slice(0, 10);
    attFrom = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
    attTo = new Date().toISOString().slice(0, 10);
    attClassId = '';

    busy = false;
    private _destroyed$ = new Subject<void>();

    constructor(
        private _reports: ReportsService,
        private _students: StudentsService,
        private _classesSvc: ClassesService,
        private _cdr: ChangeDetectorRef,
        private _notify: NotificationService,
    ) {}

    ngOnInit(): void {
        this._students.search({ pageNumber: 1, pageSize: 500 } as any).pipe(takeUntil(this._destroyed$)).subscribe({
            next: (r) => { this.students = r.data; this._cdr.markForCheck(); },
        });
        this._classesSvc.search({ pageNumber: 1, pageSize: 500 } as any).pipe(takeUntil(this._destroyed$)).subscribe({
            next: (r) => { this.classes = r.data; this._cdr.markForCheck(); },
        });
    }

    ngOnDestroy(): void { this._destroyed$.next(); this._destroyed$.complete(); }

    private fetch(stream: any, fileName: string): void {
        this.busy = true; this._cdr.markForCheck();
        stream.pipe(takeUntil(this._destroyed$)).subscribe({
            next: (blob: Blob) => {
                this.busy = false; this._cdr.markForCheck();
                ReportsService.downloadBlob(blob, fileName);
            },
            error: () => { this.busy = false; this._cdr.markForCheck(); this._notify.error('Could not generate report.'); },
        });
    }

    transcript(): void {
        if (!this.transcriptStudentId) return;
        const stu = this.students.find(s => s.id === this.transcriptStudentId);
        this.fetch(this._reports.studentTranscript(this.transcriptStudentId), `Transcript-${stu?.firstName ?? 'student'}.pdf`);
    }

    feeReport(): void {
        this.fetch(this._reports.feeCollection(this.feeFrom, this.feeTo), `FeeCollection-${this.feeFrom}-${this.feeTo}.pdf`);
    }

    attendanceReport(): void {
        this.fetch(this._reports.attendanceSummary(this.attFrom, this.attTo, this.attClassId || undefined), `AttendanceSummary-${this.attFrom}-${this.attTo}.pdf`);
    }

    rosterClassId = '';
    rosterDate = new Date().toISOString().slice(0, 10);

    classRoster(): void {
        if (!this.rosterClassId) return;
        const cls = this.classes.find(c => c.id === this.rosterClassId);
        const label = cls ? `${cls.name}${cls.section}`.replace(/\s+/g, '') : 'class';
        this.fetch(this._reports.classRoster(this.rosterClassId, this.rosterDate), `Roster-${label}-${this.rosterDate}.pdf`);
    }
}
