import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { merge, Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { ListPageComponent } from '../../../shared/components/list-page.component';
import { AttendancesService } from '../../../core/attendances/attendances.service';
import { AttendanceDto, AttendanceStatus, ATTENDANCE_STATUS_LABELS } from '../../../core/attendances/attendances.types';
import { EmployeesService } from '../../../core/employees/employees.service';
import { EmployeeDto } from '../../../core/employees/employees.types';
import { NotificationService } from '../../../core/services/notification.service';
import { DateUtils } from '../../../core/utils/date.utils';

@Component({
    selector: 'attendances-list',
    templateUrl: './attendances-list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule, RouterModule, ListPageComponent,
        MatButtonModule, MatDatepickerModule, MatNativeDateModule, MatFormFieldModule,
        MatIconModule, MatInputModule, MatMenuModule, MatPaginatorModule,
        MatProgressBarModule, MatSelectModule, MatTableModule, MatTooltipModule,
    ],
})
export class AttendancesListComponent implements OnInit, OnDestroy {
    items: AttendanceDto[] = [];
    employees: EmployeeDto[] = [];
    isLoading = false;
    totalCount = 0;
    currentPage = 0;
    pageSize = 10;
    pageSizeOptions = [5, 10, 25, 50];
    displayedColumns = ['employee', 'date', 'status', 'times', 'overtime', 'actions'];
    Math = Math;

    employeeFilter = new FormControl('');
    statusFilter = new FormControl('');
    fromFilter = new FormControl<Date | null>(null);
    toFilter = new FormControl<Date | null>(null);

    statusOptions = Object.entries(ATTENDANCE_STATUS_LABELS).map(([value, label]) => ({ value: +value, label }));
    statusLabels = ATTENDANCE_STATUS_LABELS;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _service: AttendancesService,
        private _employeesService: EmployeesService,
        private _fuseConfirmationService: FuseConfirmationService,
        private _notificationService: NotificationService,
        private _dateUtils: DateUtils,
    ) {}

    ngOnInit(): void {
        this._employeesService.search({ pageNumber: 1, pageSize: 1000, keyword: '' })
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({ next: (r) => { this.employees = r.data || []; this._changeDetectorRef.markForCheck(); }, error: () => {} });

        this.load();

        merge(
            this.employeeFilter.valueChanges,
            this.statusFilter.valueChanges,
            this.fromFilter.valueChanges,
            this.toFilter.valueChanges,
        ).pipe(debounceTime(200), takeUntil(this._unsubscribeAll))
            .subscribe(() => { this.currentPage = 0; this.load(); });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    load(): void {
        this.isLoading = true;
        this._changeDetectorRef.markForCheck();
        this._service.search({
            pageNumber: this.currentPage + 1,
            pageSize: this.pageSize,
            employeeId: this.employeeFilter.value || undefined,
            status: this.statusFilter.value ? +this.statusFilter.value as AttendanceStatus : undefined,
            dateFrom: this.fromFilter.value ? this._dateUtils.formatDateForAPI(this.fromFilter.value) : undefined,
            dateTo: this.toFilter.value ? this._dateUtils.formatDateForAPI(this.toFilter.value) : undefined,
        }).pipe(takeUntil(this._unsubscribeAll)).subscribe({
            next: (response) => {
                this.items = response.data || [];
                this.totalCount = response.totalCount || 0;
                this.isLoading = false;
                this._changeDetectorRef.markForCheck();
            },
            error: () => {
                this._notificationService.error('Failed to load attendance');
                this.isLoading = false;
                this._changeDetectorRef.markForCheck();
            },
        });
    }

    onPageChange(event: PageEvent): void {
        this.currentPage = event.pageIndex;
        this.pageSize = event.pageSize;
        this.load();
    }

    statusClass(status: AttendanceStatus): string {
        switch (status) {
            case AttendanceStatus.Present: return 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30';
            case AttendanceStatus.Late: return 'text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-900/30';
            case AttendanceStatus.Absent: return 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/30';
            case AttendanceStatus.HalfDay: return 'text-orange-700 bg-orange-100 dark:text-orange-300 dark:bg-orange-900/30';
            default: return 'text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-700';
        }
    }

    create(): void {
        this._router.navigate(['create'], { relativeTo: this._activatedRoute });
    }

    edit(item: AttendanceDto): void {
        this._router.navigate(['edit', item.id], { relativeTo: this._activatedRoute });
    }

    remove(item: AttendanceDto): void {
        const confirmation = this._fuseConfirmationService.open({
            title: 'Delete Attendance',
            message: `Delete the attendance record for ${item.employeeName}?`,
            actions: { confirm: { label: 'Delete' } },
        });
        confirmation.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this._service.delete(item.id).pipe(takeUntil(this._unsubscribeAll)).subscribe({
                    next: () => { this._notificationService.success('Attendance deleted'); this.load(); },
                    error: () => this._notificationService.error('Failed to delete attendance'),
                });
            }
        });
    }
}
