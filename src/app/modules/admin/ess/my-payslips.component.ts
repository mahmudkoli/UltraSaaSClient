import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ListPageComponent } from '../../../shared/components/list-page.component';
import { EssService } from '../../../core/ess/ess.service';
import { MyPayslipDto } from '../../../core/ess/ess.types';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'my-payslips',
    templateUrl: './my-payslips.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CommonModule, ListPageComponent, MatButtonModule, MatIconModule, MatProgressBarModule, MatTableModule, MatTooltipModule],
})
export class MyPayslipsComponent implements OnInit, OnDestroy {
    items: MyPayslipDto[] = [];
    isLoading = false;
    displayedColumns = ['period', 'gross', 'deductions', 'net', 'pdf'];
    months = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    private _unsubscribeAll = new Subject<any>();

    constructor(private _ess: EssService, private _cdr: ChangeDetectorRef, private _notification: NotificationService) {}

    ngOnInit(): void {
        this.isLoading = true; this._cdr.markForCheck();
        this._ess.payslips().pipe(takeUntil(this._unsubscribeAll)).subscribe({
            next: (r) => { this.items = r || []; this.isLoading = false; this._cdr.markForCheck(); },
            error: () => { this._notification.error('Failed to load payslips'); this.isLoading = false; this._cdr.markForCheck(); },
        });
    }
    ngOnDestroy(): void { this._unsubscribeAll.next(null); this._unsubscribeAll.complete(); }

    download(s: MyPayslipDto): void {
        this._ess.payslipPdf(s.id).pipe(takeUntil(this._unsubscribeAll)).subscribe({
            next: (blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = `PaySlip-${s.serialNumber}.pdf`; a.click();
                URL.revokeObjectURL(url);
            },
            error: () => this._notification.error('Failed to download payslip'),
        });
    }
}
