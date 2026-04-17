import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { FeeInvoicesService } from '../../../core/fee-invoices/fee-invoices.service';
import { FeeInvoiceDto, InvoiceStatus, SearchFeeInvoicesRequest, PaginationResponse } from '../../../core/fee-invoices/fee-invoices.types';
import { ClassesService } from '../../../core/classes/classes.service';
import { ClassDto } from '../../../core/classes/classes.types';
import { AcademicYearsService } from '../../../core/academic-years/academic-years.service';
import { AcademicYearDto } from '../../../core/academic-years/academic-years.types';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'fee-invoice-list',
    templateUrl: './fee-invoice-list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations,
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule, RouterModule,
        MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule,
        MatPaginatorModule, MatSelectModule, MatTableModule, MatTooltipModule,
    ],
})
export class FeeInvoiceListComponent implements OnInit, OnDestroy {
    invoices: FeeInvoiceDto[] = [];
    isLoading = false;
    totalCount = 0;
    currentPage = 0;
    pageSize = 10;
    pageSizeOptions = [5, 10, 25, 50];
    searchControl = new FormControl('');
    selectedClassId = '';
    selectedAcademicYearId = '';
    overdueOnly = false;
    classes: ClassDto[] = [];
    academicYears: AcademicYearDto[] = [];
    displayedColumns: string[] = ['invoiceNumber', 'studentName', 'className', 'totalAmount', 'paidAmount', 'balanceAmount', 'dueDate', 'status', 'actions'];
    Math = Math;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _service: FeeInvoicesService,
        private _classesService: ClassesService,
        private _academicYearsService: AcademicYearsService,
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
        this.loadDropdowns();
        this.loadData();
    }

    ngOnDestroy(): void { this._unsubscribeAll.next(null); this._unsubscribeAll.complete(); }

    loadDropdowns(): void {
        this._classesService.search({ pageNumber: 1, pageSize: 200 })
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({ next: (r) => { this.classes = r.data; this._cdr.markForCheck(); }, error: () => {} });
        this._academicYearsService.search({ pageNumber: 1, pageSize: 200, isActive: true })
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({ next: (r) => { this.academicYears = r.data; this._cdr.markForCheck(); }, error: () => {} });
    }

    loadData(): void {
        this.isLoading = true;
        this._cdr.markForCheck();
        const request: SearchFeeInvoicesRequest = {
            pageNumber: this.currentPage + 1,
            pageSize: this.pageSize,
            keyword: this.searchControl.value || undefined,
            classId: this.selectedClassId || undefined,
            academicYearId: this.selectedAcademicYearId || undefined,
            overdueOnly: this.overdueOnly || undefined
        };
        this._service.search(request).pipe(takeUntil(this._unsubscribeAll)).subscribe({
            next: (response: PaginationResponse<FeeInvoiceDto>) => {
                this.invoices = response.data;
                this.totalCount = response.totalCount;
                this.currentPage = response.currentPage - 1;
                this.isLoading = false;
                this._cdr.markForCheck();
            },
            error: () => { this.isLoading = false; this._cdr.markForCheck(); this._notificationService.error('Error loading fee invoices'); }
        });
    }

    onFilterChange(): void { this.currentPage = 0; this.loadData(); }
    onPageChange(event: PageEvent): void { this.currentPage = event.pageIndex; this.pageSize = event.pageSize; this.loadData(); }
    add(): void { this._router.navigate(['create'], { relativeTo: this._route }); }
    edit(item: FeeInvoiceDto): void { this._router.navigate([item.id, 'edit'], { relativeTo: this._route }); }

    deleteItem(item: FeeInvoiceDto): void {
        const dialogRef = this._fuseConfirmationService.open({
            title: 'Delete Invoice',
            message: `Delete invoice "${item.invoiceNumber}" for "${item.studentName}"?`,
            icon: { show: true, name: 'heroicons_outline:exclamation-triangle', color: 'warn' },
            actions: { confirm: { show: true, label: 'Delete', color: 'warn' }, cancel: { show: true, label: 'Cancel' } },
            dismissible: false
        });
        dialogRef.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this._service.delete(item.id).pipe(takeUntil(this._unsubscribeAll)).subscribe({
                    next: () => { this._notificationService.success('Invoice deleted'); this.loadData(); },
                    error: () => this._notificationService.error('Error deleting invoice')
                });
            }
        });
    }

    getStatusName(status: InvoiceStatus): string {
        const map: Record<number, string> = {
            1: 'Pending', 2: 'Partial', 3: 'Paid', 4: 'Overdue',
            5: 'Cancelled', 6: 'Refunded', 7: 'Disputed', 8: 'On Hold'
        };
        return map[status] || '-';
    }

    isOverdue(item: FeeInvoiceDto): boolean {
        if (!item.dueDate || item.balanceAmount <= 0) return false;
        const due = new Date(item.dueDate);
        due.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return due < today;
    }

    daysOverdue(item: FeeInvoiceDto): number {
        if (!this.isOverdue(item)) return 0;
        const due = new Date(item.dueDate);
        const today = new Date();
        return Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
    }

    toggleOverdueFilter(): void {
        this.overdueOnly = !this.overdueOnly;
        this.currentPage = 0;
        this.loadData();
    }

    getStatusClass(status: InvoiceStatus): string {
        switch (status) {
            case InvoiceStatus.Paid: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case InvoiceStatus.Pending: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case InvoiceStatus.Partial: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case InvoiceStatus.Overdue: return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case InvoiceStatus.Cancelled: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
            case InvoiceStatus.Refunded: return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
        }
    }
}
