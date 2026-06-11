import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { Subject, takeUntil } from 'rxjs';
import { SMSLogDto, SMSLogsService } from '../../../core/comms/sms-logs.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ListPageComponent } from '../../../shared/components/list-page.component';

@Component({
    selector: 'sms-logs',
    templateUrl: './sms-logs.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CommonModule, DatePipe, MatIconModule, MatPaginatorModule, MatProgressBarModule, MatTableModule, ListPageComponent],
})
export class SmsLogsComponent implements OnInit, OnDestroy {
    rows: SMSLogDto[] = [];
    total = 0;
    pageIndex = 0;
    pageSize = 25;
    loading = false;
    cols = ['to', 'schedule', 'status'];
    private _destroyed$ = new Subject<void>();

    constructor(private _svc: SMSLogsService, private _cdr: ChangeDetectorRef, private _notify: NotificationService) {}
    ngOnInit(): void { this.load(); }
    ngOnDestroy(): void { this._destroyed$.next(); this._destroyed$.complete(); }

    load(): void {
        this.loading = true;
        this._svc.search({ pageNumber: this.pageIndex + 1, pageSize: this.pageSize }).pipe(takeUntil(this._destroyed$)).subscribe({
            next: (r) => { this.rows = r.data; this.total = r.totalCount; this.loading = false; this._cdr.markForCheck(); },
            error: () => { this.loading = false; this._cdr.markForCheck(); this._notify.error('Could not load SMS logs.'); },
        });
    }

    onPage(e: PageEvent): void { this.pageIndex = e.pageIndex; this.pageSize = e.pageSize; this.load(); }
    truncate(s: string, n = 80): string { return s && s.length > n ? s.slice(0, n) + '…' : s; }
}
