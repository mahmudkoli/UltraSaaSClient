import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { PayrollService } from '../../../core/payroll/payroll.service';
import { PayrollSlipDto } from '../../../core/payroll/payroll.types';
import { NotificationService } from '../../../core/services/notification.service';
import { ListPageComponent } from '../../../shared/components/list-page.component';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'payroll-list',
    templateUrl: './payroll-list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule, MatProgressBarModule, MatTableModule, MatTooltipModule, ListPageComponent],
})
export class PayrollListComponent implements OnInit, OnDestroy {
    slips: PayrollSlipDto[] = [];
    loading = false;
    cols = ['serialNumber', 'teacherName', 'period', 'gross', 'deductions', 'net', 'actions'];
    private _destroyed$ = new Subject<void>();

    constructor(
        private _svc: PayrollService,
        private _cdr: ChangeDetectorRef,
        private _notify: NotificationService,
    ) {}

    ngOnInit(): void { this.load(); }
    ngOnDestroy(): void { this._destroyed$.next(); this._destroyed$.complete(); }

    load(): void {
        this.loading = true;
        this._svc.search({ pageNumber: 1, pageSize: 100 }).pipe(takeUntil(this._destroyed$)).subscribe({
            next: (resp) => { this.slips = resp.data; this.loading = false; this._cdr.markForCheck(); },
            error: () => { this.loading = false; this._cdr.markForCheck(); this._notify.error('Could not load payroll slips.'); },
        });
    }

    period(s: PayrollSlipDto): string {
        const m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        return `${m[s.periodMonth - 1]} ${s.periodYear}`;
    }

    download(s: PayrollSlipDto): void {
        this._svc.downloadPdf(s.id).pipe(takeUntil(this._destroyed$)).subscribe({
            next: (blob) => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${s.serialNumber}.pdf`;
                a.click();
                window.URL.revokeObjectURL(url);
            },
            error: () => this._notify.error('Could not download payslip.'),
        });
    }
}
