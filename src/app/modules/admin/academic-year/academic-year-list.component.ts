import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { AcademicYearsService } from '../../../core/academic-years/academic-years.service';
import { AcademicYearDto, SearchAcademicYearsRequest, PaginationResponse } from '../../../core/academic-years/academic-years.types';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'academic-year-list',
    templateUrl: './academic-year-list.component.html',
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
        MatSelectModule,
        MatTableModule,
        MatTooltipModule,
    ],
})
export class AcademicYearListComponent implements OnInit, OnDestroy {
    academicYears: AcademicYearDto[] = [];
    isLoading = false;
    totalCount = 0;
    currentPage = 0;
    pageSize = 10;
    pageSizeOptions = [5, 10, 25, 50];

    searchControl = new FormControl('');
    statusFilterControl = new FormControl('');

    displayedColumns: string[] = ['name', 'code', 'startDate', 'endDate', 'status', 'actions'];

    Math = Math;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _academicYearsService: AcademicYearsService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _router: Router,
        private _route: ActivatedRoute,
        private _notificationService: NotificationService
    ) {}

    ngOnInit(): void {
        this.searchControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(300),
                distinctUntilChanged()
            )
            .subscribe(() => {
                this.currentPage = 0;
                this.loadAcademicYears();
            });

        this.loadAcademicYears();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    loadAcademicYears(): void {
        this.isLoading = true;
        this._changeDetectorRef.markForCheck();

        const request: SearchAcademicYearsRequest = {
            pageNumber: this.currentPage + 1,
            pageSize: this.pageSize,
            orderBy: ['name'],
            keyword: this.searchControl.value || undefined
        };

        if (this.statusFilterControl.value) {
            request.isActive = this.statusFilterControl.value === 'true';
        }

        this._academicYearsService.search(request)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (response: PaginationResponse<AcademicYearDto>) => {
                    this.academicYears = response.data;
                    this.totalCount = response.totalCount;
                    this.currentPage = response.currentPage - 1;
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                },
                error: (error) => {
                    console.error('Error loading academic years:', error);
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                    this._notificationService.error('Error loading academic years');
                }
            });
    }

    onStatusFilterChange(): void {
        this.currentPage = 0;
        this.loadAcademicYears();
    }

    onPageChange(event: PageEvent): void {
        this.currentPage = event.pageIndex;
        this.pageSize = event.pageSize;
        this.loadAcademicYears();
    }

    addAcademicYear(): void {
        this._router.navigate(['create'], { relativeTo: this._route });
    }

    editAcademicYear(academicYear: AcademicYearDto): void {
        this._router.navigate([academicYear.id, 'edit'], { relativeTo: this._route });
    }

    deleteAcademicYear(academicYear: AcademicYearDto): void {
        const dialogRef = this._fuseConfirmationService.open({
            title: 'Delete Academic Year',
            message: `Are you sure you want to delete "${academicYear.name}"?`,
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
                this._academicYearsService.delete(academicYear.id)
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe({
                        next: () => {
                            this._notificationService.success('Academic year deleted successfully');
                            this.loadAcademicYears();
                        },
                        error: (error) => {
                            console.error('Error deleting academic year:', error);
                            this._notificationService.error('Error deleting academic year');
                        }
                    });
            }
        });
    }
}
