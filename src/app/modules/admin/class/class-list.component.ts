import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { ClassesService } from '../../../core/classes/classes.service';
import { ClassDto, SearchClassesRequest, PaginationResponse } from '../../../core/classes/classes.types';
import { AcademicYearsService } from '../../../core/academic-years/academic-years.service';
import { AcademicYearDto } from '../../../core/academic-years/academic-years.types';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'class-list',
    templateUrl: './class-list.component.html',
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
        MatSelectModule,
        MatTableModule,
        MatTooltipModule,
    ],
})
export class ClassListComponent implements OnInit, OnDestroy {
    classes: ClassDto[] = [];
    academicYears: AcademicYearDto[] = [];
    isLoading = false;
    totalCount = 0;
    currentPage = 0;
    pageSize = 10;
    pageSizeOptions = [5, 10, 25, 50];

    searchControl = new FormControl('');
    statusFilterControl = new FormControl('');
    academicYearFilterControl = new FormControl('');

    displayedColumns: string[] = ['name', 'code', 'grade', 'section', 'capacity', 'academicYear', 'status', 'actions'];

    Math = Math;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _classesService: ClassesService,
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
                this.loadClasses();
            });

        this.loadAcademicYears();
        this.loadClasses();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    loadAcademicYears(): void {
        this._academicYearsService.search({ pageNumber: 1, pageSize: 100, isActive: true })
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (response) => {
                    this.academicYears = response.data;
                    this._changeDetectorRef.markForCheck();
                },
                error: () => {}
            });
    }

    loadClasses(): void {
        this.isLoading = true;
        this._changeDetectorRef.markForCheck();

        const request: SearchClassesRequest = {
            pageNumber: this.currentPage + 1,
            pageSize: this.pageSize,
            orderBy: ['name'],
            keyword: this.searchControl.value || undefined
        };

        if (this.statusFilterControl.value) {
            request.isActive = this.statusFilterControl.value === 'true';
        }

        if (this.academicYearFilterControl.value) {
            request.academicYearId = this.academicYearFilterControl.value;
        }

        this._classesService.search(request)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (response: PaginationResponse<ClassDto>) => {
                    this.classes = response.data;
                    this.totalCount = response.totalCount;
                    this.currentPage = response.currentPage - 1;
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                },
                error: (error) => {
                    console.error('Error loading classes:', error);
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                    this._notificationService.error('Error loading classes');
                }
            });
    }

    onStatusFilterChange(): void {
        this.currentPage = 0;
        this.loadClasses();
    }

    onAcademicYearFilterChange(): void {
        this.currentPage = 0;
        this.loadClasses();
    }

    onPageChange(event: PageEvent): void {
        this.currentPage = event.pageIndex;
        this.pageSize = event.pageSize;
        this.loadClasses();
    }

    addClass(): void {
        this._router.navigate(['create'], { relativeTo: this._route });
    }

    editClass(classItem: ClassDto): void {
        this._router.navigate([classItem.id, 'edit'], { relativeTo: this._route });
    }

    deleteClass(classItem: ClassDto): void {
        const dialogRef = this._fuseConfirmationService.open({
            title: 'Delete Class',
            message: `Are you sure you want to delete "${classItem.name}"?`,
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
                this._classesService.delete(classItem.id)
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe({
                        next: () => {
                            this._notificationService.success('Class deleted successfully');
                            this.loadClasses();
                        },
                        error: (error) => {
                            console.error('Error deleting class:', error);
                            this._notificationService.error('Error deleting class');
                        }
                    });
            }
        });
    }
}
