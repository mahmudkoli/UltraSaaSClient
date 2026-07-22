import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { merge, Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { ListPageComponent } from '../../../shared/components/list-page.component';
import { AttendancesService } from '../../../core/attendances/attendances.service';
import { AttendanceSummaryDto } from '../../../core/attendances/attendances.types';
import { EmployeesService } from '../../../core/employees/employees.service';
import { EmployeeDto } from '../../../core/employees/employees.types';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'attendance-summary',
    templateUrl: './attendance-summary.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule, ListPageComponent,
        MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule,
        MatProgressBarModule, MatSelectModule, MatTableModule,
    ],
})
export class AttendanceSummaryComponent implements OnInit, OnDestroy {
    rows: AttendanceSummaryDto[] = [];
    employees: EmployeeDto[] = [];
    isLoading = false;
    displayedColumns = ['employee', 'recorded', 'present', 'absent', 'late', 'half', 'ot', 'paidLeave', 'unpaidLeave'];

    now = new Date();
    monthControl = new FormControl(this.now.getMonth() + 1);
    yearControl = new FormControl(this.now.getFullYear());
    employeeControl = new FormControl('');

    months = [
        { v: 1, n: 'January' }, { v: 2, n: 'February' }, { v: 3, n: 'March' }, { v: 4, n: 'April' },
        { v: 5, n: 'May' }, { v: 6, n: 'June' }, { v: 7, n: 'July' }, { v: 8, n: 'August' },
        { v: 9, n: 'September' }, { v: 10, n: 'October' }, { v: 11, n: 'November' }, { v: 12, n: 'December' },
    ];
    years: number[] = [];

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _service: AttendancesService,
        private _employeesService: EmployeesService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _notificationService: NotificationService,
    ) {
        const y = this.now.getFullYear();
        this.years = [y + 1, y, y - 1, y - 2];
    }

    ngOnInit(): void {
        this._employeesService.search({ pageNumber: 1, pageSize: 1000, keyword: '' })
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({ next: (r) => { this.employees = r.data || []; this._changeDetectorRef.markForCheck(); }, error: () => {} });

        this.load();
        merge(this.monthControl.valueChanges, this.yearControl.valueChanges, this.employeeControl.valueChanges)
            .pipe(debounceTime(200), takeUntil(this._unsubscribeAll))
            .subscribe(() => this.load());
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    downloadCsv(): void {
        this._service.registerCsv(+this.yearControl.value!, +this.monthControl.value!)
            .pipe(takeUntil(this._unsubscribeAll)).subscribe({
                next: (blob) => {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url; a.download = `AttendanceRegister-${this.yearControl.value}-${this.monthControl.value}.csv`; a.click();
                    URL.revokeObjectURL(url);
                },
                error: () => this._notificationService.error('Failed to download register'),
            });
    }

    load(): void {
        this.isLoading = true;
        this._changeDetectorRef.markForCheck();
        this._service.summary(+this.yearControl.value!, +this.monthControl.value!, this.employeeControl.value || undefined)
            .pipe(takeUntil(this._unsubscribeAll)).subscribe({
                next: (rows) => { this.rows = rows || []; this.isLoading = false; this._changeDetectorRef.markForCheck(); },
                error: () => { this._notificationService.error('Failed to load summary'); this.isLoading = false; this._changeDetectorRef.markForCheck(); },
            });
    }
}
