import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import {
    ExpiringBatch, InventoryOnHandRow, LowStockAlert, PurchaseSummary, SalesSummary, TopProduct,
} from './reports.types';

const api = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class ReportsService {
    private readonly http = inject(HttpClient);
    private readonly base = `${api}/api/reports`;

    salesSummary = (params?: { fromDate?: string; toDate?: string; outletId?: string }): Observable<SalesSummary> =>
        this.http.get<SalesSummary>(`${this.base}/sales-summary${this.qs(params)}`);

    topProducts = (params?: { fromDate?: string; toDate?: string; outletId?: string; take?: number }): Observable<TopProduct[]> =>
        this.http.get<TopProduct[]>(`${this.base}/top-products${this.qs(params)}`);

    inventoryOnHand = (params?: { outletId?: string; categoryId?: string; onlyInStock?: boolean; take?: number }): Observable<InventoryOnHandRow[]> =>
        this.http.get<InventoryOnHandRow[]>(`${this.base}/inventory-on-hand${this.qs(params)}`);

    lowStock = (params?: { outletId?: string; take?: number }): Observable<LowStockAlert[]> =>
        this.http.get<LowStockAlert[]>(`${this.base}/low-stock${this.qs(params)}`);

    expiringBatches = (params?: { outletId?: string; withinDays?: number; take?: number }): Observable<ExpiringBatch[]> =>
        this.http.get<ExpiringBatch[]>(`${this.base}/expiring-batches${this.qs(params)}`);

    purchaseSummary = (params?: { fromDate?: string; toDate?: string; outletId?: string }): Observable<PurchaseSummary> =>
        this.http.get<PurchaseSummary>(`${this.base}/purchase-summary${this.qs(params)}`);

    private qs(p: Record<string, any> | undefined): string {
        if (!p) return '';
        const qs = new URLSearchParams();
        Object.entries(p).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') qs.append(k, String(v)); });
        return qs.toString() ? `?${qs}` : '';
    }
}
