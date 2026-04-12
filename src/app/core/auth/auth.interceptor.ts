import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from 'app/core/auth/auth.service';
import { TenantService } from 'app/core/tenant/tenant.service';
import { catchError, Observable, throwError, switchMap } from 'rxjs';

/**
 * Intercept
 *
 * @param req
 * @param next
 */
export const authInterceptor = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> =>
{
    const authService = inject(AuthService);
    const tenantService = inject(TenantService);

    // Get the token and resolve tenant (subdomain or localStorage)
    const token = localStorage.getItem('access_token');
    const tenantId = tenantService.resolve();

    // Clone the request and add headers
    let newReq = req.clone();

    // Add auth token (skip for login/token endpoints)
    if (token && !req.url.includes('/api/tokens')) {
        newReq = newReq.clone({
            headers: newReq.headers.set('Authorization', `Bearer ${token}`)
        });
    }

    // Always add tenant header
    if (tenantId) {
        newReq = newReq.clone({
            headers: newReq.headers.set('tenant', tenantId)
        });
    }

    // Response
    return next(newReq).pipe(
        catchError((error) =>
        {
            // Catch "401 Unauthorized" responses
            if ( error instanceof HttpErrorResponse && error.status === 401 )
            {
                // Try to refresh the token
                const refreshToken = localStorage.getItem('refresh_token');
                const currentToken = localStorage.getItem('access_token');
                
                if (refreshToken && currentToken) {
                    return authService.refreshToken({
                        token: currentToken,
                        refreshToken: refreshToken
                    }).pipe(
                        switchMap((response) => {
                            // Retry the original request with the new token
                            const newToken = response.token;
                            const retryRequest = newReq.clone({
                                headers: newReq.headers
                                    .set('Authorization', `Bearer ${newToken}`)
                                    .set('tenant', tenantId || '')
                            });
                            return next(retryRequest);
                        }),
                        catchError((refreshError) => {
                            // If refresh fails, logout the user
                            authService.logout();
                            return throwError(() => refreshError);
                        })
                    );
                } else {
                    // No refresh token available, logout the user
                    authService.logout();
                }
            }

            return throwError(() => error);
        }),
    );
};
