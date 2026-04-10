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
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { FeeStructureDetailsService } from '../../../core/fee-structure-details/fee-structure-details.service';
import { FeeStructureDetailDto } from '../../../core/fee-structure-details/fee-structure-details.types';
import { FeeStructuresService } from '../../../core/fee-structures/fee-structures.service';
import { FeeStructureDto } from '../../../core/fee-structures/fee-structures.types';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'fee-structure-detail-list',
    templateUrl: './fee-structure-detail-list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        CommonModule, FormsModule,
        MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule,
        MatPaginatorModule, MatProgressSpinnerModule, MatSelectModule, MatTableModule, MatTooltipModule
    ]
})
export class FeeStructureDetailListComponent implements OnInit, OnDestroy {
    @ViewChild(MatPaginator) paginator!: MatPaginator;

    items: FeeStructureDetailDto[] = [];
    feeStructures: FeeStructureDto[] = [];
    displayedColumns: string[] = ['feeStructureName', 'feeTypeName', 'amount', 'isActive', 'actions'];
    isLoading = false;
    totalCount = 0;
    pageSize = 10;
    pageIndex = 0;
    keyword = '';
    selectedFeeStructureId = '';

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    private _searchSubject: Subject<string> = new Subject<string>();

    constructor(
        private _service: FeeStructureDetailsService,
        private _feeStructuresService: FeeStructuresService,
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
        this.loadFeeStructures();
        this.loadData();
    }

    ngOnDestroy(): void { this._unsubscribeAll.next(null); this._unsubscribeAll.complete(); }

    loadFeeStructures(): void {
        this._feeStructuresService.search({ pageNumber: 1, pageSize: 200 })
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({ next: (r) => { this.feeStructures = r.data; this._cdr.markForCheck(); }, error: () => {} });
    }

    loadData(): void {
        this.isLoading = true;
        this._cdr.markForCheck();
        this._service.search({
            keyword: this.keyword || undefined,
            feeStructureId: this.selectedFeeStructureId || undefined,
            pageNumber: this.pageIndex + 1,
            pageSize: this.pageSize
        }).pipe(takeUntil(this._unsubscribeAll)).subscribe({
            next: (response) => {
                this.items = response.data;
                this.totalCount = response.totalCount;
                this.isLoading = false;
                this._cdr.markForCheck();
            },
            error: () => { this.isLoading = false; this._cdr.markForCheck(); this._notificationService.error('Error loading fee structure details'); }
        });
    }

    onSearch(value: string): void { this.keyword = value; this._searchSubject.next(value); }

    onFeeStructureFilter(): void { this.pageIndex = 0; this.loadData(); }

    onPageChange(event: any): void {
        this.pageIndex = event.pageIndex;
        this.pageSize = event.pageSize;
        this.loadData();
    }

    create(): void { this._router.navigate(['/fee-structure-details', 'create']); }
    edit(item: FeeStructureDetailDto): void { this._router.navigate(['/fee-structure-details', item.id, 'edit']); }

    delete(item: FeeStructureDetailDto): void {
        const dialogRef = this._fuseConfirmationService.open({
            title: 'Delete Fee Line Item',
            message: `Are you sure you want to delete <b>${item.feeTypeName}</b> from <b>${item.feeStructureName}</b>?`,
            icon: { show: true, name: 'heroicons_outline:exclamation-triangle', color: 'warn' },
            actions: { confirm: { show: true, label: 'Delete', color: 'warn' }, cancel: { show: true, label: 'Cancel' } }
        });
        dialogRef.afterClosed().pipe(takeUntil(this._unsubscribeAll)).subscribe(result => {
            if (result === 'confirmed') {
                this._service.delete(item.id).pipe(takeUntil(this._unsubscribeAll)).subscribe({
                    next: () => { this._notificationService.success('Fee line item deleted'); this.loadData(); },
                    error: () => { this._notificationService.error('Error deleting fee line item'); }
                });
            }
        });
    }
}
