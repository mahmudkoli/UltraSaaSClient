import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from '../services/base-api.service';
import { AdminDashboardDto, RecordPaymentRequest, TenantInvoiceDto, TenantPaymentDto } from './billing.types';

/**
 * Phase v1-C0.4 — single-call dashboard aggregation for the root admin
 * landing page (KPIs + action queue + recent payments / signups + plan mix).
 *
 * Also wraps the platform-admin cross-tenant RecordPayment + invoice
 * download endpoints on TenantsController.
 */
@Injectable({ providedIn: 'root' })
export class AdminDashboardService extends BaseApiService {
    /** Single fat DTO that drives the entire root-admin dashboard. */
    getDashboard(): Observable<AdminDashboardDto> {
        return this.get<AdminDashboardDto>('/api/admindashboard');
    }

    /**
     * Record a payment against an arbitrary tenant. Root-admin only.
     * Triggers: ValidUpto extension, TenantPayment row, tax invoice (Phase v1-C6),
     * in-app notification, payment-received email (Phase v1-C5).
     */
    recordPayment(tenantId: string, request: RecordPaymentRequest): Observable<string> {
        return this.post<string>(`/api/tenants/${tenantId}/payments`, request);
    }

    /** List any tenant's payments — root admin cross-tenant view. */
    getTenantPayments(tenantId: string, from?: string, to?: string): Observable<TenantPaymentDto[]> {
        const params = new URLSearchParams();
        if (from) params.append('from', from);
        if (to) params.append('to', to);
        const qs = params.toString();
        return this.get<TenantPaymentDto[]>(`/api/tenants/${tenantId}/payments${qs ? '?' + qs : ''}`);
    }

    /** List any tenant's invoices — root admin cross-tenant view. */
    getTenantInvoices(tenantId: string): Observable<TenantInvoiceDto[]> {
        return this.get<TenantInvoiceDto[]>(`/api/tenants/${tenantId}/invoices`);
    }

    /** Download any tenant's invoice PDF — root admin cross-tenant. */
    downloadInvoicePdf(invoiceId: string): Observable<Blob> {
        return this._httpClient.get(`${this.baseUrl}/api/tenants/invoices/${invoiceId}/pdf`, {
            headers: this.getHeaders(),
            responseType: 'blob',
        });
    }
}
