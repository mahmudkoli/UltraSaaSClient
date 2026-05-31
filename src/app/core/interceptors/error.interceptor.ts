import { HttpContextToken, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from 'app/core/services/notification.service';
import { extractApiError } from 'app/core/utils/api-error';

/**
 * Requests whose component surfaces its own error UI (inline message / their own
 * snackbar) set this to true to opt out of the global error toast and avoid
 * double feedback. Usage: `{ context: new HttpContext().set(SKIP_ERROR_TOAST, true) }`.
 */
export const SKIP_ERROR_TOAST = new HttpContextToken<boolean>(() => false);

/**
 * Global HTTP error toast. 401 is owned by the auth interceptor (token refresh +
 * redirect), so it is skipped here. Every other error surfaces a toast via the
 * shared NotificationService unless the caller opted out via SKIP_ERROR_TOAST.
 * The error is always rethrown so component-level handling still runs.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    // inject() must run here (the injection context), not inside the catchError callback.
    const notify = inject(NotificationService);
    const transloco = inject(TranslocoService);
    return next(req).pipe(
        catchError((err: HttpErrorResponse) => {
            if (err.status !== 401 && !req.context.get(SKIP_ERROR_TOAST)) {
                notify.error(extractApiError(err, transloco.translate('COMMON.UNEXPECTED_ERROR')));
            }
            return throwError(() => err);
        }),
    );
};
