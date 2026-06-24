import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { PermissionsService } from 'app/core/auth/permissions.service';
import { NotificationService } from 'app/core/services/notification.service';
import { map, Observable } from 'rxjs';

/**
 * Route-level mirror of the nav permission filter. Reads the route's
 * `data.permission` (a BE `Permissions.<Resource>.<Action>` string) and lets the
 * activation through only if the user holds it.
 *
 * On denial it routes to the permission-aware landing (`/`), which resolves to
 * the right home per role (admins -> their dashboard, students -> /my-profile),
 * and shows an "access denied" toast — rather than silently dumping every denied
 * user on /my-profile (BUG-R2/R3, ENH-R2).
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
    const notify = inject(NotificationService);

    return permissions.ensureLoaded().pipe(
        map((perms) => {
            if (perms.has(required)) return true;
            notify.error("You don't have access to that page.");
            router.navigateByUrl('/');
            return false;
        }),
    );
};
