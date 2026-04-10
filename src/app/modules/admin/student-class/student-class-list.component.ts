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
import { StudentClassesService } from '../../../core/student-classes/student-classes.service';
import { StudentClassDto, SearchStudentClassesRequest, PaginationResponse } from '../../../core/student-classes/student-classes.types';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'student-class-list',
    templateUrl: './student-class-list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations,
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule,
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatPaginatorModule,
        MatTableModule,
        MatTooltipModule,
    ],
})
export class StudentClassListComponent implements OnInit, OnDestroy {
    studentClasses: StudentClassDto[] = [];
    isLoading = false;
    totalCount = 0;
    currentPage = 0;
    pageSize = 10;
    pageSizeOptions = [5, 10, 25, 50];

    searchControl = new FormControl('');
    displayedColumns: string[] = ['studentName', 'className', 'academicYear', 'rollNumber', 'enrollmentDate', 'status', 'actions'];

    Math = Math;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _studentClassesService: StudentClassesService,
        private _changeDetectorRef: ChangeDetectorRef,
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

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    loadData(): void {
        this.isLoading = true;
        this._changeDetectorRef.markForCheck();

        const request: SearchStudentClassesRequest = {
            pageNumber: this.currentPage + 1,
            pageSize: this.pageSize,
            keyword: this.searchControl.value || undefined
        };

        this._studentClassesService.search(request)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (response: PaginationResponse<StudentClassDto>) => {
                    this.studentClasses = response.data;
                    this.totalCount = response.totalCount;
                    this.currentPage = response.currentPage - 1;
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                },
                error: (error) => {
                    console.error('Error loading student classes:', error);
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                    this._notificationService.error('Error loading student class assignments');
                }
            });
    }

    onPageChange(event: PageEvent): void {
        this.currentPage = event.pageIndex;
        this.pageSize = event.pageSize;
        this.loadData();
    }

    add(): void {
        this._router.navigate(['create'], { relativeTo: this._route });
    }

    edit(item: StudentClassDto): void {
        this._router.navigate([item.id, 'edit'], { relativeTo: this._route });
    }

    deleteItem(item: StudentClassDto): void {
        const dialogRef = this._fuseConfirmationService.open({
            title: 'Remove Assignment',
            message: `Are you sure you want to remove "${item.studentName}" from "${item.className}"?`,
            icon: { show: true, name: 'heroicons_outline:exclamation-triangle', color: 'warn' },
            actions: { confirm: { show: true, label: 'Remove', color: 'warn' }, cancel: { show: true, label: 'Cancel' } },
            dismissible: false
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this._studentClassesService.delete(item.id)
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe({
                        next: () => { this._notificationService.success('Assignment removed successfully'); this.loadData(); },
                        error: () => this._notificationService.error('Error removing assignment')
                    });
            }
        });
    }

    getStatusClass(status: string): string {
        switch (status?.toLowerCase()) {
            case 'enrolled': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'withdrawn': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'graduated': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'suspended': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
        }
    }
}
