import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { ListPageComponent } from '../../../shared/components/list-page.component';
import { PayrollRunsService } from '../../../core/payroll-runs/payroll-runs.service';
import { PayrollRunDto } from '../../../core/payroll-runs/payroll-runs.types';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'payroll-run-detail',
    templateUrl: './payroll-run-detail.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        CommonModule, ListPageComponent, MatButtonModule, MatIconModule,
        MatProgressBarModule, MatTableModule, MatTooltipModule,
    ],
})
export class PayrollRunDetailComponent implements OnInit, OnDestroy {
    run?: PayrollRunDto;
    isLoading = false;
    isBusy = false;
    displayedColumns = ['employee', 'basic', 'allowances', 'pf', 'tax', 'otherDed', 'gross', 'net', 'days', 'pdf'];
    months = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    private _id!: string;
    private _unsubscribeAll = new Subject<any>();

    constructor(
        private _service: PayrollRunsService,
        private _cdr: ChangeDetectorRef,
        private _router: Router,
        private _route: ActivatedRoute,
        private _confirm: FuseConfirmationService,
        private _notification: NotificationService,
    ) {}

    ngOnInit(): void {
        this._id = this._route.snapshot.paramMap.get('id')!;
        this.load();
    }
    ngOnDestroy(): void { this._unsubscribeAll.next(null); this._unsubscribeAll.complete(); }

    get hasPlaceholder(): boolean {
        return (this.run?.slips || []).some(s => (s.remarks || '').includes('PLACEHOLDER'));
    }

    load(): void {
        this.isLoading = true;
        this._cdr.markForCheck();
        this._service.getById(this._id).pipe(takeUntil(this._unsubscribeAll)).subscribe({
            next: (run) => { this.run = run; this.isLoading = false; this._cdr.markForCheck(); },
            error: () => { this._notification.error('Failed to load run'); this.isLoading = false; this._cdr.markForCheck(); },
        });
    }

    finalise(): void {
        const c = this._confirm.open({
            title: 'Finalise Payroll',
            message: 'Finalising freezes this run and locks the period\'s attendance. This cannot be undone. Continue?',
            actions: { confirm: { label: 'Finalise' } },
        });
        c.afterClosed().subscribe((r) => {
            if (r !== 'confirmed') return;
            this.isBusy = true; this._cdr.markForCheck();
            this._service.finalise(this._id).pipe(takeUntil(this._unsubscribeAll)).subscribe({
                next: () => { this.isBusy = false; this._notification.success('Payroll finalised'); this.load(); },
                error: () => { this.isBusy = false; this._cdr.markForCheck(); this._notification.error('Failed to finalise'); },
            });
        });
    }

    regenerate(): void {
        if (!this.run) return;
        this.isBusy = true; this._cdr.markForCheck();
        this._service.generate({ year: this.run.periodYear, month: this.run.periodMonth })
            .pipe(takeUntil(this._unsubscribeAll)).subscribe({
                next: () => { this.isBusy = false; this._notification.success('Payroll regenerated'); this.load(); },
                error: () => { this.isBusy = false; this._cdr.markForCheck(); this._notification.error('Failed to regenerate'); },
            });
    }

    remove(): void {
        const c = this._confirm.open({
            title: 'Delete Draft', message: 'Delete this draft payroll run?',
            actions: { confirm: { label: 'Delete' } },
        });
        c.afterClosed().subscribe((r) => {
            if (r !== 'confirmed') return;
            this._service.delete(this._id).pipe(takeUntil(this._unsubscribeAll)).subscribe({
                next: () => { this._notification.success('Draft deleted'); this.back(); },
                error: () => this._notification.error('Failed to delete'),
            });
        });
    }

    downloadSlip(slip: { id: string; employeeName: string }): void {
        this._service.payslipPdf(slip.id).pipe(takeUntil(this._unsubscribeAll)).subscribe({
            next: (blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `PaySlip-${slip.employeeName}-${this.run?.periodYear}-${this.run?.periodMonth}.pdf`;
                a.click();
                URL.revokeObjectURL(url);
            },
            error: () => this._notification.error('Failed to download payslip'),
        });
    }

    back(): void { this._router.navigate(['/payroll-runs']); }
}
