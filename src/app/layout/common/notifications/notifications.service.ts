import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, ReplaySubject, forkJoin, map, of, switchMap, take, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Notification } from 'app/layout/common/notifications/notifications.types';

interface TenantNotificationDto {
    id: string;
    tenantId: string;
    title: string;
    body: string;
    severity: 'Info' | 'Warning' | 'Urgent';
    source: 'System' | 'Admin';
    category: 'Subscription' | 'Announcement' | 'Other';
    audience: string;
    linkUrl?: string;
    readOn?: string;
    createdOn: string;
}

function severityToIcon(s: TenantNotificationDto['severity']): string {
    switch (s) {
        case 'Urgent': return 'heroicons_outline:exclamation-circle';
        case 'Warning': return 'heroicons_outline:bell-alert';
        default: return 'heroicons_outline:information-circle';
    }
}

function mapDto(d: TenantNotificationDto): Notification {
    return {
        id: d.id,
        icon: severityToIcon(d.severity),
        title: d.title,
        description: d.body,
        time: d.createdOn,
        link: d.linkUrl,
        useRouter: !!d.linkUrl && d.linkUrl.startsWith('/'),
        read: !!d.readOn,
    };
}

@Injectable({ providedIn: 'root' })
export class NotificationsService {
    private _http = inject(HttpClient);
    private _baseUrl = environment.apiUrl;
    private _notifications = new ReplaySubject<Notification[]>(1);

    get notifications$(): Observable<Notification[]> {
        return this._notifications.asObservable();
    }

    private _headers(): HttpHeaders {
        const token = localStorage.getItem('access_token');
        const tenant = localStorage.getItem('tenant_id');
        let h = new HttpHeaders({ 'Content-Type': 'application/json' });
        if (token) h = h.set('Authorization', `Bearer ${token}`);
        if (tenant) h = h.set('tenant', tenant);
        return h;
    }

    getAll(): Observable<Notification[]> {
        return this._http.get<TenantNotificationDto[]>(
            `${this._baseUrl}/api/notifications?unreadOnly=false`,
            { headers: this._headers() },
        ).pipe(
            map(list => list.map(mapDto)),
            tap(list => this._notifications.next(list)),
        );
    }

    create(_notification: Notification): Observable<Notification> {
        return this.notifications$.pipe(take(1), map(list => list[0]));
    }

    update(id: string, notification: Notification): Observable<Notification> {
        const reflectLocal = (read: boolean) => this.notifications$.pipe(
            take(1),
            map(list => {
                const idx = list.findIndex(n => n.id === id);
                if (idx >= 0) list[idx] = { ...list[idx], read };
                this._notifications.next([...list]);
                return list[idx];
            }),
        );
        if (notification.read) {
            return this._http.post<void>(
                `${this._baseUrl}/api/notifications/${id}/read`,
                {},
                { headers: this._headers() },
            ).pipe(switchMap(() => reflectLocal(true)));
        }
        return reflectLocal(false);
    }

    delete(id: string): Observable<boolean> {
        return this.notifications$.pipe(
            take(1),
            map(list => {
                this._notifications.next(list.filter(n => n.id !== id));
                return true;
            }),
        );
    }

    markAllAsRead(): Observable<boolean> {
        return this.notifications$.pipe(
            take(1),
            switchMap(list => {
                const unread = list.filter(n => !n.read);
                if (unread.length === 0) return of(true);
                const calls = unread.map(n => this._http.post<void>(
                    `${this._baseUrl}/api/notifications/${n.id}/read`,
                    {},
                    { headers: this._headers() },
                ));
                return forkJoin(calls).pipe(
                    tap(() => {
                        list.forEach(n => { n.read = true; });
                        this._notifications.next([...list]);
                    }),
                    map(() => true),
                );
            }),
        );
    }
}
