import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { FuseNavigationItem } from '@fuse/components/navigation';
import { Navigation } from 'app/core/navigation/navigation.types';
import { PermissionsService } from 'app/core/auth/permissions.service';
import { Observable, ReplaySubject, tap } from 'rxjs';

@Injectable({providedIn: 'root'})
export class NavigationService
{
    private _httpClient = inject(HttpClient);
    private _permissionsService = inject(PermissionsService);
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
                const filtered: Navigation = {
                    default: this._filterByPermissions(navigation.default, permissions),
                    compact: this._filterByPermissions(navigation.compact, permissions),
                    futuristic: this._filterByPermissions(navigation.futuristic, permissions),
                    horizontal: this._filterByPermissions(navigation.horizontal, permissions),
                };
                this._navigation.next(filtered);
            }),
        );
    }

    /**
     * Recursively prune nav items whose required permission is missing.
     * - A leaf with `meta.permission` is kept only when the user has that permission.
     * - A leaf without `meta.permission` is always kept.
     * - A group / collapsable is kept only if at least one descendant survives.
     */
    private _filterByPermissions(items: FuseNavigationItem[], permissions: string[] | null): FuseNavigationItem[]
    {
        // No permissions list yet → don't hide anything (resolver will rerun).
        if (permissions === null) return items;

        const filterTree = (list?: FuseNavigationItem[]): FuseNavigationItem[] | undefined => {
            if (!list) return list;
            const out: FuseNavigationItem[] = [];
            for (const item of list)
            {
                const required = (item.meta && (item.meta as { permission?: string }).permission) || undefined;
                if (required && !permissions.includes(required)) continue;

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
