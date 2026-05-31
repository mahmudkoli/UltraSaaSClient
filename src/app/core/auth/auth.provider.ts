import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ENVIRONMENT_INITIALIZER, EnvironmentProviders, inject, Provider } from '@angular/core';
import { authInterceptor } from 'app/core/auth/auth.interceptor';
import { errorInterceptor } from 'app/core/interceptors/error.interceptor';
import { AuthService } from 'app/core/auth/auth.service';

export const provideAuth = (): Array<Provider | EnvironmentProviders> =>
{
    return [
        // errorInterceptor first → its catchError is OUTERMOST, so it sees the
        // final error after authInterceptor's 401 refresh/redirect attempt.
        provideHttpClient(withInterceptors([errorInterceptor, authInterceptor])),
        {
            provide : ENVIRONMENT_INITIALIZER,
            useValue: () => inject(AuthService),
            multi   : true,
        },
    ];
};
