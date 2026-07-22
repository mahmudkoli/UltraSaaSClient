import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { ListPageComponent } from '../../../shared/components/list-page.component';
import { PayrollRunsService } from '../../../core/payroll-runs/payroll-runs.service';
import { PayrollRunDto } from '../../../core/payroll-runs/payroll-runs.types';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'payroll-runs-list',
    templateUrl: './payroll-runs-list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule, RouterModule, ListPageComponent,
        MatButtonModule, MatFormFieldModule, MatIconModule, MatProgressBarModule,
        MatSelectModule, MatTableModule, MatTooltipModule,
    ],
})
export class PayrollRunsListComponent implements OnInit, OnDestroy {
    runs: PayrollRunDto[] = [];
    isLoading = false;
    isGenerating = false;
    displayedColumns = ['period', 'status', 'employees', 'gross', 'net', 'actions'];

    now = new Date();
    monthControl = new FormControl(this.now.getMonth() + 1);
    yearControl = new FormControl(this.now.getFullYear());
    months = [
        { v: 1, n: 'January' }, { v: 2, n: 'February' }, { v: 3, n: 'March' }, { v: 4, n: 'April' },
        { v: 5, n: 'May' }, { v: 6, n: 'June' }, { v: 7, n: 'July' }, { v: 8, n: 'August' },
        { v: 9, n: 'September' }, { v: 10, n: 'October' }, { v: 11, n: 'November' }, { v: 12, n: 'December' },
    ];
    years: number[] = [];

    private _unsubscribeAll = new Subject<any>();

    constructor(
        private _service: PayrollRunsService,
        private _cdr: ChangeDetectorRef,
        private _router: Router,
        private _route: ActivatedRoute,
        private _confirm: FuseConfirmationService,
        private _notification: NotificationService,
    ) {
        const y = this.now.getFullYear();
        this.years = [y + 1, y, y - 1, y - 2];
    }

    ngOnInit(): void { this.load(); }
    ngOnDestroy(): void { this._unsubscribeAll.next(null); this._unsubscribeAll.complete(); }

    monthName(m: number): string { return this.months.find(x => x.v === m)?.n || `${m}`; }

    load(): void {
        this.isLoading = true;
        this._cdr.markForCheck();
        this._service.list().pipe(takeUntil(this._unsubscribeAll)).subscribe({
            next: (runs) => { this.runs = runs || []; this.isLoading = false; this._cdr.markForCheck(); },
            error: () => { this._notification.error('Failed to load payroll runs'); this.isLoading = false; this._cdr.markForCheck(); },
        });
    }

    generate(): void {
        this.isGenerating = true;
        this._cdr.markForCheck();
        this._service.generate({ year: +this.yearControl.value!, month: +this.monthControl.value! })
            .pipe(takeUntil(this._unsubscribeAll)).subscribe({
                next: (id) => {
                    this.isGenerating = false;
                    this._notification.success('Payroll generated');
                    this._router.navigate([id.replace(/"/g, '')], { relativeTo: this._route });
                },
                error: (err) => {
                    this.isGenerating = false; this._cdr.markForCheck();
                    this._notification.error(err?.error?.detail || err?.error?.title || 'Failed to generate payroll');
                },
            });
    }

    view(run: PayrollRunDto): void {
        this._router.navigate([run.id], { relativeTo: this._route });
    }

    remove(run: PayrollRunDto): void {
        const c = this._confirm.open({
            title: 'Delete Draft Payroll',
            message: `Delete the ${this.monthName(run.periodMonth)} ${run.periodYear} draft run?`,
            actions: { confirm: { label: 'Delete' } },
        });
        c.afterClosed().subscribe((r) => {
            if (r === 'confirmed') {
                this._service.delete(run.id).pipe(takeUntil(this._unsubscribeAll)).subscribe({
                    next: () => { this._notification.success('Draft deleted'); this.load(); },
                    error: () => this._notification.error('Failed to delete run'),
                });
            }
        });
    }
}
