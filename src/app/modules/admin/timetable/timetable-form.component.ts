import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { AcademicYearsService } from '../../../core/academic-years/academic-years.service';
import { AcademicYearDto } from '../../../core/academic-years/academic-years.types';
import { ClassesService } from '../../../core/classes/classes.service';
import { ClassDto } from '../../../core/classes/classes.types';
import { SubjectsService } from '../../../core/subjects/subjects.service';
import { SubjectDto } from '../../../core/subjects/subjects.types';
import { TeachersService } from '../../../core/teachers/teachers.service';
import { TeacherDto } from '../../../core/teachers/teachers.types';
import { DAYS_OF_WEEK, TimeSlotDto, TimetableService } from '../../../core/timetable/timetable.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'timetable-form',
    templateUrl: './timetable-form.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatIconModule, MatInputModule, MatProgressBarModule, MatSelectModule],
})
export class TimetableFormComponent implements OnInit {
    form: FormGroup;
    saving = false;
    loading = false;
    editingId?: string;
    classes: ClassDto[] = [];
    subjects: SubjectDto[] = [];
    teachers: TeacherDto[] = [];
    slots: TimeSlotDto[] = [];
    years: AcademicYearDto[] = [];
    readonly days = DAYS_OF_WEEK;

    constructor(
        private _svc: TimetableService,
        private _classes: ClassesService,
        private _subjects: SubjectsService,
        private _teachers: TeachersService,
        private _years: AcademicYearsService,
        private _fb: FormBuilder,
        private _route: ActivatedRoute,
        private _router: Router,
        private _cdr: ChangeDetectorRef,
        private _notify: NotificationService,
    ) {
        this.form = this._fb.group({
            classId: ['', [Validators.required]],
            subjectId: ['', [Validators.required]],
            teacherId: ['', [Validators.required]],
            timeSlotId: ['', [Validators.required]],
            dayOfWeek: ['Monday', [Validators.required]],
            academicYearId: ['', [Validators.required]],
            roomNumber: [''],
            remarks: [''],
            isActive: [true],
        });
    }

    ngOnInit(): void {
        this._classes.search({ pageNumber: 1, pageSize: 200 }).subscribe({ next: (r) => { this.classes = r.data; this._cdr.markForCheck(); }, error: () => {} });
        this._subjects.search({ pageNumber: 1, pageSize: 200 }).subscribe({ next: (r) => { this.subjects = r.data; this._cdr.markForCheck(); }, error: () => {} });
        this._teachers.search({ pageNumber: 1, pageSize: 200 }).subscribe({ next: (r) => { this.teachers = r.data; this._cdr.markForCheck(); }, error: () => {} });
        this._years.search({ pageNumber: 1, pageSize: 200, isActive: true }).subscribe({ next: (r) => { this.years = r.data; this._cdr.markForCheck(); }, error: () => {} });
        this._svc.listTimeSlots().subscribe({ next: (s) => { this.slots = s; this._cdr.markForCheck(); }, error: () => {} });

        const id = this._route.snapshot.paramMap.get('id');
        if (id) {
            this.editingId = id;
            this.loading = true;
            this._svc.getById(id).subscribe({
                next: (e) => { this.form.patchValue(e); this.loading = false; this._cdr.markForCheck(); },
                error: () => { this.loading = false; this._cdr.markForCheck(); this._notify.error('Could not load entry.'); },
            });
        } else {
            // Pre-fill class + year from query params if provided by the grid view.
            const qp = this._route.snapshot.queryParamMap;
            const classId = qp.get('classId');
            const academicYearId = qp.get('academicYearId');
            if (classId) this.form.patchValue({ classId });
            if (academicYearId) this.form.patchValue({ academicYearId });
        }
    }

    save(): void {
        if (this.form.invalid) return;
        this.saving = true;
        const v = this.form.value;
        const obs = this.editingId
            ? this._svc.update(this.editingId, { id: this.editingId, teacherId: v.teacherId, timeSlotId: v.timeSlotId, roomNumber: v.roomNumber, remarks: v.remarks, isActive: v.isActive })
            : this._svc.create(v);
        obs.subscribe({
            next: () => { this.saving = false; this._notify.success('Saved.'); this._router.navigate(['/timetable']); },
            error: (err) => {
                this.saving = false; this._cdr.markForCheck();
                const msg = err?.error?.messages?.[0] || 'Save failed.';
                this._notify.error(msg);   // surface conflict-detection errors
            },
        });
    }

    cancel(): void { this._router.navigate(['/timetable']); }
}
