import { inject } from '@angular/core';
import { PermissionsService } from 'app/core/auth/permissions.service';
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

    // Load the user's permissions FIRST so NavigationService can filter the tree
    // before publishing it. The auxiliary streams (messages / notifications /
    // chat / shortcuts) can run in parallel with navigation once permissions
    // are in. Errors are swallowed — the auth interceptor handles 401 redirects.
    return permissionsService.load().pipe(
        catchError(() => of([] as string[])),
        switchMap(() => forkJoin([
            navigationService.get().pipe(catchError(() => of(null))),
            messagesService.getAll().pipe(catchError(() => of([]))),
            notificationsService.getAll().pipe(catchError(() => of([]))),
            quickChatService.getChats().pipe(catchError(() => of([]))),
            shortcutsService.getAll().pipe(catchError(() => of([]))),
        ])),
    );
};
