import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterLink } from '@angular/router';
import { StudentsService } from '../../../core/students/students.service';
import { StudentEventRow } from '../../../core/students/my-child.types';
import { NotificationService } from '../../../core/services/notification.service';
import { ListPageComponent } from '../../../shared/components/list-page.component';
import { eventTypeLabel } from './my-child.display';

@Component({
    selector: 'my-child-events',
    standalone: true,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, MatIconModule, MatProgressBarModule, RouterLink, ListPageComponent],
    template: `
<app-list-page title="Notices & Events" subtitle="Upcoming school events and notices."
    icon="campaign" iconGradient="from-rose-500 to-pink-600"
    pageGradient="from-gray-50 via-rose-50/30 to-pink-50/30">
    <ng-container pageActions>
        <a routerLink="/my-profile" class="inline-flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-primary">
            <mat-icon class="icon-size-5 mr-1">arrow_back</mat-icon> Back to dashboard
        </a>
    </ng-container>

    <mat-progress-bar *ngIf="loading" mode="indeterminate"></mat-progress-bar>

    <div *ngIf="!loading" class="flex flex-col gap-3">
        <div *ngFor="let e of events" class="rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 p-5 flex gap-4">
            <div class="flex flex-col items-center justify-center w-14 shrink-0 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 text-white py-2">
                <span class="text-xs uppercase">{{ e.startDate | date:'MMM' }}</span>
                <span class="text-xl font-bold leading-none">{{ e.startDate | date:'dd' }}</span>
            </div>
            <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2 flex-wrap">
                    <h3 class="font-semibold text-gray-900 dark:text-white">{{ e.title }}</h3>
                    <span class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-rose-100 text-rose-800">{{ typeLabel(e.eventType) }}</span>
                </div>
                <p *ngIf="e.description" class="text-sm text-gray-600 dark:text-gray-300 mt-1">{{ e.description }}</p>
                <div class="text-xs text-gray-500 mt-2 flex flex-wrap gap-x-4 gap-y-1">
                    <span><mat-icon class="icon-size-4 align-text-bottom mr-0.5">schedule</mat-icon>
                        {{ e.startDate | date:'EEE, dd MMM' }}<span *ngIf="!e.isAllDay && e.startTime"> · {{ e.startTime }}</span><span *ngIf="e.isAllDay"> · All day</span>
                    </span>
                    <span *ngIf="e.location"><mat-icon class="icon-size-4 align-text-bottom mr-0.5">place</mat-icon>{{ e.location }}</span>
                    <span *ngIf="e.organizer"><mat-icon class="icon-size-4 align-text-bottom mr-0.5">person</mat-icon>{{ e.organizer }}</span>
                </div>
            </div>
        </div>
        <div *ngIf="!events.length" class="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-10 text-center text-gray-400">
            No upcoming events or notices.
        </div>
    </div>
</app-list-page>
    `,
})
export class MyChildEventsComponent implements OnInit {
    events: StudentEventRow[] = [];
    loading = true;
    typeLabel = eventTypeLabel;

    constructor(private _svc: StudentsService, private _cdr: ChangeDetectorRef, private _notify: NotificationService) {}

    ngOnInit(): void {
        this._svc.getMyEvents().subscribe({
            next: (rows) => { this.events = rows ?? []; this.loading = false; this._cdr.markForCheck(); },
            error: () => { this.loading = false; this._cdr.markForCheck(); this._notify.error('Could not load events.'); },
        });
    }
}
