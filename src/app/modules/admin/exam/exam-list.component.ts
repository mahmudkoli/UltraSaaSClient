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
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { ExamsService } from '../../../core/exams/exams.service';
import { ExamDto, SearchExamsRequest, PaginationResponse } from '../../../core/exams/exams.types';
import { NotificationService } from '../../../core/services/notification.service';
import { DateUtils } from '../../../core/utils/date.utils';

@Component({
    selector: 'exam-list',
    templateUrl: './exam-list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations,
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule, RouterModule,
        MatButtonModule, MatDatepickerModule, MatNativeDateModule,
        MatFormFieldModule, MatIconModule, MatInputModule,
        MatPaginatorModule, MatSelectModule, MatTableModule, MatTooltipModule,
    ],
})
export class ExamListComponent implements OnInit, OnDestroy {
    exams: ExamDto[] = [];
    isLoading = false;
    totalCount = 0;
    currentPage = 0;
    pageSize = 10;
    pageSizeOptions = [5, 10, 25, 50];
    searchControl = new FormControl('');
    selectedStatus: string = '';
    examTypeFilterControl = new FormControl<string | ''>('');
    fromDateControl = new FormControl<Date | null>(null);
    toDateControl = new FormControl<Date | null>(null);
    // Same exam-type vocabulary as the create form.
    examTypeOptions = [
        'UnitTest', 'MidTerm', 'Final', 'Quiz', 'Assignment', 'Project', 'Practical',
        'Semester', 'Viva', 'Thesis', 'Dissertation', 'MockTest', 'PracticeTest',
        'Entrance', 'Competitive', 'SkillAssessment', 'Comprehensive', 'Qualifying',
        'Placement', 'Certification', 'Online', 'Proctored', 'Oral', 'Written',
        'Laboratory', 'Field', 'Clinical', 'Portfolio', 'Other'
    ];
    displayedColumns: string[] = ['name', 'code', 'examType', 'academicYearName', 'startDate', 'endDate', 'totalMarks', 'status', 'actions'];
    Math = Math;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _service: ExamsService,
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
        const filterControls: AbstractControl[] = [this.examTypeFilterControl, this.fromDateControl, this.toDateControl];
        filterControls.forEach(ctrl => ctrl.valueChanges
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => { this.currentPage = 0; this.loadData(); }));
        this.loadData();
    }

    clearDateFilter(): void {
        this.fromDateControl.setValue(null);
        this.toDateControl.setValue(null);
    }

    ngOnDestroy(): void { this._unsubscribeAll.next(null); this._unsubscribeAll.complete(); }

    loadData(): void {
        this.isLoading = true;
        this._cdr.markForCheck();
        const request: SearchExamsRequest = {
            pageNumber: this.currentPage + 1,
            pageSize: this.pageSize,
            keyword: this.searchControl.value || undefined,
            isActive: this.selectedStatus === '' ? undefined : this.selectedStatus === 'true',
            examType: this.examTypeFilterControl.value || undefined,
            fromDate: this.fromDateControl.value ? this._dateUtils.formatDateForAPI(this.fromDateControl.value) : undefined,
            toDate: this.toDateControl.value ? this._dateUtils.formatDateForAPI(this.toDateControl.value) : undefined
        };
        this._service.search(request).pipe(takeUntil(this._unsubscribeAll)).subscribe({
            next: (response: PaginationResponse<ExamDto>) => {
                this.exams = response.data;
                this.totalCount = response.totalCount;
                this.currentPage = response.currentPage - 1;
                this.isLoading = false;
                this._cdr.markForCheck();
            },
            error: () => { this.isLoading = false; this._cdr.markForCheck(); this._notificationService.error('Error loading exams'); }
        });
    }

    onStatusFilterChange(): void { this.currentPage = 0; this.loadData(); }
    onPageChange(event: PageEvent): void { this.currentPage = event.pageIndex; this.pageSize = event.pageSize; this.loadData(); }
    add(): void { this._router.navigate(['create'], { relativeTo: this._route }); }
    edit(item: ExamDto): void { this._router.navigate([item.id, 'edit'], { relativeTo: this._route }); }

    deleteItem(item: ExamDto): void {
        const dialogRef = this._fuseConfirmationService.open({
            title: 'Delete Exam',
            message: `Delete exam "${item.name}"?`,
            icon: { show: true, name: 'heroicons_outline:exclamation-triangle', color: 'warn' },
            actions: { confirm: { show: true, label: 'Delete', color: 'warn' }, cancel: { show: true, label: 'Cancel' } },
            dismissible: false
        });
        dialogRef.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this._service.delete(item.id).pipe(takeUntil(this._unsubscribeAll)).subscribe({
                    next: () => { this._notificationService.success('Exam deleted'); this.loadData(); },
                    error: () => this._notificationService.error('Error deleting exam')
                });
            }
        });
    }
}
