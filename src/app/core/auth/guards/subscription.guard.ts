import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { MyBillingService } from 'app/core/billing/billing.service';
import { MySubscriptionDto } from 'app/core/billing/billing.types';

/**
 * Phase 2.52 — block tenant-side users from using the app when their
 * subscription is suspended. Redirects to `/subscription-expired` which renders
 * the read-only lockout page.
 *
 * Caches the last MySubscriptionDto in-memory with a 30s TTL so the guard
 * doesn't fire a network round-trip on every navigation; if the cache is
 * stale, fetches fresh. Errors are swallowed (the page renders normally —
 * the SubscriptionMonitorJob will catch up on the next backend sweep).
 *
 * Root tenant's IsSystemActive is always true (FSHTenantInfo.Suspend refuses
 * to flip it), so root admin sails through without special-casing here.
 */

interface CacheEntry {
    fetchedAt: number;
    value: MySubscriptionDto;
}

let cache: CacheEntry | null = null;
const TTL_MS = 30_000;

/** Force the next guard call to refetch — call after Record Payment etc. */
export function invalidateSubscriptionGuardCache(): void {
    cache = null;
}

export const SubscriptionGuard: CanActivateFn | CanActivateChildFn = (route, state) => {
    const router = inject(Router);
    const billing = inject(MyBillingService);

    // The lockout page itself must be reachable while suspended.
    if (state.url.startsWith('/subscription-expired')) return of(true);

    const fresh = cache && (Date.now() - cache.fetchedAt) < TTL_MS;
    if (fresh) {
        return of(decide(cache!.value, router, state.url));
    }

    return billing.getMySubscription().pipe(
        map((dto) => {
            cache = { fetchedAt: Date.now(), value: dto };
            return decide(dto, router, state.url);
        }),
        catchError(() => of(true)),
    );
};

function decide(dto: MySubscriptionDto, router: Router, returnUrl: string): boolean | ReturnType<Router['parseUrl']> {
    if (dto.isSystemActive) return true;
    const tree = router.parseUrl(`/subscription-expired?return=${encodeURIComponent(returnUrl)}`);
    return tree;
}
