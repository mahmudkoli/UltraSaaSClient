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
import { SubjectsService } from '../../../core/subjects/subjects.service';
import { SubjectDto, SearchSubjectsRequest, PaginationResponse, SubjectType } from '../../../core/subjects/subjects.types';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'subject-list',
    templateUrl: './subject-list.component.html',
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
export class SubjectListComponent implements OnInit, OnDestroy {
    subjects: SubjectDto[] = [];
    isLoading = false;
    totalCount = 0;
    currentPage = 0;
    pageSize = 10;
    pageSizeOptions = [5, 10, 25, 50];

    searchControl = new FormControl('');
    statusFilterControl = new FormControl('');

    displayedColumns: string[] = ['name', 'code', 'subjectType', 'creditHours', 'department', 'status', 'actions'];

    Math = Math;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _subjectsService: SubjectsService,
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
                this.loadSubjects();
            });

        this.loadSubjects();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    loadSubjects(): void {
        this.isLoading = true;
        this._changeDetectorRef.markForCheck();

        const request: SearchSubjectsRequest = {
            pageNumber: this.currentPage + 1,
            pageSize: this.pageSize,
            orderBy: ['name'],
            keyword: this.searchControl.value || undefined
        };

        if (this.statusFilterControl.value) {
            request.isActive = this.statusFilterControl.value === 'true';
        }

        this._subjectsService.search(request)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (response: PaginationResponse<SubjectDto>) => {
                    this.subjects = response.data;
                    this.totalCount = response.totalCount;
                    this.currentPage = response.currentPage - 1;
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                },
                error: (error) => {
                    console.error('Error loading subjects:', error);
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                    this._notificationService.error('Error loading subjects');
                }
            });
    }

    onStatusFilterChange(): void {
        this.currentPage = 0;
        this.loadSubjects();
    }

    onPageChange(event: PageEvent): void {
        this.currentPage = event.pageIndex;
        this.pageSize = event.pageSize;
        this.loadSubjects();
    }

    addSubject(): void {
        this._router.navigate(['create'], { relativeTo: this._route });
    }

    editSubject(subject: SubjectDto): void {
        this._router.navigate([subject.id, 'edit'], { relativeTo: this._route });
    }

    deleteSubject(subject: SubjectDto): void {
        const dialogRef = this._fuseConfirmationService.open({
            title: 'Delete Subject',
            message: `Are you sure you want to delete "${subject.name}"?`,
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
                this._subjectsService.delete(subject.id)
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe({
                        next: () => {
                            this._notificationService.success('Subject deleted successfully');
                            this.loadSubjects();
                        },
                        error: (error) => {
                            console.error('Error deleting subject:', error);
                            this._notificationService.error('Error deleting subject');
                        }
                    });
            }
        });
    }

    getSubjectTypeName(type: SubjectType | undefined): string {
        if (!type) return '-';
        const map: Record<number, string> = {
            1: 'Core', 2: 'Elective', 3: 'Optional', 4: 'Practical', 5: 'Theory',
            6: 'Lab', 7: 'Major', 8: 'Minor', 9: 'Seminar', 10: 'Project',
            11: 'Internship', 12: 'Test Prep', 13: 'Skill Based', 14: 'Workshop',
            15: 'Research', 16: 'Dissertation', 17: 'Thesis', 18: 'Field Work',
            19: 'Clinical', 20: 'Industrial', 21: 'Online', 22: 'Hybrid',
            23: 'Blended', 24: 'Self Study'
        };
        return map[type] || '-';
    }
}
