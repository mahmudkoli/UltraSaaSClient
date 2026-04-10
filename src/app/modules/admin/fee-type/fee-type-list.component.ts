import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { FeeTypesService } from '../../../core/fee-types/fee-types.service';
import { FeeTypeDto, FeeCategory, FeeFrequency, SearchFeeTypesRequest, PaginationResponse } from '../../../core/fee-types/fee-types.types';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'fee-type-list',
    templateUrl: './fee-type-list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations,
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule, RouterModule,
        MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule,
        MatPaginatorModule, MatTableModule, MatTooltipModule,
    ],
})
export class FeeTypeListComponent implements OnInit, OnDestroy {
    feeTypes: FeeTypeDto[] = [];
    isLoading = false;
    totalCount = 0;
    currentPage = 0;
    pageSize = 10;
    pageSizeOptions = [5, 10, 25, 50];
    searchControl = new FormControl('');
    displayedColumns: string[] = ['name', 'code', 'category', 'frequency', 'defaultAmount', 'status', 'actions'];
    Math = Math;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _service: FeeTypesService,
        private _cdr: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _router: Router,
        private _route: ActivatedRoute,
        private _notificationService: NotificationService
    ) {}

    ngOnInit(): void {
        this.searchControl.valueChanges
            .pipe(takeUntil(this._unsubscribeAll), debounceTime(300), distinctUntilChanged())
            .subscribe(() => { this.currentPage = 0; this.loadData(); });
        this.loadData();
    }

    ngOnDestroy(): void { this._unsubscribeAll.next(null); this._unsubscribeAll.complete(); }

    loadData(): void {
        this.isLoading = true;
        this._cdr.markForCheck();
        const request: SearchFeeTypesRequest = {
            pageNumber: this.currentPage + 1,
            pageSize: this.pageSize,
            keyword: this.searchControl.value || undefined
        };
        this._service.search(request).pipe(takeUntil(this._unsubscribeAll)).subscribe({
            next: (response: PaginationResponse<FeeTypeDto>) => {
                this.feeTypes = response.data;
                this.totalCount = response.totalCount;
                this.currentPage = response.currentPage - 1;
                this.isLoading = false;
                this._cdr.markForCheck();
            },
            error: () => { this.isLoading = false; this._cdr.markForCheck(); this._notificationService.error('Error loading fee types'); }
        });
    }

    onPageChange(event: PageEvent): void { this.currentPage = event.pageIndex; this.pageSize = event.pageSize; this.loadData(); }
    add(): void { this._router.navigate(['create'], { relativeTo: this._route }); }
    edit(item: FeeTypeDto): void { this._router.navigate([item.id, 'edit'], { relativeTo: this._route }); }

    deleteItem(item: FeeTypeDto): void {
        const dialogRef = this._fuseConfirmationService.open({
            title: 'Delete Fee Type',
            message: `Delete fee type "${item.name}"?`,
            icon: { show: true, name: 'heroicons_outline:exclamation-triangle', color: 'warn' },
            actions: { confirm: { show: true, label: 'Delete', color: 'warn' }, cancel: { show: true, label: 'Cancel' } },
            dismissible: false
        });
        dialogRef.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this._service.delete(item.id).pipe(takeUntil(this._unsubscribeAll)).subscribe({
                    next: () => { this._notificationService.success('Fee type deleted'); this.loadData(); },
                    error: () => this._notificationService.error('Error deleting fee type')
                });
            }
        });
    }

    getCategoryName(cat: FeeCategory): string {
        const map: Record<number, string> = {
            1: 'Tuition', 2: 'Registration', 3: 'Admission', 4: 'Examination', 5: 'Library',
            6: 'Laboratory', 7: 'Development', 8: 'Security', 9: 'Caution', 10: 'Transport',
            11: 'Hostel', 12: 'Sports', 13: 'Cultural', 14: 'Equipment', 15: 'Material',
            16: 'Seminar', 17: 'Project', 18: 'Thesis', 19: 'Course Fee', 20: 'Mock Test Fee',
            21: 'Study Material', 22: 'Workshop', 23: 'Certification', 24: 'Technology',
            25: 'Infrastructure', 26: 'Maintenance', 27: 'Insurance', 28: 'Medical',
            29: 'Counseling', 30: 'Career', 31: 'Placement', 32: 'Alumni', 33: 'International',
            34: 'Exchange', 35: 'Research', 36: 'Publication', 37: 'Conference', 38: 'Travel',
            39: 'Accommodation', 40: 'Meal', 41: 'Uniform', 99: 'Other'
        };
        return map[cat] || '-';
    }

    getFrequencyName(freq: FeeFrequency): string {
        const map: Record<number, string> = {
            1: 'One-Time', 2: 'Monthly', 3: 'Quarterly', 4: 'Semi-Annually', 5: 'Annually',
            6: 'Per Session', 7: 'Per Course', 8: 'Per Semester', 9: 'Per Trimester',
            10: 'Weekly', 11: 'Daily'
        };
        return map[freq] || '-';
    }
}
