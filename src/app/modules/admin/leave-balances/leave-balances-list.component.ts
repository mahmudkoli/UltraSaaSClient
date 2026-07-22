import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
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
import { LeaveBalancesService } from '../../../core/leave-balances/leave-balances.service';
import { LeaveBalanceDto } from '../../../core/leave-balances/leave-balances.types';
import { EmployeesService } from '../../../core/employees/employees.service';
import { EmployeeDto } from '../../../core/employees/employees.types';
import { LeaveTypesService } from '../../../core/leave-types/leave-types.service';
import { LeaveTypeDto } from '../../../core/leave-types/leave-types.types';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'leave-balances-list',
    templateUrl: './leave-balances-list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule, RouterModule, ListPageComponent,
        MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule,
        MatPaginatorModule, MatProgressBarModule, MatSelectModule, MatTableModule, MatTooltipModule,
    ],
})
export class LeaveBalancesListComponent implements OnInit, OnDestroy {
    items: LeaveBalanceDto[] = [];
    employees: EmployeeDto[] = [];
    leaveTypes: LeaveTypeDto[] = [];
    isLoading = false;
    totalCount = 0;
    currentPage = 0;
    pageSize = 10;
    pageSizeOptions = [5, 10, 25, 50];
    displayedColumns = ['employee', 'leaveType', 'year', 'entitled', 'taken', 'balance', 'actions'];
    Math = Math;

    employeeFilter = new FormControl('');
    typeFilter = new FormControl('');
    yearFilter = new FormControl('');

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _service: LeaveBalancesService,
        private _employeesService: EmployeesService,
        private _leaveTypesService: LeaveTypesService,
        private _fuseConfirmationService: FuseConfirmationService,
        private _notificationService: NotificationService,
    ) {}

    ngOnInit(): void {
        this._employeesService.search({ pageNumber: 1, pageSize: 1000, keyword: '' })
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({ next: (r) => { this.employees = r.data || []; this._changeDetectorRef.markForCheck(); }, error: () => {} });
        this._leaveTypesService.search({ pageNumber: 1, pageSize: 200 })
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({ next: (r) => { this.leaveTypes = r.data || []; this._changeDetectorRef.markForCheck(); }, error: () => {} });

        this.load();
        merge(this.employeeFilter.valueChanges, this.typeFilter.valueChanges, this.yearFilter.valueChanges)
            .pipe(debounceTime(200), takeUntil(this._unsubscribeAll))
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
            leaveTypeId: this.typeFilter.value || undefined,
            year: this.yearFilter.value ? +this.yearFilter.value : undefined,
        }).pipe(takeUntil(this._unsubscribeAll)).subscribe({
            next: (response) => {
                this.items = response.data || [];
                this.totalCount = response.totalCount || 0;
                this.isLoading = false;
                this._changeDetectorRef.markForCheck();
            },
            error: () => {
                this._notificationService.error('Failed to load leave balances');
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

    setBalance(): void {
        this._router.navigate(['set'], { relativeTo: this._activatedRoute });
    }

    edit(item: LeaveBalanceDto): void {
        this._router.navigate(['set'], {
            relativeTo: this._activatedRoute,
            queryParams: { employeeId: item.employeeId, leaveTypeId: item.leaveTypeId, year: item.year, entitled: item.entitled },
        });
    }

    remove(item: LeaveBalanceDto): void {
        const confirmation = this._fuseConfirmationService.open({
            title: 'Delete Leave Balance',
            message: `Delete the ${item.leaveTypeName} ${item.year} balance for ${item.employeeName}?`,
            actions: { confirm: { label: 'Delete' } },
        });
        confirmation.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this._service.delete(item.id).pipe(takeUntil(this._unsubscribeAll)).subscribe({
                    next: () => { this._notificationService.success('Leave balance deleted'); this.load(); },
                    error: () => this._notificationService.error('Failed to delete leave balance'),
                });
            }
        });
    }
}
