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
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterLink } from '@angular/router';
import { AnnouncementsService } from 'app/core/billing/billing.service';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
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
        MatInputModule, MatSelectModule, MatTooltipModule,
        TranslocoModule,
    ],
    template: `
<div class="flex flex-col flex-auto min-w-0 p-4 sm:p-6">
    <div class="flex items-center gap-3 mb-6">
        <button mat-icon-button routerLink="/announcements" [matTooltip]="'ADMIN.ANNOUNCEMENT.FORM.BACK_TOOLTIP' | transloco">
            <mat-icon>arrow_back</mat-icon>
        </button>
        <div class="w-10 h-10 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center">
            <mat-icon class="text-white">campaign</mat-icon>
        </div>
        <div>
            <h1 class="text-2xl font-bold">{{ (isResend ? 'ADMIN.ANNOUNCEMENT.FORM.TITLE_RESEND' : 'ADMIN.ANNOUNCEMENT.FORM.TITLE_NEW') | transloco }}</h1>
            <p class="text-sm text-gray-500">{{ 'ADMIN.ANNOUNCEMENT.FORM.SUBTITLE' | transloco }}</p>
        </div>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-200 dark:border-gray-700 p-5">
        <mat-form-field appearance="outline" class="w-full">
            <mat-label>{{ 'ADMIN.ANNOUNCEMENT.FORM.TITLE_LABEL' | transloco }}</mat-label>
            <input matInput [(ngModel)]="title" maxlength="150" [placeholder]="'ADMIN.ANNOUNCEMENT.FORM.TITLE_PLACEHOLDER' | transloco">
        </mat-form-field>
        <mat-form-field appearance="outline" class="w-full">
            <mat-label>{{ 'ADMIN.ANNOUNCEMENT.FORM.BODY_LABEL' | transloco }}</mat-label>
            <textarea matInput [(ngModel)]="body" rows="5" maxlength="2000" [placeholder]="'ADMIN.ANNOUNCEMENT.FORM.BODY_PLACEHOLDER' | transloco"></textarea>
        </mat-form-field>

        <div class="grid grid-cols-2 gap-3">
            <mat-form-field appearance="outline">
                <mat-label>{{ 'ADMIN.ANNOUNCEMENT.FORM.SEVERITY_LABEL' | transloco }}</mat-label>
                <mat-select [(ngModel)]="severity">
                    <mat-option value="Info">{{ 'ADMIN.ANNOUNCEMENT.FORM.SEV_INFO' | transloco }}</mat-option>
                    <mat-option value="Warning">{{ 'ADMIN.ANNOUNCEMENT.FORM.SEV_WARNING' | transloco }}</mat-option>
                    <mat-option value="Urgent">{{ 'ADMIN.ANNOUNCEMENT.FORM.SEV_URGENT' | transloco }}</mat-option>
                </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
                <mat-label>{{ 'ADMIN.ANNOUNCEMENT.FORM.AUDIENCE_LABEL' | transloco }}</mat-label>
                <mat-select [(ngModel)]="audienceKind">
                    <mat-option value="All">{{ 'ADMIN.ANNOUNCEMENT.FORM.AUD_ALL' | transloco }}</mat-option>
                    <mat-option value="Plan">{{ 'ADMIN.ANNOUNCEMENT.FORM.AUD_PLAN' | transloco }}</mat-option>
                    <mat-option value="Tenant">{{ 'ADMIN.ANNOUNCEMENT.FORM.AUD_TENANT' | transloco }}</mat-option>
                </mat-select>
            </mat-form-field>
            @if (audienceKind !== 'All') {
                <mat-form-field appearance="outline" class="col-span-2">
                    <mat-label>{{ (audienceKind === 'Plan' ? 'ADMIN.ANNOUNCEMENT.FORM.AUD_PLAN_PLACEHOLDER' : 'ADMIN.ANNOUNCEMENT.FORM.AUD_TENANT_PLACEHOLDER') | transloco }}</mat-label>
                    <input matInput [(ngModel)]="audienceTarget">
                </mat-form-field>
            }
        </div>

        <div class="border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
            <mat-checkbox [(ngModel)]="visibleToAllUsers">
                <span class="text-sm">{{ 'ADMIN.ANNOUNCEMENT.FORM.VISIBLE_ALL_USERS' | transloco }} <span class="text-xs text-gray-500">{{ 'ADMIN.ANNOUNCEMENT.FORM.VISIBLE_HINT' | transloco }}</span></span>
            </mat-checkbox>
        </div>

        <mat-form-field appearance="outline" class="w-full mt-3">
            <mat-label>{{ 'ADMIN.ANNOUNCEMENT.FORM.LINK_LABEL' | transloco }}</mat-label>
            <input matInput [(ngModel)]="linkUrl" [placeholder]="'ADMIN.ANNOUNCEMENT.FORM.LINK_PLACEHOLDER' | transloco">
        </mat-form-field>

        @if (errorMsg()) {
            <p class="text-xs text-rose-600 mt-1">{{ errorMsg() }}</p>
        }

        <div class="flex justify-end gap-2 mt-4">
            <button mat-button routerLink="/announcements" [disabled]="busy()">{{ 'COMMON.CANCEL' | transloco }}</button>
            <button mat-flat-button color="primary" (click)="submit()" [disabled]="busy() || !valid()">
                <mat-icon class="icon-size-5 mr-1">send</mat-icon>
                <span>{{ (busy() ? 'ADMIN.ANNOUNCEMENT.FORM.SENDING' : 'ADMIN.ANNOUNCEMENT.FORM.SEND_BUTTON') | transloco }}</span>
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
    private readonly _transloco = inject(TranslocoService);

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
                this.snack.open(this._transloco.translate('ADMIN.ANNOUNCEMENT.FORM.TOAST_SUCCESS', { count: r.deliveredTo }), this._transloco.translate('COMMON.YES'), { duration: 3500 });
                this.router.navigate(['/announcements']);
            },
            error: err => {
                this.busy.set(false);
                this.errorMsg.set(err?.error?.exception ?? err?.error?.title ?? this._transloco.translate('ADMIN.ANNOUNCEMENT.FORM.ERROR_DEFAULT'));
            },
        });
    }
}
