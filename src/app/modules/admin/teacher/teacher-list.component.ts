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
import { TeachersService } from '../../../core/teachers/teachers.service';
import { TeacherDto, SearchTeachersRequest, PaginationResponse, Designation } from '../../../core/teachers/teachers.types';
import { NotificationService } from '../../../core/services/notification.service';
import { TeacherDevToolsDialogComponent } from './teacher-dev-tools-dialog.component';

@Component({
    selector: 'teacher-list',
    templateUrl: './teacher-list.component.html',
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
export class TeacherListComponent implements OnInit, OnDestroy {
    teachers: TeacherDto[] = [];
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
        private _teachersService: TeachersService,
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
                this.loadTeachers();
            });

        // Load initial data
        this.loadTeachers();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    loadTeachers(): void {
        this.isLoading = true;
        this._changeDetectorRef.markForCheck();

        const request: SearchTeachersRequest = {
            pageNumber: this.currentPage + 1, // API uses 1-based indexing
            pageSize: this.pageSize,
            orderBy: ['userProfile.firstName'], // Try navigation property path
            keyword: this.searchControl.value || undefined
        };

        // Add status filtering like user search
        if (this.statusFilterControl.value) {
            request.isActive = this.statusFilterControl.value === 'true';
        }

        console.log('Loading teachers with request:', request);

        this._teachersService.search(request)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (response: PaginationResponse<TeacherDto>) => {
                    this.teachers = response.data;
                    this.totalCount = response.totalCount;
                    this.currentPage = response.currentPage - 1; // Convert to 0-based for Material paginator
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                },
                error: (error) => {
                    console.error('Error loading teachers:', error);
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                    this._notificationService.error('Error loading teachers');
                }
            });
    }



    onStatusFilterChange(): void {
        this.loadTeachers();
    }

    onPageChange(event: PageEvent): void {
        this.currentPage = event.pageIndex;
        this.pageSize = event.pageSize;
        this.loadTeachers();
    }

    onSortChange(sort: Sort): void {
        // Note: Sorting not implemented for teachers
        console.log('Sorting not implemented for teachers');
    }

    editTeacher(teacher: TeacherDto): void {
        this._router.navigate([teacher.id, 'edit'], { relativeTo: this._route });
    }

    deleteTeacher(teacher: TeacherDto): void {
        const dialogRef = this._fuseConfirmationService.open({
            title: 'Delete Teacher',
            message: `Are you sure you want to delete ${teacher.firstName} ${teacher.lastName}?`,
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
                this._teachersService.delete(teacher.id)
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe({
                        next: () => {
                            this._notificationService.success('Teacher deleted successfully');
                            this.loadTeachers();
                        },
                        error: (error) => {
                            console.error('Error deleting teacher:', error);
                            this._notificationService.error('Error deleting teacher');
                        }
                    });
            }
        });
    }

    addTeacher(): void {
        this._router.navigate(['/teacher/create']);
    }

    addQualification(teacher: TeacherDto): void {
        this._router.navigate(['/teacher-qualifications/create'], { 
            queryParams: { 
                teacherId: teacher.id, 
                teacherName: `${teacher.firstName} ${teacher.lastName}` 
            }
        });
    }

    /**
     * Get full name of teacher
     */
    getFullName(teacher: TeacherDto): string {
        return `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim() || 'N/A';
    }

    /**
     * Get designation label from enum value
     */
    getDesignationLabel(designation?: Designation): string {
        if (designation === undefined || designation === null) {
            return 'N/A';
        }

        const designationLabels = {
            [Designation.Principal]: 'Principal',
            [Designation.VicePrincipal]: 'Vice Principal',
            [Designation.HeadOfDepartment]: 'Head Of Department',
            [Designation.SeniorTeacher]: 'Senior Teacher',
            [Designation.Teacher]: 'Teacher',
            [Designation.AssistantTeacher]: 'Assistant Teacher',
            [Designation.Lecturer]: 'Lecturer',
            [Designation.SeniorLecturer]: 'Senior Lecturer',
            [Designation.AssistantProfessor]: 'Assistant Professor',
            [Designation.AssociateProfessor]: 'Associate Professor',
            [Designation.Professor]: 'Professor',
            [Designation.VisitingProfessor]: 'Visiting Professor',
            [Designation.AdjunctProfessor]: 'Adjunct Professor',
            [Designation.ResearchScholar]: 'Research Scholar',
            [Designation.TeachingAssistant]: 'Teaching Assistant',
            [Designation.LabAssistant]: 'Lab Assistant',
            [Designation.Librarian]: 'Librarian',
            [Designation.AssistantLibrarian]: 'Assistant Librarian',
            [Designation.SportsTeacher]: 'Sports Teacher',
            [Designation.MusicTeacher]: 'Music Teacher',
            [Designation.ArtTeacher]: 'Art Teacher',
            [Designation.ComputerTeacher]: 'Computer Teacher',
            [Designation.Counselor]: 'Counselor',
            [Designation.Administrator]: 'Administrator',
            [Designation.AccountsOfficer]: 'Accounts Officer',
            [Designation.DataEntryOperator]: 'Data Entry Operator',
            [Designation.Peon]: 'Peon',
            [Designation.Driver]: 'Driver',
            [Designation.SecurityGuard]: 'Security Guard',
            [Designation.Other]: 'Other'
        };

        return designationLabels[designation] || 'Unknown';
    }

    openDevTools(): void {
        const dialogRef = this._matDialog.open(TeacherDevToolsDialogComponent, {
            width: '600px',
            panelClass: 'dev-tools-dialog'
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                // Refresh the list after generation/deletion
                this.loadTeachers();
            }
        });
    }
} 