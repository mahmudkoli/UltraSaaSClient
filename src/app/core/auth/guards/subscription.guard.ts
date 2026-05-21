import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { SubscriptionStateService } from 'app/core/billing/subscription-state.service';
import { TenantService } from 'app/core/tenant/tenant.service';

/**
 * Phase v1-J1 — blocks navigation to admin pages when the tenant's
 * subscription is no longer active. Pairs with the /subscription-expired
 * lockout page so the operator sees *why* they're locked out and how to
 * recover (technicalAdminEmail).
 *
 * Bypasses:
 *  - Root tenant (admin@root.com) — root never has a self-subscription.
 *  - Subscription-read 403 — non-admin users can't load MySubscription;
 *    fail-open so they can still use the app while their admin sorts
 *    the renewal.
 *
 * The guard is intentionally read-only — it doesn't mutate state. The
 * lockout page itself owns the recover-by-payment flow.
 */
export const SubscriptionGuard: CanActivateFn | CanActivateChildFn = () => {
    const router = inject(Router);
    const state = inject(SubscriptionStateService);
    const tenant = inject(TenantService);

    // Root tenant is the operator-side console — never gated.
    if (tenant.resolve() === 'root') return true;

    return state.load().pipe(
        map((dto) => {
            if (!dto) return true;                 // fail-open on read failure
            if (dto.isSystemActive) return true;   // subscription active → pass
            return router.parseUrl('/subscription-expired');
        }),
    );
};
