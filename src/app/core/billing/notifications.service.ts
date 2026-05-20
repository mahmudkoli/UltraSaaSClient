import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from '../services/base-api.service';
import { CreateAnnouncementRequest, CreateAnnouncementResponse, TenantNotificationDto } from './billing.types';

/**
 * Phase v1-C0.4 — tenant-side notification inbox. No controller-level
 * permission gate; handler does scope-aware filtering — callers without
 * Subscription.View see only AllUsers rows. Used by the bell drawer in
 * the topbar.
 *
 * createAnnouncement is platform-admin-only via Tenants.Update gating.
 */
@Injectable({ providedIn: 'root' })
export class NotificationsService extends BaseApiService {
    /** Current tenant's notifications. Pass unreadOnly=true for the badge count. */
    getMine(unreadOnly = false): Observable<TenantNotificationDto[]> {
        return this.get<TenantNotificationDto[]>(`/api/notifications?unreadOnly=${unreadOnly}`);
    }

    /** Mark a single notification as read. Idempotent. */
    markRead(id: string): Observable<void> {
        return this.post<void>(`/api/notifications/${id}/read`, {});
    }

    /** Platform-admin broadcast — fans out a notification per matched tenant. */
    createAnnouncement(request: CreateAnnouncementRequest): Observable<CreateAnnouncementResponse> {
        return this.post<CreateAnnouncementResponse>('/api/announcements', request);
    }
}
