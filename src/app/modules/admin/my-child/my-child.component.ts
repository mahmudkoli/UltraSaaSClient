import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { Subject, takeUntil } from 'rxjs';
import { MyChildDashboardDto } from '../../../core/students/my-child.types';
import { StudentsService } from '../../../core/students/students.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'my-child',
    templateUrl: './my-child.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatIconModule, MatProgressBarModule, MatTableModule],
})
export class MyChildComponent implements OnInit, OnDestroy {
    data?: MyChildDashboardDto;
    loading = true;
    examCols = ['examName', 'subjectName', 'marks', 'percentage', 'grade', 'date'];
    sibCols = ['name', 'className'];
    private _destroyed$ = new Subject<void>();

    constructor(
        private _svc: StudentsService,
        private _cdr: ChangeDetectorRef,
        private _notify: NotificationService,
    ) {}

    ngOnInit(): void { this.load(); }
    ngOnDestroy(): void { this._destroyed$.next(); this._destroyed$.complete(); }

    load(): void {
        this.loading = true;
        this._svc.getMyChild().pipe(takeUntil(this._destroyed$)).subscribe({
            next: (d) => { this.data = d; this.loading = false; this._cdr.markForCheck(); },
            error: () => { this.loading = false; this._cdr.markForCheck(); this._notify.error('Could not load your dashboard. (Your account may not be linked to a student record.)'); },
        });
    }

    attendanceClass(): string {
        const p = this.data?.attendancePercent ?? 100;
        if (p >= 85) return 'text-emerald-700';
        if (p >= 70) return 'text-amber-700';
        return 'text-red-700';
    }

    feesClass(): string {
        if (!this.data) return 'text-gray-700';
        if (this.data.overdueInvoices > 0) return 'text-red-700';
        if (this.data.feesOutstanding > 0) return 'text-amber-700';
        return 'text-emerald-700';
    }
}
