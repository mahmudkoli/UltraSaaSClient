import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DateUtils } from '../../../core/utils/date.utils';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { AttendancesService } from '../../../core/attendances/attendances.service';
import { AttendanceDto, AttendanceStatus, SearchAttendancesRequest, PaginationResponse } from '../../../core/attendances/attendances.types';
import { ClassesService } from '../../../core/classes/classes.service';
import { ClassDto } from '../../../core/classes/classes.types';
import { SubjectsService } from '../../../core/subjects/subjects.service';
import { SubjectDto } from '../../../core/subjects/subjects.types';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'attendance-list',
    templateUrl: './attendance-list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations,
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule, RouterModule,
        MatButtonModule, MatDatepickerModule, MatNativeDateModule,
        MatFormFieldModule, MatIconModule, MatInputModule,
        MatPaginatorModule, MatSelectModule, MatButtonToggleModule, MatBadgeModule,
        MatTableModule, MatTooltipModule,
    ],
})
export class AttendanceListComponent implements OnInit, OnDestroy {
    attendances: AttendanceDto[] = [];
    isLoading = false;
    totalCount = 0;
    currentPage = 0;
    pageSize = 10;
    pageSizeOptions = [5, 10, 25, 50];
    searchControl = new FormControl('');
    fromDateControl = new FormControl<Date | null>(null);
    toDateControl = new FormControl<Date | null>(null);
    statusFilterControl = new FormControl<AttendanceStatus | ''>('');
    classFilterControl = new FormControl<string | ''>('');
    subjectFilterControl = new FormControl<string | ''>('');
    // Quick date-range shortcut currently applied (drives the toggle's highlighted state).
    activeRange: 'today' | 'week' | 'month' | '' = '';
    // Filters live in a collapsible panel so the header row stays compact.
    showFilters = false;
    classes: ClassDto[] = [];
    subjects: SubjectDto[] = [];
    // Status options for the filter dropdown (value + label), mirrors getStatusName().
    statusOptions: { value: AttendanceStatus; label: string }[] = [
        { value: AttendanceStatus.Present, label: 'Present' },
        { value: AttendanceStatus.Absent, label: 'Absent' },
        { value: AttendanceStatus.Late, label: 'Late' },
        { value: AttendanceStatus.HalfDay, label: 'Half Day' },
        { value: AttendanceStatus.Excused, label: 'Excused' },
        { value: AttendanceStatus.Medical, label: 'Medical' },
    ];
    displayedColumns: string[] = ['studentName', 'status', 'className', 'subjectName', 'date', 'markedByName', 'actions'];
    Math = Math;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _service: AttendancesService,
        private _classesService: ClassesService,
        private _subjectsService: SubjectsService,
        private _cdr: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _router: Router,
        private _route: ActivatedRoute,
        private _notificationService: NotificationService,
        private _dateUtils: DateUtils
    ) {}

    ngOnInit(): void {
        this.searchControl.valueChanges
            .pipe(takeUntil(this._unsubscribeAll), debounceTime(300), distinctUntilChanged())
            .subscribe(() => { this.currentPage = 0; this.loadData(); });
        // Any of the dropdown / date filters re-query from page 1.
        const filterControls: AbstractControl[] = [this.fromDateControl, this.toDateControl, this.statusFilterControl, this.classFilterControl, this.subjectFilterControl];
        filterControls.forEach(ctrl => ctrl.valueChanges
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => { this.currentPage = 0; this.loadData(); }));

        this._classesService.search({ pageNumber: 1, pageSize: 200 })
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(r => { this.classes = r.data; this._cdr.markForCheck(); });
        this._subjectsService.search({ pageNumber: 1, pageSize: 200 })
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(r => { this.subjects = r.data; this._cdr.markForCheck(); });

        this.loadData();
    }

    clearDateFilter(): void {
        this.activeRange = '';
        this.fromDateControl.setValue(null);
        this.toDateControl.setValue(null);
    }

    /** Number of filters currently applied — shown as a badge on the Filters button. */
    get activeFilterCount(): number {
        return [
            this.statusFilterControl.value,
            this.classFilterControl.value,
            this.subjectFilterControl.value,
            this.fromDateControl.value,
            this.toDateControl.value,
        ].filter(v => v !== '' && v !== null && v !== undefined).length;
    }

    clearAllFilters(): void {
        this.statusFilterControl.setValue('');
        this.classFilterControl.setValue('');
        this.subjectFilterControl.setValue('');
        this.clearDateFilter();
    }

    /** Quick-select chips: Today / This Week / This Month. Sets both date pickers
     * in one tap (the common daily-attendance interaction). Toggling the active
     * range off clears the dates. */
    setRange(range: 'today' | 'week' | 'month'): void {
        if (this.activeRange === range) { this.clearDateFilter(); return; }
        const now = new Date();
        let from: Date;
        const to = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        if (range === 'today') {
            from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        } else if (range === 'week') {
            const day = now.getDay(); // 0=Sun
            from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day);
        } else {
            from = new Date(now.getFullYear(), now.getMonth(), 1);
        }
        this.activeRange = range;
        // setValue with emitEvent false on the first so we only trigger one reload.
        this.fromDateControl.setValue(from, { emitEvent: false });
        this.toDateControl.setValue(to);
    }

    bulkMark(): void {
        this._router.navigate(['bulk-mark'], { relativeTo: this._route });
    }

    ngOnDestroy(): void { this._unsubscribeAll.next(null); this._unsubscribeAll.complete(); }

    loadData(): void {
        this.isLoading = true;
        this._cdr.markForCheck();
        const request: SearchAttendancesRequest = {
            pageNumber: this.currentPage + 1,
            pageSize: this.pageSize,
            keyword: this.searchControl.value || undefined,
            status: this.statusFilterControl.value || undefined,
            classId: this.classFilterControl.value || undefined,
            subjectId: this.subjectFilterControl.value || undefined,
            fromDate: this.fromDateControl.value ? this._dateUtils.formatDateForAPI(this.fromDateControl.value) : undefined,
            toDate: this.toDateControl.value ? this._dateUtils.formatDateForAPI(this.toDateControl.value) : undefined
        };
        this._service.search(request).pipe(takeUntil(this._unsubscribeAll)).subscribe({
            next: (response: PaginationResponse<AttendanceDto>) => {
                this.attendances = response.data;
                this.totalCount = response.totalCount;
                this.currentPage = response.currentPage - 1;
                this.isLoading = false;
                this._cdr.markForCheck();
            },
            error: () => { this.isLoading = false; this._cdr.markForCheck(); this._notificationService.error('Error loading attendance records'); }
        });
    }

    onPageChange(event: PageEvent): void { this.currentPage = event.pageIndex; this.pageSize = event.pageSize; this.loadData(); }
    add(): void { this._router.navigate(['create'], { relativeTo: this._route }); }
    edit(item: AttendanceDto): void { this._router.navigate([item.id, 'edit'], { relativeTo: this._route }); }

    deleteItem(item: AttendanceDto): void {
        const dialogRef = this._fuseConfirmationService.open({
            title: 'Delete Attendance Record',
            message: `Delete attendance for "${item.studentName}" on ${new Date(item.date).toLocaleDateString()}?`,
            icon: { show: true, name: 'heroicons_outline:exclamation-triangle', color: 'warn' },
            actions: { confirm: { show: true, label: 'Delete', color: 'warn' }, cancel: { show: true, label: 'Cancel' } },
            dismissible: false
        });
        dialogRef.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this._service.delete(item.id).pipe(takeUntil(this._unsubscribeAll)).subscribe({
                    next: () => { this._notificationService.success('Attendance record deleted'); this.loadData(); },
                    error: () => this._notificationService.error('Error deleting attendance record')
                });
            }
        });
    }

    getStatusName(status: AttendanceStatus): string {
        const map: Record<number, string> = { 1: 'Present', 2: 'Absent', 3: 'Late', 4: 'Half Day', 5: 'Excused', 6: 'Medical', 7: 'Holiday', 8: 'Weekend' };
        return map[status] || '-';
    }

    getStatusClass(status: AttendanceStatus): string {
        switch (status) {
            case AttendanceStatus.Present: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case AttendanceStatus.Absent: return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case AttendanceStatus.Late: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case AttendanceStatus.Excused: case AttendanceStatus.Medical: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
        }
    }
}
