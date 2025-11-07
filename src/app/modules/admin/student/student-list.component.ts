import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { StudentsService } from '../../../core/students/students.service';
import { StudentDto, SearchStudentsRequest, PaginationResponse } from '../../../core/students/students.types';
import { NotificationService } from '../../../core/services/notification.service';
import { DateUtils } from '../../../core/utils/date.utils';
import { StudentExportDialogComponent, ExportDialogData } from './student-export-dialog.component';

@Component({
    selector: 'student-list',
    templateUrl: './student-list.component.html',
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
        MatMenuModule,
        MatPaginatorModule,
        MatProgressBarModule,
        MatSelectModule,
        MatSortModule,
        MatTableModule,
        MatTooltipModule,
    ],
})
export class StudentListComponent implements OnInit, OnDestroy {
    students: StudentDto[] = [];
    isLoading = false;
    totalCount = 0;
    currentPage = 0;
    pageSize = 10;
    pageSizeOptions = [5, 10, 25, 50];
    
    // Search and filter controls
    searchControl = new FormControl('');
    statusFilterControl = new FormControl('');
    
    // Table columns
    displayedColumns: string[] = ['avatar', 'userName', 'name', 'email', 'phone', 'status', 'actions'];
    
    // Math property for pagination display
    Math = Math;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _studentsService: StudentsService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _router: Router,
        private _route: ActivatedRoute,
        private _notificationService: NotificationService,
        private _matDialog: MatDialog
    ) {}

    ngOnInit(): void {
        // Subscribe to search control changes with debouncing
        this.searchControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(300),
                distinctUntilChanged()
            )
            .subscribe(() => {
                this.currentPage = 0; // Reset to first page when searching
                this.loadStudents();
            });

        // Load initial data
        this.loadStudents();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    loadStudents(): void {
        this.isLoading = true;
        this._changeDetectorRef.markForCheck();

        const request: SearchStudentsRequest = {
            pageNumber: this.currentPage + 1, // API uses 1-based indexing
            pageSize: this.pageSize,
            orderBy: ['userProfile.firstName'], // Try navigation property path
            keyword: this.searchControl.value || undefined
        };

        // Add status filtering like user search
        if (this.statusFilterControl.value) {
            request.isActive = this.statusFilterControl.value === 'true';
        }

        console.log('Loading students with request:', request);

        this._studentsService.search(request)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (response: PaginationResponse<StudentDto>) => {
                    this.students = response.data;
                    this.totalCount = response.totalCount;
                    this.currentPage = response.currentPage - 1; // Convert to 0-based for Material paginator
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                },
                error: (error) => {
                    console.error('Error loading students:', error);
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                    this._notificationService.error('Error loading students');
                }
            });
    }



    onStatusFilterChange(): void {
        this.loadStudents();
    }

    onPageChange(event: PageEvent): void {
        this.currentPage = event.pageIndex;
        this.pageSize = event.pageSize;
        this.loadStudents();
    }

    onSortChange(sort: Sort): void {
        // Note: Sorting by firstName is not supported due to UserProfile navigation property
        // The backend will handle default sorting
        console.log('Sorting not implemented for students due to navigation properties');
    }

    editStudent(student: StudentDto): void {
        this._router.navigate([student.id, 'edit'], { relativeTo: this._route });
    }

    deleteStudent(student: StudentDto): void {
        const dialogRef = this._fuseConfirmationService.open({
            title: 'Delete Student',
            message: `Are you sure you want to delete ${student.firstName} ${student.lastName}?`,
            icon: {
                show: true,
                name: 'heroicons_outline:exclamation-triangle',
                color: 'warn'
            },
            actions: {
                confirm: {
                    show: true,
                    label: 'Delete',
                    color: 'warn'
                },
                cancel: {
                    show: true,
                    label: 'Cancel'
                }
            },
            dismissible: false
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this._studentsService.delete(student.id)
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe({
                        next: () => {
                            this._notificationService.success('Student deleted successfully');
                            this.loadStudents();
                        },
                        error: (error) => {
                            console.error('Error deleting student:', error);
                            this._notificationService.error('Error deleting student');
                        }
                    });
            }
        });
    }



    addStudent(): void {
        this._router.navigate(['/student/create']);
    }

    addHealthRecord(student: StudentDto): void {
        this._router.navigate(['/student-health/create'], { 
            queryParams: { 
                studentId: student.id, 
                studentName: `${student.firstName} ${student.lastName}` 
            }
        });
    }

    addAcademicRecord(student: StudentDto): void {
        this._router.navigate(['/student-academics/create'], { 
            queryParams: { 
                studentId: student.id, 
                studentName: `${student.firstName} ${student.lastName}` 
            }
        });
    }

    /**
     * Get full name of student
     */
    getFullName(student: StudentDto): string {
        return `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'N/A';
    }

    exportStudents(): void {
        const dialogRef = this._matDialog.open(StudentExportDialogComponent, {
            data: {
                totalStudents: this.totalCount,
                filters: {
                    keyword: this.searchControl.value,
                    isActive: this.statusFilterControl.value
                }
            } as ExportDialogData
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                // Export functionality is handled inside the dialog component
                this.loadStudents(); // Refresh the list after export
            }
        });
    }
} 