import { inject } from '@angular/core';
import { FeaturesService } from 'app/core/auth/features.service';
import { PermissionsService } from 'app/core/auth/permissions.service';
import { TenantInfoService } from 'app/core/auth/tenant-info.service';
import { LanguageService } from 'app/core/i18n/language.service';
import { NavigationService } from 'app/core/navigation/navigation.service';
import { UserService } from 'app/core/user/user.service';
import { MessagesService } from 'app/layout/common/messages/messages.service';
import { NotificationsService } from 'app/layout/common/notifications/notifications.service';
import { QuickChatService } from 'app/layout/common/quick-chat/quick-chat.service';
import { ShortcutsService } from 'app/layout/common/shortcuts/shortcuts.service';
import { catchError, forkJoin, of, switchMap, tap } from 'rxjs';

export const initialDataResolver = () =>
{
    const messagesService = inject(MessagesService);
    const navigationService = inject(NavigationService);
    const notificationsService = inject(NotificationsService);
    const quickChatService = inject(QuickChatService);
    const shortcutsService = inject(ShortcutsService);
    const permissionsService = inject(PermissionsService);
    const featuresService = inject(FeaturesService);
    const tenantInfoService = inject(TenantInfoService);
    const userService = inject(UserService);
    const languageService = inject(LanguageService);

    // Load permissions + tenant features + tenant identity + profile FIRST
    // so NavigationService can filter the tree and LanguageService can pick
    // the correct active lang (user > tenant > 'en') before nav strings render.
    // Auxiliary streams run in parallel afterward. Errors are swallowed —
    // the auth interceptor handles 401s.
    return forkJoin([
        permissionsService.load().pipe(catchError(() => of([] as string[]))),
        featuresService.load().pipe(catchError(() => of([] as string[]))),
        tenantInfoService.load().pipe(catchError(() => of(null))),
        userService.get().pipe(catchError(() => of(null))),
    ]).pipe(
        tap(([, , tenant, user]) => {
            languageService.applyFromServer(
                (user as { preferredLanguage?: string } | null)?.preferredLanguage ?? null,
                tenant?.defaultLanguage ?? null,
            );
        }),
        switchMap(() => forkJoin([
            navigationService.get().pipe(catchError(() => of(null))),
            messagesService.getAll().pipe(catchError(() => of([]))),
            notificationsService.getAll().pipe(catchError(() => of([]))),
            quickChatService.getChats().pipe(catchError(() => of([]))),
            shortcutsService.getAll().pipe(catchError(() => of([]))),
        ])),
    );
};
