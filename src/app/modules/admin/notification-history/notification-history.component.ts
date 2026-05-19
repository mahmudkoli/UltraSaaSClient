import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { MyBillingService } from 'app/core/billing/billing.service';
import {
    NotificationCategory,
    NotificationSeverity,
    TenantNotificationDto,
} from 'app/core/billing/billing.types';

type SeverityFilter = 'All' | NotificationSeverity;
type ReadFilter = 'all' | 'unread';

/**
 * Tenant-side notification history page. The bell drawer in the topbar only
 * shows the last few; this page is the full log: every TenantNotification row
 * for the current tenant, filterable by read status + severity, with click-to-
 * navigate when the notification carries a link (e.g. /subscription for an
 * expiry warning).
 *
 * Backed by GET /api/notifications (Phase 2.48) and POST /api/notifications/{id}/read.
 * No pagination yet — typical tenant accumulates &lt; ~200 rows / year.
 */
@Component({
    selector: 'app-notification-history',
    standalone: true,
    imports: [
        CommonModule, FormsModule, DatePipe, RouterLink,
        MatButtonModule, MatChipsModule, MatIconModule, MatSnackBarModule, MatTooltipModule,
    ],
    template: `
<div class="flex flex-col flex-auto min-w-0">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between p-4 sm:py-3 sm:px-6 border-b bg-card">
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                <mat-icon class="text-white" [svgIcon]="'heroicons_outline:bell'"></mat-icon>
            </div>
            <div>
                <h1 class="text-2xl font-bold tracking-tight">Notifications</h1>
                <p class="text-sm text-secondary">
                    All system notifications, announcements, and subscription updates for this tenant.
                    <span *ngIf="unreadCount() > 0" class="ml-1 font-medium text-primary">{{ unreadCount() }} unread</span>
                </p>
            </div>
        </div>
        <div class="flex items-center gap-2">
            <button mat-stroked-button (click)="reload()" [disabled]="loading()">
                <mat-icon [svgIcon]="'heroicons_outline:arrow-path'"></mat-icon>
                <span class="ml-1">Refresh</span>
            </button>
            <button mat-flat-button color="primary" (click)="markAllRead()" [disabled]="unreadCount() === 0 || markingAll()">
                <mat-icon [svgIcon]="'heroicons_outline:envelope-open'"></mat-icon>
                <span class="ml-1">{{ markingAll() ? 'Marking…' : 'Mark all read' }}</span>
            </button>
        </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap items-center gap-3 px-6 py-3 border-b bg-gray-50 dark:bg-gray-900/40 text-sm">
        <div class="flex items-center gap-2">
            <span class="text-secondary">Status:</span>
            <mat-chip-listbox [(ngModel)]="readFilter" (change)="onFilterChange()" hideSingleSelectionIndicator>
                <mat-chip-option value="all">All ({{ all().length }})</mat-chip-option>
                <mat-chip-option value="unread">Unread ({{ unreadCount() }})</mat-chip-option>
            </mat-chip-listbox>
        </div>
        <div class="flex items-center gap-2">
            <span class="text-secondary">Severity:</span>
            <mat-chip-listbox [(ngModel)]="severityFilter" (change)="onFilterChange()" hideSingleSelectionIndicator>
                <mat-chip-option value="All">All</mat-chip-option>
                <mat-chip-option value="Info">Info</mat-chip-option>
                <mat-chip-option value="Warning">Warning</mat-chip-option>
                <mat-chip-option value="Urgent">Urgent</mat-chip-option>
            </mat-chip-listbox>
        </div>
    </div>

    <!-- Body -->
    <div class="flex-auto p-4 sm:p-6 overflow-y-auto">

        @if (loading()) {
            <div class="flex items-center justify-center py-20 text-secondary">
                <mat-icon class="animate-spin mr-2" [svgIcon]="'heroicons_outline:arrow-path'"></mat-icon>
                Loading notifications…
            </div>
        } @else if (filtered().length === 0) {
            <div class="flex flex-col items-center justify-center py-20 text-center">
                <div class="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                    <mat-icon class="text-gray-400 icon-size-8" [svgIcon]="'heroicons_outline:bell-slash'"></mat-icon>
                </div>
                <div class="text-lg font-semibold">No notifications</div>
                <div class="text-sm text-secondary mt-1">
                    @if (readFilter === 'unread') {
                        You're all caught up. New notifications will appear here.
                    } @else if (severityFilter !== 'All') {
                        No notifications match the current filter.
                    } @else {
                        When you have notifications, they'll appear here.
                    }
                </div>
            </div>
        } @else {
            <div class="bg-card rounded-2xl shadow divide-y border border-gray-200 dark:border-gray-700">
                @for (n of filtered(); track n.id) {
                    <div class="flex items-start gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
                         [class.bg-blue-50]="!n.readOn"
                         [class.dark:bg-blue-900-20]="!n.readOn">
                        <!-- Severity icon -->
                        <div class="shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                             [ngClass]="{
                                'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300': n.severity === 'Info',
                                'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300': n.severity === 'Warning',
                                'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300': n.severity === 'Urgent'
                             }">
                            <mat-icon class="icon-size-5" [svgIcon]="severityIcon(n.severity)"></mat-icon>
                        </div>

                        <!-- Content -->
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2 flex-wrap">
                                <span class="font-semibold" [class.text-primary]="!n.readOn">{{ n.title }}</span>
                                <span class="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                    {{ categoryLabel(n.category) }}
                                </span>
                                @if (!n.readOn) {
                                    <span class="text-xs px-2 py-0.5 rounded-full bg-primary text-on-primary">New</span>
                                }
                            </div>
                            <p class="text-sm text-secondary mt-1 whitespace-pre-line">{{ n.body }}</p>
                            <div class="flex items-center gap-3 mt-2 text-xs text-secondary">
                                <span [matTooltip]="(n.createdOn | date:'medium') || ''">
                                    {{ n.createdOn | date:'MMM d, y, h:mm a' }}
                                </span>
                                @if (n.readOn) {
                                    <span class="text-emerald-700 dark:text-emerald-400" [matTooltip]="'Read on ' + (n.readOn | date:'medium')">
                                        · Read {{ n.readOn | date:'MMM d, h:mm a' }}
                                    </span>
                                }
                                @if (n.linkUrl) {
                                    @if (isExternalUrl(n.linkUrl)) {
                                        <!-- Full URLs (https://…) — use a plain anchor or
                                             routerLink would mangle them into
                                             /current-host/https://… (the "host shown twice" bug). -->
                                        <a [href]="n.linkUrl" target="_blank" rel="noopener"
                                           (click)="markRead(n)"
                                           class="text-primary hover:underline ml-auto">
                                            Open <mat-icon class="icon-size-3 align-middle" [svgIcon]="'heroicons_outline:arrow-top-right-on-square'"></mat-icon>
                                        </a>
                                    } @else {
                                        <a [routerLink]="n.linkUrl"
                                           (click)="markRead(n)"
                                           class="text-primary hover:underline ml-auto">
                                            Open <mat-icon class="icon-size-3 align-middle" [svgIcon]="'heroicons_outline:arrow-top-right-on-square'"></mat-icon>
                                        </a>
                                    }
                                }
                            </div>
                        </div>

                        <!-- Mark read button -->
                        @if (!n.readOn) {
                            <button mat-icon-button matTooltip="Mark as read" (click)="markRead(n)" [disabled]="markingId() === n.id">
                                <mat-icon [svgIcon]="'heroicons_outline:check-circle'"></mat-icon>
                            </button>
                        }
                    </div>
                }
            </div>
        }
    </div>
</div>
    `,
})
export class NotificationHistoryComponent implements OnInit {
    private readonly billing = inject(MyBillingService);
    private readonly snack = inject(MatSnackBar);

