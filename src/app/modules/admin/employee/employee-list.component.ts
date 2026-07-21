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
import { EmployeesService } from '../../../core/employees/employees.service';
import { EmployeeDto, SearchEmployeesRequest, PaginationResponse, Designation } from '../../../core/employees/employees.types';
import { NotificationService } from '../../../core/services/notification.service';
import { EmployeeDevToolsDialogComponent } from './employee-dev-tools-dialog.component';

@Component({
    selector: 'employee-list',
    templateUrl: './employee-list.component.html',
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
export class EmployeeListComponent implements OnInit, OnDestroy {
    employees: EmployeeDto[] = [];
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
        private _employeesService: EmployeesService,
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
                this.loadEmployees();
            });

        // Load initial data
        this.loadEmployees();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    loadEmployees(): void {
        this.isLoading = true;
        this._changeDetectorRef.markForCheck();

        const request: SearchEmployeesRequest = {
            pageNumber: this.currentPage + 1, // API uses 1-based indexing
            pageSize: this.pageSize,
            orderBy: ['userProfile.firstName'], // Try navigation property path
            // Backend filters employees by the dedicated `Name` field
            // ((FirstName + " " + LastName).Contains). `keyword` only searches the
            // Employee entity's first-level string columns and never reaches the
            // UserProfile name, so it always returned zero matches. (BUG-T1)
            name: this.searchControl.value || undefined
        };

        // Add status filtering like user search
        if (this.statusFilterControl.value) {
            request.isActive = this.statusFilterControl.value === 'true';
        }

        console.log('Loading employees with request:', request);

        this._employeesService.search(request)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (response: PaginationResponse<EmployeeDto>) => {
                    this.employees = response.data;
                    this.totalCount = response.totalCount;
                    this.currentPage = response.currentPage - 1; // Convert to 0-based for Material paginator
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                },
                error: (error) => {
                    console.error('Error loading employees:', error);
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                    this._notificationService.error('Error loading employees');
                }
            });
    }



    onStatusFilterChange(): void {
        this.loadEmployees();
    }

    onPageChange(event: PageEvent): void {
        this.currentPage = event.pageIndex;
        this.pageSize = event.pageSize;
        this.loadEmployees();
    }

    onSortChange(sort: Sort): void {
        // Note: Sorting not implemented for employees
        console.log('Sorting not implemented for employees');
    }

    editEmployee(employee: EmployeeDto): void {
        this._router.navigate([employee.id, 'edit'], { relativeTo: this._route });
    }

    deleteEmployee(employee: EmployeeDto): void {
        const dialogRef = this._fuseConfirmationService.open({
            title: 'Delete Employee',
            message: `Are you sure you want to delete ${employee.firstName} ${employee.lastName}?`,
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
                this._employeesService.delete(employee.id)
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe({
                        next: () => {
                            this._notificationService.success('Employee deleted successfully');
                            this.loadEmployees();
                        },
                        error: (error) => {
                            console.error('Error deleting employee:', error);
                            this._notificationService.error('Error deleting employee');
                        }
                    });
            }
        });
    }

    addEmployee(): void {
        this._router.navigate(['/employees/create']);
    }

    addQualification(employee: EmployeeDto): void {
        this._router.navigate(['/employee-qualifications/create'], { 
            queryParams: { 
                employeeId: employee.id, 
                employeeName: `${employee.firstName} ${employee.lastName}` 
            }
        });
    }

    /**
     * Get full name of employee
     */
    getFullName(employee: EmployeeDto): string {
        return `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || 'N/A';
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
            [Designation.SeniorEmployee]: 'Senior Employee',
            [Designation.Employee]: 'Employee',
            [Designation.AssistantEmployee]: 'Assistant Employee',
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
            [Designation.SportsEmployee]: 'Sports Employee',
            [Designation.MusicEmployee]: 'Music Employee',
            [Designation.ArtEmployee]: 'Art Employee',
            [Designation.ComputerEmployee]: 'Computer Employee',
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
        const dialogRef = this._matDialog.open(EmployeeDevToolsDialogComponent, {
            width: '600px',
            panelClass: 'dev-tools-dialog'
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                // Refresh the list after generation/deletion
                this.loadEmployees();
            }
        });
    }
} 