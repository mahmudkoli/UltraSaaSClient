import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { catchError, shareReplay } from 'rxjs/operators';
import { TenantService } from '../tenant/tenant.service';
import { MySubscriptionDto } from './billing.types';
import { MySubscriptionService } from './my-subscription.service';

/**
 * Phase v1-J1 — caches the tenant's MySubscriptionDto so the
 * SubscriptionGuard doesn't hit the API on every route change.
 * Snapshot is hydrated lazily on first guard activation and
 * can be invalidated after a known state change (e.g. after
 * a /subscription-expired page detects a recovery).
 */
@Injectable({ providedIn: 'root' })
export class SubscriptionStateService {
    private _snapshot$ = new BehaviorSubject<MySubscriptionDto | null>(null);
    private _inflight: Observable<MySubscriptionDto | null> | null = null;

    constructor(private _svc: MySubscriptionService, private _tenant: TenantService) {}

    /** Last-known snapshot (null until first load completes). Synchronous read. */
    get snapshot(): MySubscriptionDto | null {
        return this._snapshot$.value;
    }

    /** Stream of snapshot changes — page templates can subscribe. */
    asObservable(): Observable<MySubscriptionDto | null> {
        return this._snapshot$.asObservable();
    }

    /**
     * Returns the cached snapshot if hydrated; otherwise fetches from the
     * BE and caches the result. Subsequent callers during the same in-flight
     * request share the response.
     */
    load(): Observable<MySubscriptionDto | null> {
        // Invalidate the cache if the resolved tenant changed since the last
        // load (e.g. user signed out + signed in on a different school).
        // The dto carries tenantId from FSHTenantInfo.Id; compare to what the
        // tenant service resolves right now.
        const currentTenantId = this._tenant.resolve();
        if (this._snapshot$.value && this._snapshot$.value.tenantId !== currentTenantId) {
            this._snapshot$.next(null);
            this._inflight = null;
        }
        if (this._snapshot$.value) return of(this._snapshot$.value);
        if (this._inflight) return this._inflight;

        this._inflight = this._svc.getMine().pipe(
            tap((dto) => this._snapshot$.next(dto)),
            // 403 / 500 here means the caller can't read the subscription
            // (non-admin role, or a backend hiccup). Fail-open — don't block
            // navigation on infra problems. The user just won't see the
            // lockout page; the next call retries.
            catchError(() => of(null)),
            shareReplay(1),
        );
        this._inflight.subscribe({ complete: () => { this._inflight = null; } });
        return this._inflight;
    }

    /** Force a refresh (e.g. after Record-Payment recovered the tenant). */
    refresh(): Observable<MySubscriptionDto | null> {
        this._snapshot$.next(null);
        this._inflight = null;
        return this.load();
    }

    /** Drop the cached value — typically called on logout. */
    clear(): void {
        this._snapshot$.next(null);
        this._inflight = null;
    }
}
