import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { FuseNavigationItem } from '@fuse/components/navigation';
import { SubscriptionStateService } from 'app/core/billing/subscription-state.service';
import { Navigation } from 'app/core/navigation/navigation.types';
import { isModuleVisible, parseFeatureFlags } from 'app/core/modules/modules-config';
import { forkJoin, Observable, ReplaySubject, tap } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class NavigationService
{
    private _httpClient = inject(HttpClient);
    private _subscriptionState = inject(SubscriptionStateService);
    private _navigation: ReplaySubject<Navigation> = new ReplaySubject<Navigation>(1);

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for navigation
     */
    get navigation$(): Observable<Navigation>
    {
        return this._navigation.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get all navigation data. Filters top-level groups by the tenant's
     * enabled feature codes — groups whose `modules-config.ts` entry maps
     * to a feature not present on the plan are hidden. Pages still load if
     * a user navigates by URL; the BE [RequireTenantFeature] gate is the
     * source of truth for entitlement.
     */
    get(): Observable<Navigation>
    {
        return forkJoin({
            nav: this._httpClient.get<Navigation>('api/common/navigation'),
            sub: this._subscriptionState.load(),
        }).pipe(
            map(({ nav, sub }) => {
                // Fail-open: no subscription resolved (root tenant, non-admin role
                // that can't read MySubscription, or a backend hiccup) leaves the
                // full menu visible. The BE [RequireTenantFeature] gate is the
                // source of truth — hiding the nav is just a UX nicety.
                if (!sub?.plan) return nav;
                const enabled = parseFeatureFlags(sub.plan.featureFlagsJson);
                const filterItems = (items: FuseNavigationItem[]) =>
                    items.filter(item => isModuleVisible(item.id, enabled));
                return {
                    compact:    filterItems(nav.compact),
                    default:    filterItems(nav.default),
                    futuristic: filterItems(nav.futuristic),
                    horizontal: filterItems(nav.horizontal),
                };
            }),
            tap((navigation) => this._navigation.next(navigation)),
        );
    }
}
