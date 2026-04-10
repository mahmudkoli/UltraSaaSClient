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
import { ExamResultDto, Grade, SearchExamResultsRequest, PaginationResponse } from '../../../core/exam-results/exam-results.types';
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

    getGradeName(grade: Grade): string {
        const map: Record<number, string> = {
            1: 'A+', 2: 'A', 3: 'B+', 4: 'B', 5: 'C+', 6: 'C', 7: 'D', 8: 'F',
            9: 'Pass', 10: 'Fail', 11: 'Outstanding', 12: 'Excellent', 13: 'Good', 14: 'Satisfactory', 15: 'Needs Improvement'
        };
        return map[grade] || '-';
    }

    getGradeClass(grade: Grade): string {
        switch (grade) {
            case Grade.APlus: case Grade.A: case Grade.Outstanding: case Grade.Excellent:
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case Grade.BPlus: case Grade.B: case Grade.Good: case Grade.Pass:
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case Grade.CPlus: case Grade.C: case Grade.Satisfactory:
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case Grade.D: case Grade.NeedsImprovement:
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
            case Grade.F: case Grade.Fail:
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
        }
    }
}
