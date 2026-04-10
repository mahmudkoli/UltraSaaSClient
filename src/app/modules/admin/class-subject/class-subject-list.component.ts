import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { ClassSubjectsService } from '../../../core/class-subjects/class-subjects.service';
import { ClassSubjectDto } from '../../../core/class-subjects/class-subjects.types';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'class-subject-list',
    templateUrl: './class-subject-list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        CommonModule, FormsModule,
        MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule,
        MatPaginatorModule, MatProgressSpinnerModule, MatTableModule, MatTooltipModule
    ]
})
export class ClassSubjectListComponent implements OnInit, OnDestroy {
    @ViewChild(MatPaginator) paginator!: MatPaginator;

    items: ClassSubjectDto[] = [];
    displayedColumns: string[] = ['className', 'subjectName', 'teacherName', 'weeklyHours', 'isActive', 'actions'];
    isLoading = false;
    totalCount = 0;
    pageSize = 10;
    pageIndex = 0;
    keyword = '';

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    private _searchSubject: Subject<string> = new Subject<string>();

    constructor(
        private _service: ClassSubjectsService,
        private _router: Router,
        private _cdr: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _notificationService: NotificationService
    ) {}

    ngOnInit(): void {
        this._searchSubject.pipe(debounceTime(300), takeUntil(this._unsubscribeAll)).subscribe(() => {
            this.pageIndex = 0;
            this.loadData();
        });
        this.loadData();
    }

    ngOnDestroy(): void { this._unsubscribeAll.next(null); this._unsubscribeAll.complete(); }

    loadData(): void {
        this.isLoading = true;
        this._cdr.markForCheck();
        this._service.search({ keyword: this.keyword || undefined, pageNumber: this.pageIndex + 1, pageSize: this.pageSize })
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (response) => {
                    this.items = response.data;
                    this.totalCount = response.totalCount;
                    this.isLoading = false;
                    this._cdr.markForCheck();
                },
                error: () => { this.isLoading = false; this._cdr.markForCheck(); this._notificationService.error('Error loading class subjects'); }
            });
    }

    onSearch(value: string): void { this.keyword = value; this._searchSubject.next(value); }

    onPageChange(event: any): void {
        this.pageIndex = event.pageIndex;
        this.pageSize = event.pageSize;
        this.loadData();
    }

    create(): void { this._router.navigate(['/class-subjects', 'create']); }
    edit(item: ClassSubjectDto): void { this._router.navigate(['/class-subjects', item.id, 'edit']); }

    delete(item: ClassSubjectDto): void {
        const dialogRef = this._fuseConfirmationService.open({
            title: 'Delete Class-Subject',
            message: `Are you sure you want to delete the assignment of <b>${item.subjectName}</b> to <b>${item.className}</b>?`,
            icon: { show: true, name: 'heroicons_outline:exclamation-triangle', color: 'warn' },
            actions: { confirm: { show: true, label: 'Delete', color: 'warn' }, cancel: { show: true, label: 'Cancel' } }
        });
        dialogRef.afterClosed().pipe(takeUntil(this._unsubscribeAll)).subscribe(result => {
            if (result === 'confirmed') {
                this._service.delete(item.id).pipe(takeUntil(this._unsubscribeAll)).subscribe({
                    next: () => { this._notificationService.success('Class-Subject deleted'); this.loadData(); },
                    error: () => { this._notificationService.error('Error deleting class-subject'); }
                });
            }
        });
    }
}
