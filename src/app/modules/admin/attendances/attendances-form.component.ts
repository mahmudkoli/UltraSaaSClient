import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import { ListPageComponent } from '../../../shared/components/list-page.component';
import { AttendancesService } from '../../../core/attendances/attendances.service';
import { AttendanceStatus, AttendanceSource, ATTENDANCE_STATUS_LABELS, ATTENDANCE_SOURCE_LABELS } from '../../../core/attendances/attendances.types';
import { EmployeesService } from '../../../core/employees/employees.service';
import { EmployeeDto } from '../../../core/employees/employees.types';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'attendances-form',
    templateUrl: './attendances-form.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations,
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule, ListPageComponent,
        MatButtonModule, MatCheckboxModule, MatDatepickerModule, MatNativeDateModule,
        MatFormFieldModule, MatIconModule, MatInputModule, MatProgressBarModule, MatSelectModule,
    ],
})
export class AttendancesFormComponent implements OnInit, OnDestroy {
    form: FormGroup;
    employees: EmployeeDto[] = [];
    isLoading = false;
    isSaving = false;
    id: string | null = null;
    isEditMode = false;

    statusOptions = Object.entries(ATTENDANCE_STATUS_LABELS).map(([value, label]) => ({ value: +value, label }));
    sourceOptions = Object.entries(ATTENDANCE_SOURCE_LABELS).map(([value, label]) => ({ value: +value, label }));

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _formBuilder: FormBuilder,
        private _service: AttendancesService,
        private _employeesService: EmployeesService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private _route: ActivatedRoute,
        private _notificationService: NotificationService,
    ) {
        this.form = this._formBuilder.group({
            employeeId: ['', Validators.required],
            date: [new Date(), Validators.required],
            status: [AttendanceStatus.Present, Validators.required],
            source: [AttendanceSource.Manual, Validators.required],
            inTime: [''],
            outTime: [''],
            overtimeMinutes: [0, [Validators.min(0)]],
            remarks: ['', Validators.maxLength(500)],
            regularise: [false],
        });
    }

    ngOnInit(): void {
        this.id = this._route.snapshot.paramMap.get('id');
        this.isEditMode = !!this.id;

        this._employeesService.search({ pageNumber: 1, pageSize: 1000, keyword: '' })
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({ next: (r) => { this.employees = r.data || []; this._changeDetectorRef.markForCheck(); }, error: () => {} });

        if (this.isEditMode && this.id) {
            this.isLoading = true;
            this._service.getById(this.id).pipe(takeUntil(this._unsubscribeAll)).subscribe({
                next: (a) => {
                    this.form.patchValue({
                        employeeId: a.employeeId,
                        date: a.date ? new Date(a.date) : new Date(),
                        status: a.status,
                        source: a.source,
                        inTime: this.toTimeString(a.inTime),
                        outTime: this.toTimeString(a.outTime),
                        overtimeMinutes: a.overtimeMinutes || 0,
                        remarks: a.remarks || '',
                    });
                    // Employee + date are fixed on an existing record (one-per-day key).
                    this.form.get('employeeId')?.disable();
                    this.form.get('date')?.disable();
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                },
                error: () => {
                    this._notificationService.error('Error loading attendance');
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                },
            });
        }
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    private toTimeString(iso?: string): string {
        if (!iso) return '';
        const d = new Date(iso);
        return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    }

    // Combine the record date with an "HH:mm" string into a local ISO datetime.
    private combine(date: Date, time: string): string | undefined {
        if (!time) return undefined;
        const [hh, mm] = time.split(':').map(Number);
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}T${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:00`;
    }

    private dateOnly(date: Date): string {
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${date.getFullYear()}-${m}-${d}`;
    }

    save(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }
        this.isSaving = true;
        this._changeDetectorRef.markForCheck();
        const v = this.form.getRawValue();
        const date: Date = v.date;
        const inTime = this.combine(date, v.inTime);
        const outTime = this.combine(date, v.outTime);

        const done = (msg: string) => ({
            next: () => {
                this.isSaving = false;
                this._notificationService.success(msg);
                this._router.navigate(['/attendances']);
            },
            error: (err: any) => {
                this.isSaving = false;
                this._changeDetectorRef.markForCheck();
                this._notificationService.error(err?.error?.title || err?.error || 'Failed to save attendance');
            },
        });

        if (!this.isEditMode) {
            this._service.create({
                employeeId: v.employeeId, date: this.dateOnly(date), status: v.status, source: v.source,
                inTime, outTime, overtimeMinutes: v.overtimeMinutes || 0, remarks: v.remarks || undefined,
            }).pipe(takeUntil(this._unsubscribeAll)).subscribe(done('Attendance marked'));
        } else if (v.regularise) {
            this._service.regularise(this.id!, {
                id: this.id!, status: v.status, inTime, outTime, remarks: v.remarks || undefined,
            }).pipe(takeUntil(this._unsubscribeAll)).subscribe(done('Attendance regularised'));
        } else {
            this._service.update(this.id!, {
                id: this.id!, status: v.status, inTime, outTime,
                overtimeMinutes: v.overtimeMinutes || 0, remarks: v.remarks || undefined,
            }).pipe(takeUntil(this._unsubscribeAll)).subscribe(done('Attendance updated'));
        }
    }

    cancel(): void {
        this._router.navigate(['/attendances']);
    }
}