    private readonly _all = signal<TenantNotificationDto[]>([]);
    readonly all = this._all.asReadonly();
    readonly loading = signal(false);
    readonly markingId = signal<string | null>(null);
    readonly markingAll = signal(false);

    severityFilter: SeverityFilter = 'All';
    readFilter: ReadFilter = 'all';

    readonly unreadCount = computed(() => this._all().filter(n => !n.readOn).length);

    /**
     * Plain method (not `computed()`) because `readFilter` and `severityFilter`
     * are ngModel-bound plain properties — mutating them doesn't invalidate any
     * signal, so a `computed()` would memoize the initial result and the chips
     * would have no visible effect. A plain method re-runs every change-
     * detection tick (which the chip click triggers), so the filter applies
     * correctly.
     */
    filtered(): TenantNotificationDto[] {
        const list = this._all();
        return list.filter(n => {
            if (this.readFilter === 'unread' && n.readOn) return false;
            if (this.severityFilter !== 'All' && n.severity !== this.severityFilter) return false;
            return true;
        });
    }

    ngOnInit(): void {
        this.reload();
    }

    reload(): void {
        this.loading.set(true);
        this.billing.getMyNotifications(false).subscribe({
            next: list => {
                // Newest first.
                const sorted = [...list].sort((a, b) =>
                    new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime()
                );
                this._all.set(sorted);
                this.loading.set(false);
            },
            error: () => {
                this.loading.set(false);
                this.snack.open('Failed to load notifications', 'OK', { duration: 3500 });
            },
        });
    }

