import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { Router, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { LeavesService } from '../../../core/leaves/leaves.service';
import { LeaveDto, LeaveStatus } from '../../../core/leaves/leaves.types';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'leave-list',
    templateUrl: './leave-list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CommonModule, RouterLink, MatButtonModule, MatChipsModule, MatIconModule, MatProgressBarModule, MatTableModule],
})
export class LeaveListComponent implements OnInit, OnDestroy {
    leaves: LeaveDto[] = [];
    loading = false;
    cols = ['teacherName', 'type', 'dates', 'days', 'reason', 'status', 'decision', 'actions'];
    private _destroyed$ = new Subject<void>();

    constructor(
        private _svc: LeavesService,
        private _cdr: ChangeDetectorRef,
        private _router: Router,
        private _confirm: FuseConfirmationService,
        private _notify: NotificationService,
    ) {}

    ngOnInit(): void { this.load(); }
    ngOnDestroy(): void { this._destroyed$.next(); this._destroyed$.complete(); }

    load(): void {
        this.loading = true;
        this._svc.search({ pageNumber: 1, pageSize: 100 }).pipe(takeUntil(this._destroyed$)).subscribe({
            next: (resp) => {
                this.leaves = resp.data;
                this.loading = false;
                this._cdr.markForCheck();
            },
            error: () => {
                this.loading = false;
                this._cdr.markForCheck();
                this._notify.error('Could not load leaves.');
            },
        });
    }

    statusClass(s: LeaveStatus): string {
        switch (s) {
            case 'Approved': return 'bg-emerald-100 text-emerald-800';
            case 'Rejected': return 'bg-red-100 text-red-800';
            case 'Cancelled': return 'bg-gray-200 text-gray-700';
            default: return 'bg-amber-100 text-amber-800';
        }
    }

    decide(row: LeaveDto, action: 'approve' | 'reject'): void {
        const ref = this._confirm.open({
            title: action === 'approve' ? 'Approve Leave' : 'Reject Leave',
            message: `${action === 'approve' ? 'Approve' : 'Reject'} ${row.teacherName}'s ${row.type} leave (${row.days} day${row.days > 1 ? 's' : ''})?`,
            actions: { confirm: { show: true, label: action === 'approve' ? 'Approve' : 'Reject', color: action === 'approve' ? 'primary' : 'warn' }, cancel: { show: true, label: 'Cancel' } },
            icon: { show: true, name: action === 'approve' ? 'heroicons_outline:check-badge' : 'heroicons_outline:x-circle', color: action === 'approve' ? 'success' : 'warn' },
            dismissible: true,
        });
        ref.afterClosed().pipe(takeUntil(this._destroyed$)).subscribe((r) => {
            if (r !== 'confirmed') return;
            const obs = action === 'approve' ? this._svc.approve(row.id) : this._svc.reject(row.id);
            obs.pipe(takeUntil(this._destroyed$)).subscribe({
                next: () => { this._notify.success('Decision saved.'); this.load(); },
                error: () => this._notify.error('Decision failed.'),
            });
        });
    }

    cancel(row: LeaveDto): void {
        this._svc.cancel(row.id).pipe(takeUntil(this._destroyed$)).subscribe({
            next: () => { this._notify.success('Leave cancelled.'); this.load(); },
            error: () => this._notify.error('Cancel failed.'),
        });
    }
}
