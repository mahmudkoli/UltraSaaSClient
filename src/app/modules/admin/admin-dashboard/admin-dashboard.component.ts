import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AdminDashboardService } from '../../../core/billing/admin-dashboard.service';
import { AdminDashboardDto, DashboardPaymentRow, DashboardTenantRow } from '../../../core/billing/billing.types';
import { NotificationService } from '../../../core/services/notification.service';
import { RecordPaymentDialogComponent, RecordPaymentDialogData } from './record-payment-dialog.component';

@Component({
    selector: 'admin-dashboard',
    templateUrl: './admin-dashboard.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        MatButtonModule,
        MatDialogModule,
        MatIconModule,
        MatProgressBarModule,
        MatTableModule,
        MatTooltipModule,
    ],
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
    data?: AdminDashboardDto;
    loading = true;
    actionCols = ['name', 'planCode', 'validUpto', 'daysUntilExpiry', 'paymentStatus', 'actions'];
    paymentCols = ['paidOn', 'tenantName', 'amount', 'method'];
    signupCols = ['name', 'planCode', 'createdOn', 'validUpto'];
    private _destroyed$ = new Subject<void>();

    constructor(
        private _service: AdminDashboardService,
        private _dialog: MatDialog,
        private _cdr: ChangeDetectorRef,
        private _notify: NotificationService,
    ) {}

    ngOnInit(): void {
        this.load();
    }

    ngOnDestroy(): void {
        this._destroyed$.next();
        this._destroyed$.complete();
    }

    load(): void {
        this.loading = true;
        this._service.getDashboard().pipe(takeUntil(this._destroyed$)).subscribe({
            next: (d) => {
                this.data = d;
                this.loading = false;
                this._cdr.markForCheck();
            },
            error: () => {
                this.loading = false;
                this._cdr.markForCheck();
                this._notify.error('Could not load admin dashboard.');
            },
        });
    }

    momPercent(): number | null {
        if (!this.data || !this.data.collectedLastMonth) return null;
        return Math.round(((this.data.collectedThisMonth - this.data.collectedLastMonth) / this.data.collectedLastMonth) * 100);
    }

    openRecordPayment(row: DashboardTenantRow): void {
        const dlg = this._dialog.open<RecordPaymentDialogComponent, RecordPaymentDialogData>(
            RecordPaymentDialogComponent,
            {
                width: '720px',
                data: { tenantId: row.id, tenantName: row.name },
            }
        );
        dlg.afterClosed().pipe(takeUntil(this._destroyed$)).subscribe((req) => {
            if (!req) return;
            this._service.recordPayment(row.id, req).pipe(takeUntil(this._destroyed$)).subscribe({
                next: () => {
                    this._notify.success(`Payment recorded for ${row.name}.`);
                    this.load();
                },
                error: () => this._notify.error('Failed to record payment.'),
            });
        });
    }

    rowSeverity(row: DashboardTenantRow): string {
        if (!row.isSystemActive) return 'bg-red-50 dark:bg-red-900/20';
        if (row.daysUntilExpiry <= 0) return 'bg-red-50 dark:bg-red-900/20';
        if (row.daysUntilExpiry <= 3) return 'bg-amber-50 dark:bg-amber-900/20';
        return '';
    }

    paymentBadge(row: DashboardPaymentRow): string {
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
    }
}
