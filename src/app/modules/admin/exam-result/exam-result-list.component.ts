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
import { ExamResultsService } from '../../../core/exam-results/exam-results.service';
import { ExamResultDto, SearchExamResultsRequest, PaginationResponse } from '../../../core/exam-results/exam-results.types';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'exam-result-list',
    templateUrl: './exam-result-list.component.html',
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
export class ExamResultListComponent implements OnInit, OnDestroy {
    results: ExamResultDto[] = [];
    isLoading = false;
    totalCount = 0;
    currentPage = 0;
    pageSize = 10;
    pageSizeOptions = [5, 10, 25, 50];
    searchControl = new FormControl('');
    displayedColumns: string[] = ['studentName', 'examName', 'subjectName', 'className', 'marksObtained', 'percentage', 'grade', 'actions'];
    Math = Math;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _service: ExamResultsService,
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
        const request: SearchExamResultsRequest = {
            pageNumber: this.currentPage + 1,
            pageSize: this.pageSize,
            keyword: this.searchControl.value || undefined
        };
        this._service.search(request).pipe(takeUntil(this._unsubscribeAll)).subscribe({
            next: (response: PaginationResponse<ExamResultDto>) => {
                this.results = response.data;
                this.totalCount = response.totalCount;
                this.currentPage = response.currentPage - 1;
                this.isLoading = false;
                this._cdr.markForCheck();
            },
            error: () => { this.isLoading = false; this._cdr.markForCheck(); this._notificationService.error('Error loading exam results'); }
        });
    }

    onPageChange(event: PageEvent): void { this.currentPage = event.pageIndex; this.pageSize = event.pageSize; this.loadData(); }
    add(): void { this._router.navigate(['create'], { relativeTo: this._route }); }
    bulkEntry(): void { this._router.navigate(['bulk-entry'], { relativeTo: this._route }); }
    edit(item: ExamResultDto): void { this._router.navigate([item.id, 'edit'], { relativeTo: this._route }); }

    deleteItem(item: ExamResultDto): void {
        const dialogRef = this._fuseConfirmationService.open({
            title: 'Delete Exam Result',
            message: `Delete result for "${item.studentName}" in "${item.examName}"?`,
            icon: { show: true, name: 'heroicons_outline:exclamation-triangle', color: 'warn' },
            actions: { confirm: { show: true, label: 'Delete', color: 'warn' }, cancel: { show: true, label: 'Cancel' } },
            dismissible: false
        });
        dialogRef.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this._service.delete(item.id).pipe(takeUntil(this._unsubscribeAll)).subscribe({
                    next: () => { this._notificationService.success('Exam result deleted'); this.loadData(); },
                    error: () => this._notificationService.error('Error deleting exam result')
                });
            }
        });
    }

    /** Phase v1-I3 — grade now arrives as a tenant-configured label string;
     * we colour-bucket by the leading letter so any reasonable GradeBand
     * naming (A+ / B / Pass / Fail / ক / খ) gets a sensible tint. */
    getGradeName(grade?: string | null): string {
        return grade && grade.trim().length ? grade : '—';
    }

    getGradeClass(grade?: string | null): string {
        const g = (grade || '').trim().toUpperCase();
        if (!g || g === '—') return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
        if (g.startsWith('A') || g === 'OUTSTANDING' || g === 'EXCELLENT') return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        if (g.startsWith('B') || g === 'GOOD' || g === 'PASS') return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
        if (g.startsWith('C') || g === 'SATISFACTORY') return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
        if (g.startsWith('D') || g === 'NEEDSIMPROVEMENT' || g === 'NEEDS IMPROVEMENT') return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
        if (g.startsWith('F') || g === 'FAIL' || g === 'ABS') return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
}