    onFilterChange(): void {
        // Chip listbox triggers the computed via the setters — nothing else to do.
    }

    markRead(n: TenantNotificationDto): void {
        if (n.readOn) return;
        this.markingId.set(n.id);
        this.billing.markRead(n.id).subscribe({
            next: () => {
                this.markingId.set(null);
                this._all.update(list => list.map(x => x.id === n.id ? { ...x, readOn: new Date().toISOString() } : x));
            },
            error: () => {
                this.markingId.set(null);
                this.snack.open('Could not mark as read', 'OK', { duration: 3000 });
            },
        });
    }

    /**
     * True for full URLs (`http://`, `https://`, `//cdn…`). Internal-path links
     * (`/sales/abc`) return false. Used to decide between `[routerLink]` and
     * a plain `[href]` anchor — RouterLink mangles absolute URLs into
     * "/current-host/https://example.com/foo" (the "host shown twice" bug).
     */
    isExternalUrl(url: string | null | undefined): boolean {
        if (!url) return false;
        return /^(https?:)?\/\//i.test(url) || /^mailto:/i.test(url);
    }

    /**
     * Best-effort fan-out. The backend doesn't have a bulk endpoint, so we
     * issue per-row PUTs in parallel; this is fine for typical N&lt;200.
     */
    markAllRead(): void {
        const unread = this._all().filter(n => !n.readOn);
        if (unread.length === 0) return;
        this.markingAll.set(true);
        let remaining = unread.length;
        unread.forEach(n => {
            this.billing.markRead(n.id).subscribe({
                next: () => {
                    this._all.update(list => list.map(x => x.id === n.id ? { ...x, readOn: new Date().toISOString() } : x));
                },
                error: () => { /* leave as unread; user can retry */ },
                complete: () => {
                    remaining--;
                    if (remaining === 0) {
                        this.markingAll.set(false);
                        this.snack.open('All notifications marked as read', 'OK', { duration: 2500 });
                    }
                },
            });
        });
    }

    severityIcon(s: NotificationSeverity): string {
        switch (s) {
            case 'Info': return 'heroicons_outline:information-circle';
            case 'Warning': return 'heroicons_outline:exclamation-triangle';
            case 'Urgent': return 'heroicons_outline:exclamation-circle';
        }
    }

    categoryLabel(c: NotificationCategory): string {
        switch (c) {
            case 'Subscription': return 'Subscription';
            case 'Announcement': return 'Announcement';
            case 'Other': return 'System';
        }
    }
}
