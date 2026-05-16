import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from 'environments/environment';
import {
    AdminDashboardDto,
    CreateAnnouncementRequest, CreateAnnouncementResponse,
    CreatePlanRequest, MySubscriptionDto, PlanDto,
    RecordPaymentRequest, TenantInvoiceDto, TenantNotificationDto, TenantPaymentDto,
    UpdatePlanRequest,
} from './billing.types';

const api = environment.apiUrl;

// ── Platform-admin: plans ──────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class PlansService {
    private readonly http = inject(HttpClient);
    private readonly base = `${api}/api/subscriptionplans`;

    getAll = (activeOnly = false): Observable<PlanDto[]> =>
        this.http.get<PlanDto[]>(activeOnly ? `${this.base}?activeOnly=true` : this.base);
    get = (id: string): Observable<PlanDto> => this.http.get<PlanDto>(`${this.base}/${id}`);
    create = (req: CreatePlanRequest): Observable<string> => this.http.post<string>(this.base, req);
    update = (id: string, req: UpdatePlanRequest): Observable<string> =>
        this.http.put<string>(`${this.base}/${id}`, { ...req, id }, { responseType: 'text' as 'json' });
}

// ── Platform-admin: tenant payments ────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class TenantPaymentsService {
    private readonly http = inject(HttpClient);
    private base = (tenantId: string) => `${api}/api/tenants/${encodeURIComponent(tenantId)}/payments`;

    getByTenant = (tenantId: string, params?: { from?: string; to?: string }): Observable<TenantPaymentDto[]> => {
        const qs = new URLSearchParams();
        if (params?.from) qs.append('from', params.from);
        if (params?.to) qs.append('to', params.to);
        const u = qs.toString() ? `${this.base(tenantId)}?${qs}` : this.base(tenantId);
        return this.http.get<TenantPaymentDto[]>(u);
    };

    record = (tenantId: string, req: Omit<RecordPaymentRequest, 'tenantId'>): Observable<string> =>
        this.http.post<string>(this.base(tenantId), req);
}

// ── Platform-admin: tenant invoices (Phase 2.54) ──────────────────────────────

@Injectable({ providedIn: 'root' })
export class TenantInvoicesService {
    private readonly http = inject(HttpClient);

    listByTenant = (tenantId: string): Observable<TenantInvoiceDto[]> =>
        this.http.get<TenantInvoiceDto[]>(`${api}/api/tenants/${encodeURIComponent(tenantId)}/invoices`);

    /** Direct-download URL for the PDF — drop it into an &lt;a [href]&gt; or window.open(). */
    pdfUrl = (invoiceId: string): string =>
        `${api}/api/tenants/invoices/${encodeURIComponent(invoiceId)}/pdf`;
}

// ── Platform-admin: announcements broadcast ────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class AnnouncementsService {
    private readonly http = inject(HttpClient);
    private readonly base = `${api}/api/announcements`;

    create = (req: CreateAnnouncementRequest): Observable<CreateAnnouncementResponse> =>
        this.http.post<CreateAnnouncementResponse>(this.base, req);
}

// ── Platform-admin: dashboard aggregation ──────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class AdminDashboardService {
    private readonly http = inject(HttpClient);
    private readonly url = `${api}/api/admindashboard`;

    get = (): Observable<AdminDashboardDto> => this.http.get<AdminDashboardDto>(this.url);
}

// ── Tenant-side: my subscription + my notifications (with 60s poll) ────────────

@Injectable({ providedIn: 'root' })
export class MyBillingService {
    private readonly http = inject(HttpClient);

    /** Cached unread count signal — poll updates it every 60s for the bell badge. */
    private readonly _unreadCount = signal<number>(0);
    readonly unreadCount = this._unreadCount.asReadonly();
    private pollHandle: ReturnType<typeof setInterval> | null = null;

    getMySubscription = (): Observable<MySubscriptionDto> =>
        this.http.get<MySubscriptionDto>(`${api}/api/mysubscription`);

    getMyPayments = (params?: { from?: string; to?: string }): Observable<TenantPaymentDto[]> => {
        const qs = new URLSearchParams();
        if (params?.from) qs.append('from', params.from);
        if (params?.to) qs.append('to', params.to);
        const u = qs.toString() ? `${api}/api/mysubscription/payments?${qs}` : `${api}/api/mysubscription/payments`;
        return this.http.get<TenantPaymentDto[]>(u);
    };

    getMyInvoices = (): Observable<TenantInvoiceDto[]> =>
        this.http.get<TenantInvoiceDto[]>(`${api}/api/mysubscription/invoices`);

    /** Direct-download URL for the tenant's own invoice PDF. */
    myInvoicePdfUrl = (invoiceId: string): string =>
        `${api}/api/mysubscription/invoices/${encodeURIComponent(invoiceId)}/pdf`;

    getMyNotifications = (unreadOnly = false): Observable<TenantNotificationDto[]> =>
        this.http.get<TenantNotificationDto[]>(
            unreadOnly ? `${api}/api/notifications?unreadOnly=true` : `${api}/api/notifications`,
        ).pipe(tap(list => this._unreadCount.set(list.filter(n => !n.readOn).length)));

    markRead = (id: string): Observable<unknown> =>
        this.http.post(`${api}/api/notifications/${encodeURIComponent(id)}/read`, {});

    /** Start a 60s poll. Idempotent — safe to call from multiple components. */
    startPolling(): void {
        if (this.pollHandle) return;
        // Fire immediately, then every 60s.
        this.refreshUnread();
        this.pollHandle = setInterval(() => this.refreshUnread(), 60_000);
    }

    stopPolling(): void {
        if (this.pollHandle) clearInterval(this.pollHandle);
        this.pollHandle = null;
    }

    private refreshUnread(): void {
        this.getMyNotifications(true).subscribe({
            next: () => { /* signal updated in tap */ },
            error: () => { /* swallow — non-Admin users get 403 if anything goes wrong; badge just stays 0 */ },
        });
    }
}
