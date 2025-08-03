import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { StudentAcademicsService } from '../../../core/student-academics/student-academics.service';
import { StudentAcademicDto, SearchStudentAcademicsRequest } from '../../../core/student-academics/student-academics.types';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'student-academics-list',
    templateUrl: './student-academics-list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule,
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatPaginatorModule,
        MatProgressBarModule,
        MatProgressSpinnerModule,
        MatSelectModule,
        MatTableModule,
        MatTooltipModule,
    ],
})
export class StudentAcademicsListComponent implements OnInit, OnDestroy {
    academics: StudentAcademicDto[] = [];
    isLoading = false;
    totalCount = 0;
    currentPage = 0;
    pageSize = 10;
    pageSizeOptions = [5, 10, 25, 50];
    
    // Search and filter controls
    searchControl = new FormControl('');
    
    // Table columns
    displayedColumns = ['student', 'semester', 'cgpa', 'credits', 'attendance', 'status', 'actions'];
    
    // Make Math available in template
    Math = Math;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _studentAcademicsService: StudentAcademicsService,
        private _fuseConfirmationService: FuseConfirmationService,
        private _notificationService: NotificationService
    ) {}

    ngOnInit(): void {
        // Load initial data
        this.loadAcademics();

        // Setup search debouncing
        this.searchControl.valueChanges
            .pipe(
                debounceTime(300),
                distinctUntilChanged(),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe(() => {
                this.currentPage = 0;
                this.loadAcademics();
            });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    loadAcademics(): void {
        this.isLoading = true;
        this._changeDetectorRef.markForCheck();

        const request: SearchStudentAcademicsRequest = {
            pageNumber: this.currentPage + 1,
            pageSize: this.pageSize,
            keyword: this.searchControl.value || '',
            orderBy: ['semester', 'cgpa']
        };

        this._studentAcademicsService.search(request)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (response) => {
                    this.academics = response.data || [];
                    this.totalCount = response.totalCount || 0;
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                },
                error: (error) => {
                    console.error('Error loading academic records:', error);
                    this._notificationService.error('Failed to load academic records');
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                }
            });
    }

    onPageChange(event: PageEvent): void {
        this.currentPage = event.pageIndex;
        this.pageSize = event.pageSize;
        this.loadAcademics();
    }

    createAcademic(): void {
        this._router.navigate(['create'], { relativeTo: this._activatedRoute });
    }

    editAcademic(academic: StudentAcademicDto): void {
        this._router.navigate(['edit', academic.id], { relativeTo: this._activatedRoute });
    }

    deleteAcademic(academic: StudentAcademicDto): void {
        const confirmation = this._fuseConfirmationService.open({
            title: 'Delete Academic Record',
            message: `Are you sure you want to delete the academic record for ${academic.studentName} (Semester ${academic.semester})?`,
            actions: {
                confirm: {
                    label: 'Delete'
                }
            }
        });

        confirmation.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this._studentAcademicsService.delete(academic.id)
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe({
                        next: () => {
                            this._notificationService.success('Academic record deleted successfully');
                            this.loadAcademics();
                        },
                        error: (error) => {
                            console.error('Error deleting academic record:', error);
                            this._notificationService.error('Failed to delete academic record');
                        }
                    });
            }
        });
    }

    getStatusColor(status: any): string {
        switch (status) {
            case 0: // Active
                return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200';
            case 1: // Inactive
                return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-200';
            case 2: // Graduated
                return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200';
            case 3: // Suspended
                return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200';
            case 4: // Transferred
                return 'text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-200';
            case 5: // Dropped
                return 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-200';
            default:
                return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-200';
        }
    }

    getCGPAColor(cgpa: number): string {
        if (cgpa >= 3.5) return 'text-green-600';
        if (cgpa >= 3.0) return 'text-blue-600';
        if (cgpa >= 2.5) return 'text-yellow-600';
        return 'text-red-600';
    }

    getAttendanceColor(attendance: number): string {
        if (attendance >= 90) return 'text-green-600';
        if (attendance >= 80) return 'text-blue-600';
        if (attendance >= 70) return 'text-yellow-600';
        return 'text-red-600';
    }

    getAcademicStatusLabel(status: any): string {
        const labels = {
            0: 'Active',
            1: 'Inactive',
            2: 'Suspended',
            3: 'Graduated',
            4: 'Dropped'
        };
        return labels[status] || status || 'N/A';
    }
} 