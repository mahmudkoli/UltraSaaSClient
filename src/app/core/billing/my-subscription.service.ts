import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from '../services/base-api.service';
import { MySubscriptionDto, TenantInvoiceDto, TenantPaymentDto } from './billing.types';

/**
 * Phase v1-C0.4 + v1-C6 — tenant-side subscription view. Endpoints are
 * scoped to the caller's tenant (resolved server-side via Finbuckle).
 * All endpoints gated by `Subscription.View` (tenant Admin role only).
 */
@Injectable({ providedIn: 'root' })
export class MySubscriptionService extends BaseApiService {
    /** Current subscription summary — plan / ValidUpto / banner severity. */
    getMine(): Observable<MySubscriptionDto> {
        return this.get<MySubscriptionDto>('/api/mysubscription');
    }

    /** Tenant's own payment history. Optional date-range filter. */
    getPayments(from?: string, to?: string): Observable<TenantPaymentDto[]> {
        const params = new URLSearchParams();
        if (from) params.append('from', from);
        if (to) params.append('to', to);
        const qs = params.toString();
        return this.get<TenantPaymentDto[]>(`/api/mysubscription/payments${qs ? '?' + qs : ''}`);
    }

    // ── Phase v1-C6 — tax invoices ────────────────────────────────────

    /** Tenant's own tax invoices, newest first. */
    getInvoices(): Observable<TenantInvoiceDto[]> {
        return this.get<TenantInvoiceDto[]>('/api/mysubscription/invoices');
    }

    /** Download a tax invoice PDF as a Blob. Caller wraps in URL.createObjectURL. */
    downloadInvoicePdf(invoiceId: string): Observable<Blob> {
        // BaseApiService.get<T> auto-applies the JSON Content-Type, but a blob
        // request needs responseType=blob. Use the underlying HttpClient directly.
        return this._httpClient.get(`${this.baseUrl}/api/mysubscription/invoices/${invoiceId}/pdf`, {
            headers: this.getHeaders(),
            responseType: 'blob',
        });
    }
}
