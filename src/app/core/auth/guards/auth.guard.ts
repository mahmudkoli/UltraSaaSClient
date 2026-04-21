import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { of } from 'rxjs';

export const AuthGuard: CanActivateFn | CanActivateChildFn = (route, state) =>
{
    const router: Router = inject(Router);
    const authService: AuthService = inject(AuthService);

    const token = authService.getAccessToken();

    if (token && !AuthUtils.isTokenExpired(token)) {
        return of(true);
    }

    // Token missing or expired — clear any stale state before redirecting
    if (token) {
        authService.logout();
    }

    const redirectURL = state.url === '/sign-out' ? '' : `redirectURL=${state.url}`;
    const urlTree = router.parseUrl(`sign-in?${redirectURL}`);

    return of(urlTree);
};
