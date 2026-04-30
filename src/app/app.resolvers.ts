import { inject } from '@angular/core';
import { FeaturesService } from 'app/core/auth/features.service';
import { PermissionsService } from 'app/core/auth/permissions.service';
import { TenantInfoService } from 'app/core/auth/tenant-info.service';
import { NavigationService } from 'app/core/navigation/navigation.service';
import { MessagesService } from 'app/layout/common/messages/messages.service';
import { NotificationsService } from 'app/layout/common/notifications/notifications.service';
import { QuickChatService } from 'app/layout/common/quick-chat/quick-chat.service';
import { ShortcutsService } from 'app/layout/common/shortcuts/shortcuts.service';
import { catchError, forkJoin, of, switchMap } from 'rxjs';

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

    // Load permissions + tenant features + tenant identity FIRST so
    // NavigationService can filter the tree by all three before publishing it.
    // The auxiliary streams run in parallel afterward. Errors are swallowed —
    // the auth interceptor handles 401s.
    return forkJoin([
        permissionsService.load().pipe(catchError(() => of([] as string[]))),
        featuresService.load().pipe(catchError(() => of([] as string[]))),
        tenantInfoService.load().pipe(catchError(() => of(null))),
    ]).pipe(
        switchMap(() => forkJoin([
            navigationService.get().pipe(catchError(() => of(null))),
            messagesService.getAll().pipe(catchError(() => of([]))),
            notificationsService.getAll().pipe(catchError(() => of([]))),
            quickChatService.getChats().pipe(catchError(() => of([]))),
            shortcutsService.getAll().pipe(catchError(() => of([]))),
        ])),
    );
};
