import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { Subject, takeUntil } from 'rxjs';
import { AuditTrailDto, AuditTrailService, PaginationResponse } from '../../../core/audit-trail/audit-trail.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'audit-trail',
    templateUrl: './audit-trail.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule, DatePipe,
        MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule,
        MatPaginatorModule, MatProgressBarModule, MatSelectModule, MatTableModule,
    ],
})
export class AuditTrailComponent implements OnInit, OnDestroy {
    rows: AuditTrailDto[] = [];
    tables: string[] = [];
    isLoading = false;
    totalCount = 0;
    pageIndex = 0;
    pageSize = 25;
    pageSizeOptions = [10, 25, 50, 100];
    form: FormGroup;
    expandedId: string | null = null;
    cols = ['dateTime', 'type', 'tableName', 'primaryKey', 'userId', 'actions'];
    private _destroyed$ = new Subject<void>();

    constructor(
        private _svc: AuditTrailService,
        private _fb: FormBuilder,
        private _cdr: ChangeDetectorRef,
        private _notify: NotificationService,
    ) {
        this.form = this._fb.group({
            tableName: [''],
            type: [''],
            userId: [''],
            fromDate: [''],
            toDate: [''],
        });
    }

    ngOnInit(): void {
        this._svc.listTables().pipe(takeUntil(this._destroyed$)).subscribe({
            next: (t) => { this.tables = t; this._cdr.markForCheck(); },
            error: () => {},
        });
        this.load();
    }

    ngOnDestroy(): void { this._destroyed$.next(); this._destroyed$.complete(); }

    load(): void {
        this.isLoading = true;
        this._cdr.markForCheck();
        const v = this.form.value;
        this._svc.search({
            pageNumber: this.pageIndex + 1,
            pageSize: this.pageSize,
            tableName: v.tableName || undefined,
            type: v.type || undefined,
            userId: v.userId || undefined,
            fromDate: v.fromDate || undefined,
            toDate: v.toDate || undefined,
        }).pipe(takeUntil(this._destroyed$)).subscribe({
            next: (res: PaginationResponse<AuditTrailDto>) => {
                this.rows = res.data;
                this.totalCount = res.totalCount;
                this.isLoading = false;
                this._cdr.markForCheck();
            },
            error: () => { this.isLoading = false; this._cdr.markForCheck(); this._notify.error('Failed to load audit trail.'); },
        });
    }

    onFilter(): void { this.pageIndex = 0; this.load(); }
    onClear(): void { this.form.reset({ tableName: '', type: '', userId: '', fromDate: '', toDate: '' }); this.onFilter(); }
    onPage(e: PageEvent): void { this.pageIndex = e.pageIndex; this.pageSize = e.pageSize; this.load(); }

    toggleExpand(id: string): void { this.expandedId = this.expandedId === id ? null : id; }

    typeClass(t?: string): string {
        switch (t) {
            case 'Create': return 'bg-green-100 text-green-800';
            case 'Update': return 'bg-blue-100 text-blue-800';
            case 'Delete': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }

    short(s?: string, n = 80): string {
        if (!s) return '—';
        return s.length > n ? s.slice(0, n) + '…' : s;
    }
}
