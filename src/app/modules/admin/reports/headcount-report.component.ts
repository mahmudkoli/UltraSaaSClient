import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ListPageComponent } from '../../../shared/components/list-page.component';
import { ReportsService } from '../../../core/reports/reports.service';
import { HeadcountReportDto } from '../../../core/reports/reports.types';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'headcount-report',
    templateUrl: './headcount-report.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CommonModule, ListPageComponent, MatIconModule, MatProgressBarModule],
})
export class HeadcountReportComponent implements OnInit, OnDestroy {
    report?: HeadcountReportDto;
    isLoading = false;

    private _unsubscribeAll = new Subject<any>();

    constructor(private _reports: ReportsService, private _cdr: ChangeDetectorRef, private _notification: NotificationService) {}

    ngOnInit(): void {
        this.isLoading = true; this._cdr.markForCheck();
        this._reports.headcount().pipe(takeUntil(this._unsubscribeAll)).subscribe({
            next: (r) => { this.report = r; this.isLoading = false; this._cdr.markForCheck(); },
            error: () => { this._notification.error('Failed to load headcount'); this.isLoading = false; this._cdr.markForCheck(); },
        });
    }
    ngOnDestroy(): void { this._unsubscribeAll.next(null); this._unsubscribeAll.complete(); }

    pct(count: number): number {
        const total = this.report?.total || 0;
        return total > 0 ? Math.round((count / total) * 100) : 0;
    }
}
