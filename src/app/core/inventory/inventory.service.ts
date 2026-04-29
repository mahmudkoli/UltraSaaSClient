import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { ProductElectronicsDto, StockDto, StockMovementDto, StockSerialDto } from './inventory.types';

const api = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class StocksService {
    private readonly http = inject(HttpClient);
    private readonly base = `${api}/api/stocks`;
    byOutlet = (outletId: string): Observable<StockDto[]> =>
        this.http.get<StockDto[]>(`${this.base}/by-outlet/${outletId}`);
    byProduct = (productId: string): Observable<StockDto[]> =>
        this.http.get<StockDto[]>(`${this.base}/by-product/${productId}`);
    movements = (params: { productId?: string; outletId?: string; take?: number }): Observable<StockMovementDto[]> => {
        const qs = new URLSearchParams();
        if (params.productId) qs.append('productId', params.productId);
        if (params.outletId) qs.append('outletId', params.outletId);
        if (params.take !== undefined) qs.append('take', String(params.take));
        return this.http.get<StockMovementDto[]>(`${this.base}/movements?${qs}`);
    };
}

@Injectable({ providedIn: 'root' })
export class StockSerialsService {
    private readonly http = inject(HttpClient);
    private readonly base = `${api}/api/stockserials`;
    getAll = (params?: { productId?: string; outletId?: string; status?: string }): Observable<StockSerialDto[]> => {
        const qs = new URLSearchParams();
        if (params?.productId) qs.append('productId', params.productId);
        if (params?.outletId) qs.append('outletId', params.outletId);
        if (params?.status) qs.append('status', params.status);
        return this.http.get<StockSerialDto[]>(qs.toString() ? `${this.base}?${qs}` : this.base);
    };
    bySerial = (sn: string): Observable<StockSerialDto> =>
        this.http.get<StockSerialDto>(`${this.base}/by-serial/${encodeURIComponent(sn)}`);
    create = (req: Partial<StockSerialDto>): Observable<string> => this.http.post<string>(this.base, req);
}

@Injectable({ providedIn: 'root' })
export class ProductElectronicsService {
    private readonly http = inject(HttpClient);
    private readonly base = `${api}/api/product-electronics`;
    get = (productId: string): Observable<ProductElectronicsDto | null> =>
        this.http.get<ProductElectronicsDto | null>(`${this.base}/${productId}`);
    upsert = (productId: string, req: Partial<ProductElectronicsDto>): Observable<string> =>
        this.http.put<string>(`${this.base}/${productId}`, { ...req, productId });
}
