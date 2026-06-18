import { inject, Injectable } from '@angular/core';
import { PersonalService } from 'app/core/personal/personal.service';
import { catchError, map, Observable, of, ReplaySubject, tap } from 'rxjs';

/**
 * Caches the current user's effective permissions (the `permission` role-claims
 * the BE resolves for them) so the nav filter and route guards can decide what
 * the user may see — mirroring the BE `[MustHavePermission]` gate.
 *
 * Source of truth: `GET /api/personal/permissions`. A student (and currently a
 * teacher) resolves to an EMPTY set, so every admin nav item / route is hidden
 * for them — which matches the 403 the API would return anyway.
 *
 * Fail-safe (not fail-open): if the permissions call errors we treat the user
 * as having NO permissions. The BE remains the real gate, so the worst case is
 * an over-hidden menu, never an over-exposed one.
 */
@Injectable({ providedIn: 'root' })
export class PermissionsService
{
    private _personal = inject(PersonalService);
    private _permissions: ReplaySubject<Set<string>> = new ReplaySubject<Set<string>>(1);
    private _snapshot: Set<string> | null = null;
    private _loaded = false;

    /** Stream of the current permission set. */
    get permissions$(): Observable<Set<string>>
    {
        return this._permissions.asObservable();
    }

    /**
     * Fetch (or re-fetch) the user's permissions from the BE and cache them.
     * Always resolves — errors collapse to an empty set.
     */
    load(): Observable<Set<string>>
    {
        return this._personal.getUserPermissions().pipe(
            map(list => new Set(list ?? [])),
            catchError(() => of(new Set<string>())),
            tap((set) => {
                this._snapshot = set;
                this._loaded = true;
                this._permissions.next(set);
            }),
        );
    }

    /**
     * Return the cached permission set, loading it once if it hasn't been
     * fetched yet. Used by guards that may run before the resolver.
     */
    ensureLoaded(): Observable<Set<string>>
    {
        return this._loaded && this._snapshot ? of(this._snapshot) : this.load();
    }

    /** Synchronous check against the cached snapshot (false until loaded). */
    has(permission: string): boolean
    {
        return this._snapshot?.has(permission) ?? false;
    }

    /** True when the user holds at least one permission (i.e. is not a bare student/teacher). */
    get hasAny(): boolean
    {
        return (this._snapshot?.size ?? 0) > 0;
    }

    /** Reset on logout so the next user starts clean. */
    clear(): void
    {
        this._snapshot = null;
        this._loaded = false;
        this._permissions.next(new Set<string>());
    }
}
