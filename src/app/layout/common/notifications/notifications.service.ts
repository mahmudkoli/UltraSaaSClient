import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, ReplaySubject, of, switchMap, take, tap } from 'rxjs';
import { environment } from 'environments/environment';
import { Notification } from 'app/layout/common/notifications/notifications.types';
import { TenantNotificationDto } from 'app/core/billing/billing.types';

/**
 * Phase 2.48 — re-wired from the Fuse mock-API to the real backend. Reads
 * /api/notifications (audience-filtered server-side by the caller's
 * Subscription.View permission) and POSTs /api/notifications/{id}/read on
 * mark-read. The mock create / update / delete paths are kept as no-ops so
 * the existing Fuse component template compiles unchanged — we just don't
 * surface those actions in practice (server is the source of truth).
 */
@Injectable({ providedIn: 'root' })
export class NotificationsService {
    private readonly http = inject(HttpClient);
    private readonly _notifications: ReplaySubject<Notification[]> = new ReplaySubject<Notification[]>(1);

    get notifications$(): Observable<Notification[]> {
        return this._notifications.asObservable();
    }

    /**
     * Phase 2.56c — bell drawer is now an *inbox* (unread-only). Read history
     * lives on the full <code>/notifications</code> page. This collapses the
     * mental model to Gmail / Slack / GitHub: badge = unread count = drawer
     * size; "Mark all as read" empties the drawer to inbox-zero; the archive
     * is one click away.
     */
    getAll(): Observable<Notification[]> {
        return this.http
            .get<TenantNotificationDto[]>(`${environment.apiUrl}/api/notifications?unreadOnly=true`)
            .pipe(
                tap(list => this._notifications.next((list ?? []).map(this.toFuseNotification))),
                switchMap(() => this.notifications$.pipe(take(1))),
            );
    }

    /** Backend has no concept of `read=false` after a row was marked read, so
     * "toggle" is one-way: mark-read only. Untoggling is a no-op. */
    update(id: string, _patch: Partial<Notification>): Observable<Notification | null> {
        return this.notifications$.pipe(
            take(1),
            switchMap(list => {
                const idx = list.findIndex(n => n.id === id);
                if (idx === -1) return of<Notification | null>(null);
                if (list[idx].read) return of<Notification | null>(list[idx]); // already read — no-op
                return this.http
                    .post(`${environment.apiUrl}/api/notifications/${encodeURIComponent(id)}/read`, {})
                    .pipe(switchMap(() => {
                        const updated: Notification = { ...list[idx], read: true };
                        const next = [...list];
                        next[idx] = updated;
                        this._notifications.next(next);
                        return of<Notification | null>(updated);
                    }));
            }),
        );
    }

    /** Mark all unread as read. Best-effort — sequential per-id POSTs (10–20
     * unreads tops in practice; if it grows we'll add a bulk endpoint). */
    markAllAsRead(): Observable<boolean> {
        return this.notifications$.pipe(
            take(1),
            switchMap(async (list) => {
                const unread = (list || []).filter(n => !n.read);
                if (unread.length === 0) return true;
                for (const n of unread) {
                    try {
                        await this.http.post(`${environment.apiUrl}/api/notifications/${encodeURIComponent(n.id)}/read`, {}).toPromise();
                    } catch { /* swallow individual failures so one bad row doesn't tank the rest */ }
                }
                this._notifications.next(list.map(n => ({ ...n, read: true })));
                return true;
            }),
        );
    }

    /** Create / delete are no-ops in v1 — backend is the source of truth and
     * platform-admin announcements come in via /api/announcements, not this
     * service. Kept on the interface so the Fuse template still compiles. */
    create(notification: Notification): Observable<Notification> { return of(notification); }
    delete(_id: string): Observable<boolean> { return of(true); }

    private toFuseNotification(dto: TenantNotificationDto): Notification {
        // Icon picker by category + severity. Heroicons-outline shipped via Fuse
        // svgIcon registry — same set the rest of the app uses.
        let icon = 'heroicons_outline:bell';
        if (dto.category === 'Subscription') icon = 'heroicons_outline:credit-card';
        else if (dto.category === 'Announcement') icon = 'heroicons_outline:megaphone';
        if (dto.severity === 'Urgent') icon = 'heroicons_outline:exclamation-triangle';

        return {
            id: dto.id,
            icon,
            title: dto.title,
            description: dto.body,
            time: dto.createdOn,
            link: dto.linkUrl,
            useRouter: !!dto.linkUrl && dto.linkUrl.startsWith('/'),
            read: !!dto.readOn,
        };
    }
}
