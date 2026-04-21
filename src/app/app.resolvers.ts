import { inject } from '@angular/core';
import { NavigationService } from 'app/core/navigation/navigation.service';
import { MessagesService } from 'app/layout/common/messages/messages.service';
import { NotificationsService } from 'app/layout/common/notifications/notifications.service';
import { QuickChatService } from 'app/layout/common/quick-chat/quick-chat.service';
import { ShortcutsService } from 'app/layout/common/shortcuts/shortcuts.service';
import { catchError, forkJoin, of } from 'rxjs';

export const initialDataResolver = () =>
{
    const messagesService = inject(MessagesService);
    const navigationService = inject(NavigationService);
    const notificationsService = inject(NotificationsService);
    const quickChatService = inject(QuickChatService);
    const shortcutsService = inject(ShortcutsService);

    // Fork join multiple API endpoint calls to wait all of them to finish.
    // Swallow errors so that a failing auxiliary call (e.g. 401 caught by the
    // auth interceptor) does not block the route from completing — the
    // interceptor already handles the redirect.
    return forkJoin([
        navigationService.get().pipe(catchError(() => of(null))),
        messagesService.getAll().pipe(catchError(() => of([]))),
        notificationsService.getAll().pipe(catchError(() => of([]))),
        quickChatService.getChats().pipe(catchError(() => of([]))),
        shortcutsService.getAll().pipe(catchError(() => of([]))),
    ]);
};
