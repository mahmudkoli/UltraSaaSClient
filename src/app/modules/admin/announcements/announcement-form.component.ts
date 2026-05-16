import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { AnnouncementsService } from 'app/core/billing/billing.service';
import {
    AnnouncementAudienceKind,
    AnnouncementDto,
    NotificationAudience,
    NotificationSeverity,
} from 'app/core/billing/billing.types';

/**
 * Send-a-broadcast page (Phase 2.56c). Standalone form; the list page at
 * /announcements navigates here for both "New broadcast" and "Resend" (the
 * latter passes the row through router state to prefill the fields). On
 * success, redirects back to /announcements where the new row shows at the top.
 */
@Component({
    selector: 'app-announcement-form',
    standalone: true,
    imports: [
        CommonModule, FormsModule, RouterLink,
        MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatIconModule,
        MatInputModule, MatSelectModule,
    ],
    template: `
<div class="flex flex-col flex-auto min-w-0 p-4 sm:p-6">
    <div class="flex items-center gap-3 mb-6">
        <button mat-icon-button routerLink="/announcements" matTooltip="Back to history">
            <mat-icon>arrow_back</mat-icon>
        </button>
        <div class="w-10 h-10 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center">
            <mat-icon class="text-white">campaign</mat-icon>
        </div>
        <div>
            <h1 class="text-2xl font-bold">{{ isResend ? 'Resend broadcast' : 'New broadcast' }}</h1>
            <p class="text-sm text-gray-500">Send an in-app message to All tenants / a plan tier / a single tenant. Fans out at publish time.</p>
        </div>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-200 dark:border-gray-700 p-5">
        <mat-form-field appearance="outline" class="w-full">
            <mat-label>Title</mat-label>
            <input matInput [(ngModel)]="title" maxlength="150" placeholder="e.g. System maintenance tonight 11pm–12am">
        </mat-form-field>
        <mat-form-field appearance="outline" class="w-full">
            <mat-label>Body</mat-label>
            <textarea matInput [(ngModel)]="body" rows="5" maxlength="2000" placeholder="The full message — shown in the bell drawer."></textarea>
        </mat-form-field>

        <div class="grid grid-cols-2 gap-3">
            <mat-form-field appearance="outline">
                <mat-label>Severity</mat-label>
                <mat-select [(ngModel)]="severity">
                    <mat-option value="Info">Info</mat-option>
                    <mat-option value="Warning">Warning</mat-option>
                    <mat-option value="Urgent">Urgent</mat-option>
                </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
                <mat-label>Audience</mat-label>
                <mat-select [(ngModel)]="audienceKind">
                    <mat-option value="All">All tenants</mat-option>
                    <mat-option value="Plan">Plan tier</mat-option>
                    <mat-option value="Tenant">Specific tenant</mat-option>
                </mat-select>
            </mat-form-field>
            @if (audienceKind !== 'All') {
                <mat-form-field appearance="outline" class="col-span-2">
                    <mat-label>{{ audienceKind === 'Plan' ? 'Plan code (e.g. starter)' : 'Tenant id (e.g. electroplus)' }}</mat-label>
                    <input matInput [(ngModel)]="audienceTarget">
                </mat-form-field>
            }
        </div>

        <div class="border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
            <mat-checkbox [(ngModel)]="visibleToAllUsers">
                <span class="text-sm">Visible to all users in the tenant <span class="text-xs text-gray-500">(default: Admin only — uncheck for maintenance windows / feature releases cashiers should see)</span></span>
            </mat-checkbox>
        </div>

        <mat-form-field appearance="outline" class="w-full mt-3">
            <mat-label>Link URL (optional)</mat-label>
            <input matInput [(ngModel)]="linkUrl" placeholder="/subscription">
        </mat-form-field>

        @if (errorMsg()) {
            <p class="text-xs text-rose-600 mt-1">{{ errorMsg() }}</p>
        }

        <div class="flex justify-end gap-2 mt-4">
            <button mat-button routerLink="/announcements" [disabled]="busy()">Cancel</button>
            <button mat-flat-button color="primary" (click)="submit()" [disabled]="busy() || !valid()">
                <mat-icon class="icon-size-5 mr-1">send</mat-icon>
                <span>{{ busy() ? 'Sending…' : 'Send announcement' }}</span>
            </button>
        </div>
    </div>
</div>
    `,
})
export class AnnouncementFormComponent implements OnInit {
    private readonly api = inject(AnnouncementsService);
    private readonly snack = inject(MatSnackBar);
    private readonly router = inject(Router);

    title = '';
    body = '';
    severity: NotificationSeverity = 'Info';
    audienceKind: AnnouncementAudienceKind = 'All';
    audienceTarget = '';
    visibleToAllUsers = false; // false → AdminOnly
    linkUrl = '';

    isResend = false;
    busy = signal(false);
    errorMsg = signal<string | null>(null);

    ngOnInit(): void {
        // Resend path: list page navigates here with the source row in router
        // state. Read it once at ngOnInit; the state is lost on refresh which
        // is fine — refreshing /announcements/new should give a blank form.
        const nav = this.router.getCurrentNavigation();
        const fromState = (nav?.extras?.state ?? history.state) as { prefill?: AnnouncementDto } | undefined;
        const prefill = fromState?.prefill;
        if (prefill) {
            this.title = prefill.title;
            this.body = prefill.body;
            this.severity = prefill.severity;
            this.audienceKind = prefill.audienceKind;
            this.audienceTarget = prefill.audienceTarget ?? '';
            this.visibleToAllUsers = prefill.audience === 'AllUsers';
            this.linkUrl = prefill.linkUrl ?? '';
            this.isResend = true;
        }
    }

    valid(): boolean {
        if (!this.title?.trim() || !this.body?.trim()) return false;
        if (this.audienceKind !== 'All' && !this.audienceTarget?.trim()) return false;
        return true;
    }

    submit(): void {
        if (!this.valid()) return;
        this.busy.set(true);
        this.errorMsg.set(null);
        const audience: NotificationAudience = this.visibleToAllUsers ? 'AllUsers' : 'AdminOnly';
        this.api.create({
            title: this.title.trim(),
            body: this.body.trim(),
            severity: this.severity,
            audienceKind: this.audienceKind,
            audienceTarget: this.audienceKind === 'All' ? undefined : this.audienceTarget.trim(),
            audience,
            linkUrl: this.linkUrl?.trim() || undefined,
        }).subscribe({
            next: r => {
                this.busy.set(false);
                this.snack.open(`Announcement delivered to ${r.deliveredTo} tenant(s).`, 'OK', { duration: 3500 });
                this.router.navigate(['/announcements']);
            },
            error: err => {
                this.busy.set(false);
                this.errorMsg.set(err?.error?.exception ?? err?.error?.title ?? 'Send failed.');
            },
        });
    }
}
