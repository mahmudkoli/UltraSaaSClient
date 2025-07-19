import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { of, switchMap } from 'rxjs';

export const AuthGuard: CanActivateFn | CanActivateChildFn = (route, state) =>
{
    const router: Router = inject(Router);
    const authService: AuthService = inject(AuthService);

    // Check if user is authenticated using the new method
    if (authService.isAuthenticated()) {
        // Allow the access
        return of(true);
    }

    // If the user is not authenticated, redirect to sign-in
    const redirectURL = state.url === '/sign-out' ? '' : `redirectURL=${state.url}`;
    const urlTree = router.parseUrl(`sign-in?${redirectURL}`);

    return of(urlTree);
};
