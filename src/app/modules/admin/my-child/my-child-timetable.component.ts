import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterLink } from '@angular/router';
import { StudentsService } from '../../../core/students/students.service';
import { StudentTimetableRow } from '../../../core/students/my-child.types';
import { NotificationService } from '../../../core/services/notification.service';
import { ListPageComponent } from '../../../shared/components/list-page.component';

interface DayGroup { day: string; rows: StudentTimetableRow[]; }

@Component({
    selector: 'my-child-timetable',
    standalone: true,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, MatIconModule, MatProgressBarModule, RouterLink, ListPageComponent],
    template: `
<app-list-page title="My Timetable" subtitle="Your weekly class schedule."
    icon="calendar_view_week" iconGradient="from-sky-500 to-indigo-600"
    pageGradient="from-gray-50 via-sky-50/30 to-indigo-50/30">
    <ng-container pageActions>
        <a routerLink="/my-profile" class="inline-flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-primary">
            <mat-icon class="icon-size-5 mr-1">arrow_back</mat-icon> Back to dashboard
        </a>
    </ng-container>

    <mat-progress-bar *ngIf="loading" mode="indeterminate"></mat-progress-bar>

    <div *ngIf="!loading" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <div *ngFor="let g of days" class="rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div class="px-4 py-3 bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-semibold">{{ g.day }}</div>
            <ul class="divide-y divide-gray-100 dark:divide-gray-700/60">
                <li *ngFor="let r of g.rows" class="px-4 py-3">
                    <div class="flex items-center justify-between">
                        <span class="font-medium text-gray-900 dark:text-white">{{ r.subjectName || '—' }}</span>
                        <span class="text-xs text-gray-500">{{ fmt(r.startTime) }}<span *ngIf="r.endTime"> – {{ fmt(r.endTime) }}</span></span>
                    </div>
                    <div class="mt-0.5 text-xs text-gray-500">
                        <span *ngIf="r.teacherName">{{ r.teacherName }}</span>
                        <span *ngIf="r.roomNumber"> · Room {{ r.roomNumber }}</span>
                        <span *ngIf="r.timeSlotName"> · {{ r.timeSlotName }}</span>
                    </div>
                </li>
                <li *ngIf="!g.rows.length" class="px-4 py-6 text-center text-gray-400 text-sm">No classes</li>
            </ul>
        </div>
        <div *ngIf="!days.length" class="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-10 text-center text-gray-400">
            No timetable has been published for your class yet.
        </div>
    </div>
</app-list-page>
    `,
})
export class MyChildTimetableComponent implements OnInit {
    days: DayGroup[] = [];
    loading = true;
    private order = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    constructor(private _svc: StudentsService, private _cdr: ChangeDetectorRef, private _notify: NotificationService) {}

    ngOnInit(): void {
        this._svc.getMyTimetable().subscribe({
            next: (rows) => { this.days = this.group(rows ?? []); this.loading = false; this._cdr.markForCheck(); },
            error: () => { this.loading = false; this._cdr.markForCheck(); this._notify.error('Could not load timetable.'); },
        });
    }

    fmt(t?: string): string {
        if (!t) return '';
        const [h, m] = t.split(':');
        const hh = parseInt(h, 10);
        const ampm = hh >= 12 ? 'PM' : 'AM';
        const h12 = hh % 12 || 12;
        return `${h12}:${m} ${ampm}`;
    }

    private group(rows: StudentTimetableRow[]): DayGroup[] {
        const map = new Map<string, StudentTimetableRow[]>();
        for (const r of rows) {
            const list = map.get(r.dayOfWeek) ?? [];
            list.push(r);
            map.set(r.dayOfWeek, list);
        }
        return [...map.entries()]
            .map(([day, list]) => ({ day, rows: list.sort((a, b) => (a.startTime || '').localeCompare(b.startTime || '')) }))
            .sort((a, b) => this.order.indexOf(a.day) - this.order.indexOf(b.day));
    }
}
