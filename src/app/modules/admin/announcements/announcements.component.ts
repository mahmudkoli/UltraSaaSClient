import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterLink } from '@angular/router';
import { AnnouncementsService } from 'app/core/billing/billing.service';
import { AnnouncementDto } from 'app/core/billing/billing.types';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';

/**
 * Platform-admin announcement HISTORY page (Phase 2.56c). Pure list view —
 * "New broadcast" navigates to /announcements/new (separate form component).
 * Resend on a row navigates to the form with the row prefilled via router
 * state so the admin can tweak fields before re-sending.
 */
@Component({
    selector: 'app-announcements',
    standalone: true,
    imports: [
        CommonModule, DatePipe, RouterLink,
        MatButtonModule, MatIconModule, MatTooltipModule,
        TranslocoModule,
    ],
    template: `
<div class="flex flex-col flex-auto min-w-0 p-4 sm:p-6">
    <div class="flex items-center justify-between gap-3 mb-6">
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center">
                <mat-icon class="text-white">campaign</mat-icon>
            </div>
            <div>
                <h1 class="text-2xl font-bold">{{ 'ADMIN.ANNOUNCEMENT.LIST.TITLE' | transloco }}</h1>
                <p class="text-sm text-gray-500">{{ 'ADMIN.ANNOUNCEMENT.LIST.SUBTITLE' | transloco }}</p>
            </div>
        </div>
        <div class="flex items-center gap-2">
            <button mat-stroked-button (click)="reload()" [disabled]="loading()">
                <mat-icon class="icon-size-4">refresh</mat-icon>
                <span class="ml-1">{{ 'ADMIN.ANNOUNCEMENT.LIST.REFRESH' | transloco }}</span>
            </button>
            <button mat-flat-button color="primary" routerLink="/announcements/new">
                <mat-icon class="icon-size-5">send</mat-icon>
                <span class="ml-1">{{ 'ADMIN.ANNOUNCEMENT.LIST.NEW_BROADCAST' | transloco }}</span>
            </button>
        </div>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-200 dark:border-gray-700">
        @if (loading()) {
            <div class="p-6 text-sm text-secondary text-center">{{ 'ADMIN.ANNOUNCEMENT.LIST.LOADING' | transloco }}</div>
        } @else if (history().length === 0) {
            <div class="flex flex-col items-center justify-center py-16 text-center">
                <div class="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-3">
                    <mat-icon class="text-gray-400 icon-size-8">campaign</mat-icon>
                </div>
                <div class="text-lg font-semibold">{{ 'ADMIN.ANNOUNCEMENT.LIST.EMPTY_TITLE' | transloco }}</div>
                <div class="text-sm text-gray-500 mt-1 mb-4">{{ 'ADMIN.ANNOUNCEMENT.LIST.EMPTY_SUBTITLE' | transloco }}</div>
                <button mat-flat-button color="primary" routerLink="/announcements/new">
                    <mat-icon class="icon-size-5">send</mat-icon>
                    <span class="ml-1">{{ 'ADMIN.ANNOUNCEMENT.LIST.SEND_FIRST' | transloco }}</span>
                </button>
            </div>
        } @else {
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead class="bg-gray-50 dark:bg-gray-900/50 text-xs uppercase text-gray-500">
                        <tr>
                            <th class="text-left px-4 py-2">{{ 'ADMIN.ANNOUNCEMENT.LIST.COL_WHEN' | transloco }}</th>
                            <th class="text-left px-4 py-2">{{ 'ADMIN.ANNOUNCEMENT.LIST.COL_TITLE' | transloco }}</th>
                            <th class="text-left px-4 py-2">{{ 'ADMIN.ANNOUNCEMENT.LIST.COL_SEVERITY' | transloco }}</th>
                            <th class="text-left px-4 py-2">{{ 'ADMIN.ANNOUNCEMENT.LIST.COL_AUDIENCE' | transloco }}</th>
                            <th class="text-right px-4 py-2">{{ 'ADMIN.ANNOUNCEMENT.LIST.COL_DELIVERED' | transloco }}</th>
                            <th class="px-4 py-2"></th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                        @for (a of history(); track a.id) {
                            <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/60">
                                <td class="px-4 py-2 whitespace-nowrap text-xs text-secondary" [matTooltip]="(a.createdOn | date:'medium') || ''">
                                    {{ a.createdOn | date:'MMM d, h:mm a' }}
                                </td>
                                <td class="px-4 py-2">
                                    <div class="font-medium" [matTooltip]="a.body">{{ a.title }}</div>
                                    <div class="text-xs text-gray-500 truncate max-w-md">{{ a.body }}</div>
                                </td>
                                <td class="px-4 py-2">
                                    <span class="text-xs px-2 py-0.5 rounded-full"
                                          [ngClass]="{
                                            'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300': a.severity === 'Info',
                                            'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300': a.severity === 'Warning',
                                            'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300': a.severity === 'Urgent'
                                          }">
                                        {{ a.severity }}
                                    </span>
                                </td>
                                <td class="px-4 py-2 text-xs">{{ describeAudience(a) }}</td>
                                <td class="px-4 py-2 text-right text-xs font-mono">{{ a.deliveredTo }}</td>
                                <td class="px-4 py-2">
                                    <button mat-stroked-button class="text-xs" (click)="resend(a)" [matTooltip]="'ADMIN.ANNOUNCEMENT.LIST.RESEND_TOOLTIP' | transloco">
                                        <mat-icon class="icon-size-4">replay</mat-icon>
                                        <span class="ml-1">{{ 'ADMIN.ANNOUNCEMENT.LIST.RESEND' | transloco }}</span>
                                    </button>
                                </td>
                            </tr>
                        }
                    </tbody>
                </table>
            </div>
        }
    </div>
</div>
    `,
})
export class AnnouncementsComponent implements OnInit {
    private readonly api = inject(AnnouncementsService);
    private readonly router = inject(Router);
    private readonly _transloco = inject(TranslocoService);

    history = signal<AnnouncementDto[]>([]);
    loading = signal(false);

    ngOnInit(): void {
        this.reload();
    }

    reload(): void {
        this.loading.set(true);
        this.api.list().subscribe({
            next: list => {
                this.history.set(list ?? []);
                this.loading.set(false);
            },
            error: () => {
                this.loading.set(false);
            },
        });
    }

    /** Navigates to the form with the row's data preloaded via router state. */
    resend(a: AnnouncementDto): void {
        this.router.navigate(['/announcements/new'], { state: { prefill: a } });
    }

    describeAudience(a: AnnouncementDto): string {
        const visibility = this._transloco.translate(a.audience === 'AllUsers' ? 'ADMIN.ANNOUNCEMENT.LIST.AUDIENCE_ALL_USERS' : 'ADMIN.ANNOUNCEMENT.LIST.AUDIENCE_ADMINS_ONLY');
        if (a.audienceKind === 'All') return this._transloco.translate('ADMIN.ANNOUNCEMENT.LIST.AUDIENCE_EVERY_TENANT', { vis: visibility });
        if (a.audienceKind === 'Plan') return this._transloco.translate('ADMIN.ANNOUNCEMENT.LIST.AUDIENCE_PLAN', { plan: a.audienceTarget, vis: visibility });
        if (a.audienceKind === 'Tenant') return this._transloco.translate('ADMIN.ANNOUNCEMENT.LIST.AUDIENCE_TENANT', { id: a.audienceTarget, vis: visibility });
        return visibility;
    }
}
