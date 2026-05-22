import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { StudentTransportDto, StudentTransportsService } from '../../../core/transport/transport.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ListPageComponent } from '../../../shared/components/list-page.component';
import { TenantCurrencyPipe } from '../../../shared/pipes/currency.pipe';

@Component({
    selector: 'assignments-list',
    templateUrl: './assignments-list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CommonModule, DatePipe, ReactiveFormsModule, RouterModule, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, MatPaginatorModule, MatProgressBarModule, MatTableModule, MatTooltipModule, ListPageComponent, TenantCurrencyPipe],
})
export class AssignmentsListComponent implements OnInit, OnDestroy {
    rows: StudentTransportDto[] = [];
    total = 0; pageIndex = 0; pageSize = 25; loading = false;
    search = new FormControl('');
    cols = ['startDate', 'student', 'route', 'pickup', 'monthlyFee', 'status', 'actions'];
    private _destroyed$ = new Subject<void>();

    statusLabel(s: number): string {
        const map: Record<number, string> = { 1: 'Active', 2: 'Suspended', 3: 'Ended' };
        return map[s] || `S${s}`;
    }

    constructor(private _svc: StudentTransportsService, private _cdr: ChangeDetectorRef, private _router: Router, private _notify: NotificationService) {}
    ngOnInit(): void {
        this.search.valueChanges.pipe(takeUntil(this._destroyed$), debounceTime(300), distinctUntilChanged())
            .subscribe(() => { this.pageIndex = 0; this.load(); });
        this.load();
    }
    ngOnDestroy(): void { this._destroyed$.next(); this._destroyed$.complete(); }

    load(): void {
        this.loading = true;
        this._svc.search({ pageNumber: this.pageIndex + 1, pageSize: this.pageSize, keyword: this.search.value || undefined })
            .pipe(takeUntil(this._destroyed$)).subscribe({
                next: (r) => { this.rows = r.data; this.total = r.totalCount; this.loading = false; this._cdr.markForCheck(); },
                error: () => { this.loading = false; this._cdr.markForCheck(); this._notify.error('Could not load assignments.'); },
            });
    }

    onPage(e: PageEvent): void { this.pageIndex = e.pageIndex; this.pageSize = e.pageSize; this.load(); }
    add(): void { this._router.navigate(['/transport/assignments/create']); }
    edit(r: StudentTransportDto): void { this._router.navigate(['/transport/assignments', r.id, 'edit']); }
}
