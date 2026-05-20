import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { FeeInvoiceDto, CreateFeeInvoiceRequest, UpdateFeeInvoiceRequest, SearchFeeInvoicesRequest, PaginationResponse, FeeAnalytics, InvoiceStatus, FeeDuesDto, FeeCollectionReportDto } from './fee-invoices.types';

@Injectable({ providedIn: 'root' })
export class FeeInvoicesService {
    private baseUrl = `${environment.apiUrl}/api/v1/feeinvoices`;

    constructor(private http: HttpClient) {}

    search(request: SearchFeeInvoicesRequest): Observable<PaginationResponse<FeeInvoiceDto>> {
        return this.http.post<PaginationResponse<FeeInvoiceDto>>(`${this.baseUrl}/search`, request);
    }

    getById(id: string): Observable<FeeInvoiceDto> {
        return this.http.get<FeeInvoiceDto>(`${this.baseUrl}/${id}`);
    }

    create(request: CreateFeeInvoiceRequest): Observable<string> {
        return this.http.post(`${this.baseUrl}`, request, { responseType: 'text' });
    }

    update(id: string, request: UpdateFeeInvoiceRequest): Observable<string> {
        return this.http.put(`${this.baseUrl}/${id}`, request, { responseType: 'text' });
    }

    delete(id: string): Observable<string> {
        return this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' });
    }

    /** Phase E3 — outstanding dues per student. */
    getDues(opts?: { classId?: string; academicYearId?: string; overdueOnly?: boolean }): Observable<FeeDuesDto[]> {
        const params: string[] = [];
        if (opts?.classId) params.push(`classId=${opts.classId}`);
        if (opts?.academicYearId) params.push(`academicYearId=${opts.academicYearId}`);
        if (opts?.overdueOnly) params.push('overdueOnly=true');
        const qs = params.length ? '?' + params.join('&') : '';
        return this.http.get<FeeDuesDto[]>(`${this.baseUrl}/dues${qs}`);
    }

    /** Phase E3 — fee collection report for a date range. */
    getCollectionReport(opts?: { from?: string; to?: string; bucket?: 'Day' | 'Month'; classId?: string }): Observable<FeeCollectionReportDto> {
        const params: string[] = [];
        if (opts?.from) params.push(`from=${opts.from}`);
        if (opts?.to) params.push(`to=${opts.to}`);
        if (opts?.bucket) params.push(`bucket=${opts.bucket}`);
        if (opts?.classId) params.push(`classId=${opts.classId}`);
        const qs = params.length ? '?' + params.join('&') : '';
        return this.http.get<FeeCollectionReportDto>(`${this.baseUrl}/reports/collection${qs}`);
    }

    getAnalytics(): Observable<FeeAnalytics> {
        return this.search({ pageNumber: 1, pageSize: 1000 }).pipe(
            map(response => this.computeFeeAnalytics(response.data))
        );
    }

    private computeFeeAnalytics(invoices: FeeInvoiceDto[]): FeeAnalytics {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        let totalInvoiced = 0;
        let totalCollected = 0;
        let totalOutstanding = 0;
        let overdueCount = 0;
        let overdueAmount = 0;
        let thisMonthCollected = 0;

        const buckets = new Map<InvoiceStatus, { count: number; amount: number }>();

        for (const inv of invoices) {
            totalInvoiced += inv.totalAmount || 0;
            totalCollected += inv.paidAmount || 0;
            totalOutstanding += inv.balanceAmount || 0;

            const isOverdue = inv.status === InvoiceStatus.Overdue
                || (inv.dueDate && new Date(inv.dueDate) < now && (inv.balanceAmount || 0) > 0);
            if (isOverdue) {
                overdueCount++;
                overdueAmount += inv.balanceAmount || 0;
            }

            if (inv.paidDate && new Date(inv.paidDate) >= monthStart) {
                thisMonthCollected += inv.paidAmount || 0;
            }

            const key = inv.status as InvoiceStatus;
            const current = buckets.get(key) || { count: 0, amount: 0 };
            current.count++;
            current.amount += inv.totalAmount || 0;
            buckets.set(key, current);
        }

        const statusLabels: Record<InvoiceStatus, string> = {
            [InvoiceStatus.Pending]: 'Pending',
            [InvoiceStatus.Partial]: 'Partial',
            [InvoiceStatus.Paid]: 'Paid',
            [InvoiceStatus.Overdue]: 'Overdue',
            [InvoiceStatus.Cancelled]: 'Cancelled',
            [InvoiceStatus.Refunded]: 'Refunded',
            [InvoiceStatus.Disputed]: 'Disputed',
            [InvoiceStatus.OnHold]: 'On Hold'
        };

        const statusBreakdown = Array.from(buckets.entries()).map(([status, v]) => ({
            status: statusLabels[status] || 'Unknown',
            count: v.count,
            amount: v.amount
        }));

        return {
            totalInvoices: invoices.length,
            totalInvoiced,
            totalCollected,
            totalOutstanding,
            overdueCount,
            overdueAmount,
            thisMonthCollected,
            collectionRate: totalInvoiced > 0 ? (totalCollected / totalInvoiced) * 100 : 0,
            statusBreakdown
        };
    }
}
