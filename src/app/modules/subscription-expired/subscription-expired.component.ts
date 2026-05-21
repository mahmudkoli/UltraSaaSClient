import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { SubscriptionStateService } from 'app/core/billing/subscription-state.service';
import { MySubscriptionDto } from 'app/core/billing/billing.types';

/**
 * Phase v1-J1 — lockout landing when SubscriptionGuard finds the tenant
 * is suspended. Shows: suspension reason, technical-admin email, plan +
 * validity end-date snapshot, and a sign-out button. No nav chrome.
 *
 * If the operator records a payment elsewhere (root admin records on
 * their behalf), the next navigation will re-load the snapshot via
 * SubscriptionStateService.refresh() — wired by a Retry button.
 */
@Component({
    selector: 'subscription-expired',
    templateUrl: './subscription-expired.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CommonModule],
})
export class SubscriptionExpiredComponent implements OnInit {
    dto: MySubscriptionDto | null = null;
    refreshing = false;

    constructor(
        private _state: SubscriptionStateService,
        private _auth: AuthService,
        private _router: Router,
        private _cdr: ChangeDetectorRef,
    ) {}

    ngOnInit(): void {
        this.dto = this._state.snapshot;
        // If we landed here without a cached snapshot (deep link), pull it.
        if (!this.dto) {
            this._state.load().subscribe((d) => { this.dto = d; this._cdr.markForCheck(); });
        }
    }

    date(d?: string | null): string {
        return d ? new Date(d).toLocaleDateString() : '—';
    }

    retry(): void {
        this.refreshing = true;
        this._cdr.markForCheck();
        this._state.refresh().subscribe({
            next: (d) => {
                this.dto = d;
                this.refreshing = false;
                this._cdr.markForCheck();
                if (d?.isSystemActive) this._router.navigateByUrl('/');
            },
            error: () => { this.refreshing = false; this._cdr.markForCheck(); },
        });
    }

    signOut(): void {
        this._state.clear();
        this._auth.logout();
        this._router.navigateByUrl('/sign-in');
    }
}
