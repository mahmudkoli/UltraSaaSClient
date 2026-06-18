import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { PermissionsService } from 'app/core/auth/permissions.service';
import { map, Observable } from 'rxjs';

/**
 * Route-level mirror of the nav permission filter. Reads the route's
 * `data.permission` (a BE `Permissions.<Resource>.<Action>` string) and lets the
 * activation through only if the user holds it; otherwise redirects to the
 * student/self-service landing (`/my-profile`).
 *
 * Routes WITHOUT a `data.permission` (self-service: `my-profile`, `profile`) are
 * always allowed. Defense-in-depth on top of the menu filter — the BE
 * `[MustHavePermission]` gate remains the real authority.
 */
export const PermissionGuard: CanActivateFn | CanActivateChildFn = (route): Observable<boolean> | boolean => {
    const required = route.data?.['permission'] as string | undefined;
    if (!required) return true;

    const permissions = inject(PermissionsService);
    const router = inject(Router);

    return permissions.ensureLoaded().pipe(
        map((perms) => {
            if (perms.has(required)) return true;
            router.navigate(['/my-profile']);
            return false;
        }),
    );
};
