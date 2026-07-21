import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { PermissionsService } from 'app/core/auth/permissions.service';
import { map, Observable } from 'rxjs';

/**
 * Permission-aware post-login landing. Replaces the static `redirectTo: 'users'`
 * so that:
 *   • a user with any admin permission  → `/users` (the admin home)
 *   • a user with no admin permissions  → `/profile` (their own profile / ESS)
 *
 * Returns a UrlTree so it works as a guard on a path-less index route.
 */
export const LandingRedirectGuard: CanActivateFn = (): Observable<UrlTree> => {
    const permissions = inject(PermissionsService);
    const router = inject(Router);

    return permissions.ensureLoaded().pipe(
        map((perms) => router.parseUrl(perms.size > 0 ? '/users' : '/profile')),
    );
};
