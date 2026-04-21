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
import { StudentHealthService } from '../../../core/student-health/student-health.service';
import { StudentHealthDto, SearchStudentHealthsRequest } from '../../../core/student-health/student-health.types';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'student-health-list',
    templateUrl: './student-health-list.component.html',
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
export class StudentHealthListComponent implements OnInit, OnDestroy {
    healthRecords: StudentHealthDto[] = [];
    isLoading = false;
    totalCount = 0;
    currentPage = 0;
    pageSize = 10;
    pageSizeOptions = [5, 10, 25, 50];
    
    // Search and filter controls
    searchControl = new FormControl('');
    
    // Table columns
    displayedColumns = ['student', 'bloodGroup', 'height', 'weight', 'bmi', 'allergies', 'actions'];
    
    // Make Math available in template
    Math = Math;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _studentHealthService: StudentHealthService,
        private _fuseConfirmationService: FuseConfirmationService,
        private _notificationService: NotificationService
    ) {}

    ngOnInit(): void {
        // Load initial data
        this.loadHealthRecords();

        // Setup search debouncing
        this.searchControl.valueChanges
            .pipe(
                debounceTime(300),
                distinctUntilChanged(),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe(() => {
                this.currentPage = 0;
                this.loadHealthRecords();
            });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    loadHealthRecords(): void {
        this.isLoading = true;
        this._changeDetectorRef.markForCheck();

        const request: SearchStudentHealthsRequest = {
            pageNumber: this.currentPage + 1,
            pageSize: this.pageSize,
            keyword: this.searchControl.value || ''
        };

        this._studentHealthService.search(request)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (response) => {
                    this.healthRecords = response.data || [];
                    this.totalCount = response.totalCount || 0;
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                },
                error: (error) => {
                    console.error('Error loading health records:', error);
                    this._notificationService.error('Failed to load health records');
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                }
            });
    }



    onPageChange(event: PageEvent): void {
        this.currentPage = event.pageIndex;
        this.pageSize = event.pageSize;
        this.loadHealthRecords();
    }

    createHealthRecord(): void {
        this._router.navigate(['create'], { relativeTo: this._activatedRoute });
    }

    editHealthRecord(record: StudentHealthDto): void {
        this._router.navigate(['edit', record.id], { relativeTo: this._activatedRoute });
    }

    deleteHealthRecord(record: StudentHealthDto): void {
        const confirmation = this._fuseConfirmationService.open({
            title: 'Delete Health Record',
            message: `Are you sure you want to delete the health record for ${record.studentName}?`,
            actions: {
                confirm: {
                    label: 'Delete'
                }
            }
        });

        confirmation.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this._studentHealthService.delete(record.id)
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe({
                        next: () => {
                            this._notificationService.success('Health record deleted successfully');
                            this.loadHealthRecords();
                        },
                        error: (error) => {
                            console.error('Error deleting health record:', error);
                            this._notificationService.error('Failed to delete health record');
                        }
                    });
            }
        });
    }

    getBMICategory(bmi: number): string {
        if (bmi < 18.5) return 'Underweight';
        if (bmi < 25) return 'Normal';
        if (bmi < 30) return 'Overweight';
        return 'Obese';
    }

    getBMIColor(bmi: number): string {
        if (bmi < 18.5) return 'text-blue-600';
        if (bmi < 25) return 'text-green-600';
        if (bmi < 30) return 'text-yellow-600';
        return 'text-red-600';
    }

    toNumber(value: any): number | null {
        if (value === null || value === undefined || value === '') return null;
        const n = parseFloat(String(value));
        return isNaN(n) ? null : n;
    }

    getBloodGroupLabel(bloodGroup: any): string {
        const labels = {
            0: 'A+',
            1: 'A-',
            2: 'B+',
            3: 'B-',
            4: 'AB+',
            5: 'AB-',
            6: 'O+',
            7: 'O-'
        };
        return labels[bloodGroup] || bloodGroup || 'N/A';
    }
} 