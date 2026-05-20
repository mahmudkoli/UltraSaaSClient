import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { Subject, takeUntil } from 'rxjs';
import { FeeInvoicesService } from '../../../core/fee-invoices/fee-invoices.service';
import { FeeCollectionReportDto, FeeDuesDto } from '../../../core/fee-invoices/fee-invoices.types';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'fee-reports',
    templateUrl: './fee-reports.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        CommonModule, FormsModule,
        MatButtonModule, MatButtonToggleModule, MatCardModule, MatFormFieldModule,
        MatIconModule, MatInputModule, MatProgressBarModule, MatTableModule, MatTabsModule,
    ],
})
export class FeeReportsComponent implements OnInit, OnDestroy {
    dues: FeeDuesDto[] = [];
    report?: FeeCollectionReportDto;
    loadingDues = false;
    loadingReport = false;
    overdueOnly = false;
    bucket: 'Day' | 'Month' = 'Day';
    from = new Date(Date.now() - 30 * 86_400_000).toISOString().slice(0, 10);
    to = new Date().toISOString().slice(0, 10);

    duesCols = ['studentName', 'className', 'invoiceCount', 'overdueCount', 'totalOverdue', 'totalOutstanding', 'oldestDueDate'];
    seriesCols = ['label', 'paidCount', 'collected'];

    private _destroyed$ = new Subject<void>();

    constructor(
        private _service: FeeInvoicesService,
        private _cdr: ChangeDetectorRef,
        private _notify: NotificationService,
    ) {}

    ngOnInit(): void { this.loadAll(); }

    ngOnDestroy(): void { this._destroyed$.next(); this._destroyed$.complete(); }

    loadAll(): void {
        this.loadDues();
        this.loadReport();
    }

    loadDues(): void {
        this.loadingDues = true;
        this._service.getDues({ overdueOnly: this.overdueOnly })
            .pipe(takeUntil(this._destroyed$))
            .subscribe({
                next: (rows) => {
                    this.dues = rows;
                    this.loadingDues = false;
                    this._cdr.markForCheck();
                },
                error: () => {
                    this.loadingDues = false;
                    this._cdr.markForCheck();
                    this._notify.error('Could not load dues.');
                },
            });
    }

    loadReport(): void {
        this.loadingReport = true;
        this._service.getCollectionReport({ from: this.from, to: this.to, bucket: this.bucket })
            .pipe(takeUntil(this._destroyed$))
            .subscribe({
                next: (r) => {
                    this.report = r;
                    this.loadingReport = false;
                    this._cdr.markForCheck();
                },
                error: () => {
                    this.loadingReport = false;
                    this._cdr.markForCheck();
                    this._notify.error('Could not load collection report.');
                },
            });
    }
}
