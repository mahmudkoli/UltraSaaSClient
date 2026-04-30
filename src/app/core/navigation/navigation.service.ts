import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { FuseNavigationItem } from '@fuse/components/navigation';
import { Navigation } from 'app/core/navigation/navigation.types';
import { FeaturesService } from 'app/core/auth/features.service';
import { PermissionsService } from 'app/core/auth/permissions.service';
import { BusinessType, TenantInfoService } from 'app/core/auth/tenant-info.service';
import { Observable, ReplaySubject, tap } from 'rxjs';

@Injectable({providedIn: 'root'})
export class NavigationService
{
    private _httpClient = inject(HttpClient);
    private _permissionsService = inject(PermissionsService);
    private _featuresService = inject(FeaturesService);
    private _tenantInfoService = inject(TenantInfoService);
    private _navigation: ReplaySubject<Navigation> = new ReplaySubject<Navigation>(1);

    get navigation$(): Observable<Navigation>
    {
        return this._navigation.asObservable();
    }

    /**
     * Get all navigation data, filtered by the current user's permissions.
     * Permissions must already be loaded (initialDataResolver kicks that off
     * in parallel). If they haven't been fetched yet — e.g. unauthenticated —
     * the unfiltered nav is published, and the auth guard will redirect.
     */
    get(): Observable<Navigation>
    {
        return this._httpClient.get<Navigation>('api/common/navigation').pipe(
            tap((navigation) =>
            {
                const permissions = this._permissionsService.permissions();
                const features = this._featuresService.features();
                const businessType = this._tenantInfoService.businessType();
                const filtered: Navigation = {
                    default: this._filterByPermissions(navigation.default, permissions, features, businessType),
                    compact: this._filterByPermissions(navigation.compact, permissions, features, businessType),
                    futuristic: this._filterByPermissions(navigation.futuristic, permissions, features, businessType),
                    horizontal: this._filterByPermissions(navigation.horizontal, permissions, features, businessType),
                };
                this._navigation.next(filtered);
            }),
        );
    }

    /**
     * Recursively prune nav items whose required gate is missing.
     * - `meta.permission`  → user must hold that permission.
     * - `meta.feature`     → tenant must have that feature enabled (plan add-ons).
     * - `meta.businessType`→ tenant's BusinessType must match (or be `Generic`,
     *                        which always passes vertical gates).
     * - A leaf without any gate is always kept.
     * - A group / collapsable is kept only if at least one descendant survives.
     */
    private _filterByPermissions(
        items: FuseNavigationItem[],
        permissions: string[] | null,
        features: string[] | null,
        businessType: BusinessType | null,
    ): FuseNavigationItem[]
    {
        // No permissions list yet → don't hide anything (resolver will rerun).
        if (permissions === null) return items;

        const verticalAllows = (required: BusinessType): boolean => {
            // Tenant info hasn't loaded yet → don't hide vertical entries.
            if (!businessType) return true;
            // Generic = wildcard tenant; sees every vertical.
            if (businessType === 'Generic') return true;
            return businessType === required;
        };

        const filterTree = (list?: FuseNavigationItem[]): FuseNavigationItem[] | undefined => {
            if (!list) return list;
            const out: FuseNavigationItem[] = [];
            for (const item of list)
            {
                const meta = (item.meta || {}) as {
                    permission?: string;
                    feature?: string;
                    businessType?: BusinessType;
                };
                if (meta.permission && !permissions.includes(meta.permission)) continue;
                if (meta.feature && !(features ?? []).includes(meta.feature)) continue;
                if (meta.businessType && !verticalAllows(meta.businessType)) continue;

                if (item.children && item.children.length > 0)
                {
                    const filteredChildren = filterTree(item.children);
                    if (!filteredChildren || filteredChildren.length === 0) continue;
                    out.push({ ...item, children: filteredChildren });
                }
                else
                {
                    out.push(item);
                }
            }
            return out;
        };

        return filterTree(items) ?? [];
    }
}
