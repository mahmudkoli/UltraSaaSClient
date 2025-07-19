import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { of } from 'rxjs';

export const NoAuthGuard: CanActivateFn | CanActivateChildFn = (route, state) =>
{
    const router: Router = inject(Router);
    const authService: AuthService = inject(AuthService);

    // If the user is authenticated, redirect to home
    if (authService.isAuthenticated()) {
        return of(router.parseUrl(''));
    }

    // Allow the access for non-authenticated users
    return of(true);
};
