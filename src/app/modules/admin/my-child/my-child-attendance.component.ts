import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterLink } from '@angular/router';
import { StudentsService } from '../../../core/students/students.service';
import { StudentAttendanceRow } from '../../../core/students/my-child.types';
import { NotificationService } from '../../../core/services/notification.service';
import { ListPageComponent } from '../../../shared/components/list-page.component';
import { attendanceClass, attendanceLabel } from './my-child.display';

@Component({
    selector: 'my-child-attendance',
    standalone: true,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, FormsModule, MatIconModule, MatProgressBarModule, RouterLink, ListPageComponent],
    template: `
<app-list-page title="My Attendance" subtitle="Your day-by-day attendance record."
    icon="event_available" iconGradient="from-emerald-500 to-teal-600"
    pageGradient="from-gray-50 via-emerald-50/30 to-teal-50/30">
    <ng-container pageActions>
        <a routerLink="/my-profile" class="inline-flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-primary">
            <mat-icon class="icon-size-5 mr-1">arrow_back</mat-icon> Back to dashboard
        </a>
    </ng-container>

    <div class="flex flex-wrap items-end gap-3 mb-4">
        <div class="flex flex-col">
            <label class="text-xs text-gray-500 mb-1">From</label>
            <input type="date" [(ngModel)]="from" class="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm">
        </div>
        <div class="flex flex-col">
            <label class="text-xs text-gray-500 mb-1">To</label>
            <input type="date" [(ngModel)]="to" class="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm">
        </div>
        <button (click)="load()" class="rounded-lg bg-primary text-white px-4 py-2 text-sm font-medium shadow-sm hover:opacity-90">Apply</button>
        <button *ngIf="from || to" (click)="from=''; to=''; load()" class="rounded-lg px-3 py-2 text-sm text-gray-600 hover:underline">Clear</button>
        <span class="ml-auto text-sm text-gray-500" *ngIf="!loading">{{ total }} record(s)</span>
    </div>

    <mat-progress-bar *ngIf="loading" mode="indeterminate"></mat-progress-bar>

    <div *ngIf="!loading" class="rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table class="w-full text-sm">
            <thead class="bg-gray-50 dark:bg-gray-900/40 text-gray-500 uppercase text-xs">
                <tr>
                    <th class="text-left font-medium px-4 py-3">Date</th>
                    <th class="text-left font-medium px-4 py-3">Status</th>
                    <th class="text-left font-medium px-4 py-3">Class</th>
                    <th class="text-left font-medium px-4 py-3">Subject</th>
                    <th class="text-left font-medium px-4 py-3">Marked by</th>
                    <th class="text-left font-medium px-4 py-3">Remarks</th>
                </tr>
            </thead>
            <tbody>
                <tr *ngFor="let r of rows" class="border-t border-gray-100 dark:border-gray-700/60">
                    <td class="px-4 py-3 whitespace-nowrap">{{ r.date | date:'EEE, dd MMM yyyy' }}</td>
                    <td class="px-4 py-3"><span class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium" [ngClass]="statusClass(r.status)">{{ statusLabel(r.status) }}</span></td>
                    <td class="px-4 py-3">{{ r.className }}</td>
                    <td class="px-4 py-3">{{ r.subjectName || '—' }}</td>
                    <td class="px-4 py-3">{{ r.markedByName || '—' }}</td>
                    <td class="px-4 py-3 text-gray-500">{{ r.remarks || '—' }}</td>
                </tr>
                <tr *ngIf="!rows.length"><td colspan="6" class="px-4 py-10 text-center text-gray-400">No attendance records for this period.</td></tr>
            </tbody>
        </table>
    </div>
</app-list-page>
    `,
})
export class MyChildAttendanceComponent implements OnInit {
    rows: StudentAttendanceRow[] = [];
    total = 0;
    loading = true;
    from = '';
    to = '';

    statusLabel = attendanceLabel;
    statusClass = attendanceClass;

    constructor(private _svc: StudentsService, private _cdr: ChangeDetectorRef, private _notify: NotificationService) {}

    ngOnInit(): void { this.load(); }

    load(): void {
        this.loading = true;
        this._svc.getMyAttendance({ fromDate: this.from || undefined, toDate: this.to || undefined, pageSize: 500 }).subscribe({
            next: (p) => { this.rows = p.data ?? []; this.total = p.totalCount ?? this.rows.length; this.loading = false; this._cdr.markForCheck(); },
            error: () => { this.loading = false; this._cdr.markForCheck(); this._notify.error('Could not load attendance.'); },
        });
    }
}
