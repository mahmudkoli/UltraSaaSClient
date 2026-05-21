import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AcademicYearsService } from '../../../core/academic-years/academic-years.service';
import { AcademicYearDto } from '../../../core/academic-years/academic-years.types';
import { ClassesService } from '../../../core/classes/classes.service';
import { ClassDto } from '../../../core/classes/classes.types';
import { TimeSlotDto, TimetableEntryDto, TimetableService, DAYS_OF_WEEK } from '../../../core/timetable/timetable.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'timetable',
    templateUrl: './timetable.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, MatProgressBarModule, MatSelectModule, MatTableModule, MatTooltipModule],
})
export class TimetableComponent implements OnInit, OnDestroy {
    classes: ClassDto[] = [];
    years: AcademicYearDto[] = [];
    slots: TimeSlotDto[] = [];
    entries: TimetableEntryDto[] = [];
    loading = false;
    filterForm: FormGroup;
    readonly days = DAYS_OF_WEEK;
    private _destroyed$ = new Subject<void>();

    constructor(
        private _svc: TimetableService,
        private _classes: ClassesService,
        private _years: AcademicYearsService,
        private _fb: FormBuilder,
        private _cdr: ChangeDetectorRef,
        private _notify: NotificationService,
        private _router: Router,
    ) {
        this.filterForm = this._fb.group({ classId: [''], academicYearId: [''] });
    }

    ngOnInit(): void {
        this._classes.search({ pageNumber: 1, pageSize: 200 }).pipe(takeUntil(this._destroyed$)).subscribe({
            next: (r) => { this.classes = r.data; this._cdr.markForCheck(); },
            error: () => {},
        });
        this._years.search({ pageNumber: 1, pageSize: 200, isActive: true }).pipe(takeUntil(this._destroyed$)).subscribe({
            next: (r) => {
                this.years = r.data;
                const active = r.data.find(y => y.isActive) || r.data[0];
                if (active) {
                    this.filterForm.patchValue({ academicYearId: active.id });
                    this.load();
                }
                this._cdr.markForCheck();
            },
            error: () => {},
        });
        this._svc.listTimeSlots().pipe(takeUntil(this._destroyed$)).subscribe({
            next: (s) => { this.slots = s.sort((a, b) => (a.startTime > b.startTime ? 1 : -1)); this._cdr.markForCheck(); },
            error: () => {},
        });
    }

    ngOnDestroy(): void { this._destroyed$.next(); this._destroyed$.complete(); }

    load(): void {
        const v = this.filterForm.value;
        if (!v.academicYearId) return;
        this.loading = true;
        this._cdr.markForCheck();
        this._svc.search({ classId: v.classId || undefined, academicYearId: v.academicYearId })
            .pipe(takeUntil(this._destroyed$)).subscribe({
                next: (rows) => { this.entries = rows; this.loading = false; this._cdr.markForCheck(); },
                error: () => { this.loading = false; this._cdr.markForCheck(); this._notify.error('Could not load timetable.'); },
            });
    }

    cellsFor(day: string, slotId: string): TimetableEntryDto[] {
        return this.entries.filter(e => e.dayOfWeek === day && e.timeSlotId === slotId && e.isActive);
    }

    add(): void {
        const v = this.filterForm.value;
        this._router.navigate(['/timetable/create'], { queryParams: { classId: v.classId, academicYearId: v.academicYearId } });
    }

    edit(e: TimetableEntryDto): void { this._router.navigate(['/timetable', e.id, 'edit']); }

    remove(e: TimetableEntryDto): void {
        if (!confirm(`Delete this timetable entry?`)) return;
        this._svc.delete(e.id).pipe(takeUntil(this._destroyed$)).subscribe({
            next: () => { this._notify.success('Deleted.'); this.load(); },
            error: () => this._notify.error('Delete failed.'),
        });
    }
}
