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
import { EmployeeQualificationsService } from '../../../core/employee-qualifications/employee-qualifications.service';
import { EmployeeQualificationDto, SearchEmployeeQualificationsRequest } from '../../../core/employee-qualifications/employee-qualifications.types';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'employee-qualifications-list',
    templateUrl: './employee-qualifications-list.component.html',
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
export class EmployeeQualificationsListComponent implements OnInit, OnDestroy {
    qualifications: EmployeeQualificationDto[] = [];
    isLoading = false;
    totalCount = 0;
    currentPage = 0;
    pageSize = 10;
    pageSizeOptions = [5, 10, 25, 50];
    
    // Search and filter controls
    searchControl = new FormControl('');
    
    // Table columns
    displayedColumns = ['employee', 'degree', 'institution', 'specialization', 'experience', 'certifications', 'actions'];
    
    // Make Math available in template
    Math = Math;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _employeeQualificationsService: EmployeeQualificationsService,
        private _fuseConfirmationService: FuseConfirmationService,
        private _notificationService: NotificationService
    ) {}

    ngOnInit(): void {
        // Load initial data
        this.loadQualifications();

        // Setup search debouncing
        this.searchControl.valueChanges
            .pipe(
                debounceTime(300),
                distinctUntilChanged(),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe(() => {
                this.currentPage = 0;
                this.loadQualifications();
            });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    loadQualifications(): void {
        this.isLoading = true;
        this._changeDetectorRef.markForCheck();

        const request: SearchEmployeeQualificationsRequest = {
            pageNumber: this.currentPage + 1,
            pageSize: this.pageSize,
            keyword: this.searchControl.value || '',
            orderBy: ['highestQualification', 'yearOfPassing']
        };

        this._employeeQualificationsService.search(request)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (response) => {
                    this.qualifications = response.data || [];
                    this.totalCount = response.totalCount || 0;
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                },
                error: (error) => {
                    console.error('Error loading employee qualifications:', error);
                    this._notificationService.error('Failed to load employee qualifications');
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                }
            });
    }

    onPageChange(event: PageEvent): void {
        this.currentPage = event.pageIndex;
        this.pageSize = event.pageSize;
        this.loadQualifications();
    }

    createQualification(): void {
        this._router.navigate(['create'], { relativeTo: this._activatedRoute });
    }

    editQualification(qualification: EmployeeQualificationDto): void {
        this._router.navigate(['edit', qualification.id], { relativeTo: this._activatedRoute });
    }

    deleteQualification(qualification: EmployeeQualificationDto): void {
        const confirmation = this._fuseConfirmationService.open({
            title: 'Delete Employee Qualification',
            message: `Are you sure you want to delete the ${qualification.highestQualification || 'qualification'} record for ${qualification.employeeName}?`,
            actions: {
                confirm: {
                    label: 'Delete'
                }
            }
        });

        confirmation.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this._employeeQualificationsService.delete(qualification.id)
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe({
                        next: () => {
                            this._notificationService.success('Employee qualification deleted successfully');
                            this.loadQualifications();
                        },
                        error: (error) => {
                            console.error('Error deleting employee qualification:', error);
                            this._notificationService.error('Failed to delete employee qualification');
                        }
                    });
            }
        });
    }

    getQualificationLevel(qualification: string): string {
        const level = qualification?.toLowerCase();
        if (level?.includes('phd') || level?.includes('doctorate')) return 'Doctorate';
        if (level?.includes('master') || level?.includes('msc') || level?.includes('ma')) return 'Masters';
        if (level?.includes('bachelor') || level?.includes('bsc') || level?.includes('ba')) return 'Bachelors';
        if (level?.includes('diploma')) return 'Diploma';
        return 'Other';
    }

    getQualificationColor(qualification: string): string {
        const level = this.getQualificationLevel(qualification);
        switch (level) {
            case 'Doctorate':
                return 'text-purple-600 bg-purple-100';
            case 'Masters':
                return 'text-blue-600 bg-blue-100';
            case 'Bachelors':
                return 'text-green-600 bg-green-100';
            case 'Diploma':
                return 'text-yellow-600 bg-yellow-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    }

    getExperienceColor(years: number): string {
        if (years >= 15) return 'text-purple-600';
        if (years >= 10) return 'text-blue-600';
        if (years >= 5) return 'text-green-600';
        if (years >= 2) return 'text-yellow-600';
        return 'text-gray-600';
    }

    formatCertifications(certifications: string): string {
        if (!certifications) return 'None';
        const certs = certifications.split(',').map(c => c.trim());
        return certs.length > 2 ? `${certs[0]}, ${certs[1]} +${certs.length - 2} more` : certifications;
    }
} 