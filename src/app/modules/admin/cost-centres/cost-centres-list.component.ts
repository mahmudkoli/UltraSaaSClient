import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { ListPageComponent } from '../../../shared/components/list-page.component';
import { CostCentresService } from '../../../core/cost-centres/cost-centres.service';
import { CostCentreDto } from '../../../core/cost-centres/cost-centres.types';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'cost-centres-list',
    templateUrl: './cost-centres-list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule, RouterModule, ListPageComponent,
        MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule,
        MatPaginatorModule, MatProgressBarModule, MatTableModule, MatTooltipModule,
    ],
})
export class CostCentresListComponent implements OnInit, OnDestroy {
    items: CostCentreDto[] = [];
    isLoading = false;
    totalCount = 0;
    currentPage = 0;
    pageSize = 10;
    pageSizeOptions = [5, 10, 25, 50];
    searchControl = new FormControl('');
    displayedColumns = ['name', 'code', 'description', 'status', 'actions'];
    Math = Math;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _service: CostCentresService,
        private _fuseConfirmationService: FuseConfirmationService,
        private _notificationService: NotificationService,
    ) {}

    ngOnInit(): void {
        this.load();
        this.searchControl.valueChanges
            .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this._unsubscribeAll))
            .subscribe(() => { this.currentPage = 0; this.load(); });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    load(): void {
        this.isLoading = true;
        this._changeDetectorRef.markForCheck();
        this._service.search({
            pageNumber: this.currentPage + 1,
            pageSize: this.pageSize,
            name: this.searchControl.value || undefined,
            orderBy: ['name'],
        }).pipe(takeUntil(this._unsubscribeAll)).subscribe({
            next: (response) => {
                this.items = response.data || [];
                this.totalCount = response.totalCount || 0;
                this.isLoading = false;
                this._changeDetectorRef.markForCheck();
            },
            error: () => {
                this._notificationService.error('Failed to load cost centres');
                this.isLoading = false;
                this._changeDetectorRef.markForCheck();
            },
        });
    }

    onPageChange(event: PageEvent): void {
        this.currentPage = event.pageIndex;
        this.pageSize = event.pageSize;
        this.load();
    }

    create(): void {
        this._router.navigate(['create'], { relativeTo: this._activatedRoute });
    }

    edit(item: CostCentreDto): void {
        this._router.navigate(['edit', item.id], { relativeTo: this._activatedRoute });
    }

    remove(item: CostCentreDto): void {
        const confirmation = this._fuseConfirmationService.open({
            title: 'Delete Cost Centre',
            message: `Are you sure you want to delete "${item.name}"?`,
            actions: { confirm: { label: 'Delete' } },
        });
        confirmation.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this._service.delete(item.id).pipe(takeUntil(this._unsubscribeAll)).subscribe({
                    next: () => { this._notificationService.success('Cost centre deleted'); this.load(); },
                    error: () => this._notificationService.error('Failed to delete cost centre'),
                });
            }
        });
    }
}
