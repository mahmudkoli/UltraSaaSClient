import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { PermissionsService } from 'app/core/auth/permissions.service';
import { MyBillingService } from 'app/core/billing/billing.service';

/**
 * App-shell banner shown above the main content when the tenant's
 * subscription is approaching expiry (≤7 days) or already suspended. Visible
 * only to users with `Subscription.View` permission (tenant Admin role) —
 * cashiers / inventory clerks don't see it. Self-loads on init from
 * /api/mysubscription; silently exits on 403 (non-Admin) or any other error.
 */
@Component({
    selector: 'app-expiry-banner',
    standalone: true,
    imports: [CommonModule, MatIconModule, RouterModule],
    template: `
@if (visible()) {
    <div class="px-4 py-2 border-b text-sm flex items-center justify-between gap-3"
         [class.bg-amber-100]="severity() === 'warning'"
         [class.text-amber-900]="severity() === 'warning'"
         [class.bg-rose-100]="severity() === 'urgent' || !active()"
         [class.text-rose-900]="severity() === 'urgent' || !active()">
        <div class="flex items-center gap-2">
            <mat-icon class="icon-size-5">{{ active() ? 'warning' : 'block' }}</mat-icon>
            <span>
                @if (!active()) {
                    <strong>Subscription expired.</strong> Service is read-only — contact your platform admin to record a payment and restore access.
                } @else if (severity() === 'urgent') {
                    <strong>Renew today.</strong> Your subscription expires in {{ days() }} day(s).
                } @else {
                    Your subscription expires in {{ days() }} day(s). Contact your platform admin to renew.
                }
            </span>
        </div>
        <a routerLink="/subscription" class="text-xs font-semibold underline hover:no-underline whitespace-nowrap">View subscription →</a>
    </div>
}
    `,
})
export class ExpiryBannerComponent implements OnInit {
    private readonly api = inject(MyBillingService);
    private readonly perms = inject(PermissionsService);

    visible = signal(false);
    severity = signal<'warning' | 'urgent' | 'none'>('none');
    days = signal<number>(0);
    active = signal<boolean>(true);

    ngOnInit(): void {
        // Skip the request entirely if user can't see subscription info — keeps
        // the bell from emitting 403s in the console for cashiers.
        if (!this.perms.has('Permissions.Subscription.View')) return;

        this.api.getMySubscription().subscribe({
            next: s => {
                this.days.set(s.daysUntilExpiry);
                this.active.set(s.isSystemActive);
                this.severity.set((s.severity as 'warning' | 'urgent' | 'none') ?? 'none');
                this.visible.set(!s.isSystemActive || s.severity === 'warning' || s.severity === 'urgent');
            },
            error: () => { /* silent — banner just stays hidden */ },
        });
    }
}
