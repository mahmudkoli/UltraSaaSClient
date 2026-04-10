import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { AttendancesService } from '../../../core/attendances/attendances.service';
import { AttendanceDto, AttendanceStatus, SearchAttendancesRequest, PaginationResponse } from '../../../core/attendances/attendances.types';
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
        MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule,
        MatPaginatorModule, MatTableModule, MatTooltipModule,
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
    displayedColumns: string[] = ['studentName', 'className', 'subjectName', 'date', 'status', 'markedByName', 'actions'];
    Math = Math;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _service: AttendancesService,
        private _cdr: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _router: Router,
        private _route: ActivatedRoute,
        private _notificationService: NotificationService
    ) {}

    ngOnInit(): void {
        this.searchControl.valueChanges
            .pipe(takeUntil(this._unsubscribeAll), debounceTime(300), distinctUntilChanged())
            .subscribe(() => { this.currentPage = 0; this.loadData(); });
        this.loadData();
    }

    ngOnDestroy(): void { this._unsubscribeAll.next(null); this._unsubscribeAll.complete(); }

    loadData(): void {
        this.isLoading = true;
        this._cdr.markForCheck();
        const request: SearchAttendancesRequest = {
            pageNumber: this.currentPage + 1,
            pageSize: this.pageSize,
            keyword: this.searchControl.value || undefined
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
