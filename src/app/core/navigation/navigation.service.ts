import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { FuseNavigationItem } from '@fuse/components/navigation';
import { SubscriptionStateService } from 'app/core/billing/subscription-state.service';
import { PermissionsService } from 'app/core/auth/permissions.service';
import { Navigation } from 'app/core/navigation/navigation.types';
import { hasNavPermission, isModuleVisible, parseFeatureFlags } from 'app/core/modules/modules-config';
import { forkJoin, Observable, ReplaySubject, tap } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class NavigationService
{
    private _httpClient = inject(HttpClient);
    private _subscriptionState = inject(SubscriptionStateService);
    private _permissions = inject(PermissionsService);
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
            perms: this._permissions.ensureLoaded(),
        }).pipe(
            map(({ nav, sub, perms }) => {
                // Two independent gates, both fail-open/fail-safe and both backed by
                // a BE source of truth (hiding the nav is only a UX nicety):
                //   1. feature gate  — tenant's plan must enable the module
                //      (fail-open: no plan resolved → full menu by feature)
                //   2. permission gate — user must hold the item's permission
                //      (a bare student/teacher has none → only self-service items)
                const enabled = sub?.plan ? parseFeatureFlags(sub.plan.featureFlagsJson) : null;

                // A leaf is visible if it passes the feature gate (groups only)
                // and the permission gate. A collapsable/group is kept only if it
                // still has visible children after filtering.
                const filterItems = (items: FuseNavigationItem[]): FuseNavigationItem[] =>
                    items.reduce<FuseNavigationItem[]>((acc, item) => {
                        if (enabled && !isModuleVisible(item.id, enabled)) return acc;
                        if (item.children?.length) {
                            const children = filterItems(item.children);
                            if (!children.length) return acc;
                            acc.push({ ...item, children });
                        } else if (hasNavPermission(item.id, perms)) {
                            acc.push(item);
                        }
                        return acc;
                    }, []);

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
