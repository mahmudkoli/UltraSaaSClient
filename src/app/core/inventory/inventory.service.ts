import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { PaginationFilter, PaginationResponse } from 'app/core/common/pagination.types';
import { CreateStockAdjustmentRequest, CreateStockTransferRequest, ProductElectronicsDto, StockAdjustmentDto, StockDto, StockMovementDto, StockSerialDto, StockTransferDto } from './inventory.types';

const api = environment.apiUrl;

export interface SearchStockSerialsRequest extends PaginationFilter {
    productId?: string;
    outletId?: string;
    status?: string;
}

export interface SearchStockTransfersRequest extends PaginationFilter {
    fromOutletId?: string;
    toOutletId?: string;
    fromDate?: string;
    toDate?: string;
    status?: 'Draft' | 'InTransit' | 'Received' | 'Cancelled';
}

export interface SearchStockAdjustmentsRequest extends PaginationFilter {
    outletId?: string;
    productId?: string;
    fromDate?: string;
    toDate?: string;
    reason?: string;
}

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
    search = (req: SearchStockSerialsRequest): Observable<PaginationResponse<StockSerialDto>> =>
        this.http.post<PaginationResponse<StockSerialDto>>(`${this.base}/search`, req);
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

@Injectable({ providedIn: 'root' })
export class StockTransfersService {
    private readonly http = inject(HttpClient);
    private readonly base = `${api}/api/stocktransfers`;

    create = (req: CreateStockTransferRequest): Observable<string> =>
        this.http.post<string>(this.base, req);

    dispatch = (id: string): Observable<string> =>
        this.http.post<string>(`${this.base}/${id}/dispatch`, {});

    receive = (id: string): Observable<string> =>
        this.http.post<string>(`${this.base}/${id}/receive`, {});

    cancel = (id: string): Observable<string> =>
        this.http.post<string>(`${this.base}/${id}/cancel`, {});

    get = (id: string): Observable<StockTransferDto> =>
        this.http.get<StockTransferDto>(`${this.base}/${id}`);

    getAll = (params?: { fromOutletId?: string; toOutletId?: string; take?: number }): Observable<StockTransferDto[]> => {
        const qs = new URLSearchParams();
        if (params?.fromOutletId) qs.append('fromOutletId', params.fromOutletId);
        if (params?.toOutletId) qs.append('toOutletId', params.toOutletId);
        if (params?.take !== undefined) qs.append('take', String(params.take));
        return this.http.get<StockTransferDto[]>(qs.toString() ? `${this.base}?${qs}` : this.base);
    };

    search = (req: SearchStockTransfersRequest): Observable<PaginationResponse<StockTransferDto>> =>
        this.http.post<PaginationResponse<StockTransferDto>>(`${this.base}/search`, req);
}

@Injectable({ providedIn: 'root' })
export class StockAdjustmentsService {
    private readonly http = inject(HttpClient);
    private readonly base = `${api}/api/stockadjustments`;

    create = (req: CreateStockAdjustmentRequest): Observable<string> =>
        this.http.post<string>(this.base, req);

    getAll = (params?: { productId?: string; outletId?: string; take?: number }): Observable<StockAdjustmentDto[]> => {
        const qs = new URLSearchParams();
        if (params?.productId) qs.append('productId', params.productId);
        if (params?.outletId) qs.append('outletId', params.outletId);
        if (params?.take !== undefined) qs.append('take', String(params.take));
        return this.http.get<StockAdjustmentDto[]>(qs.toString() ? `${this.base}?${qs}` : this.base);
    };

    search = (req: SearchStockAdjustmentsRequest): Observable<PaginationResponse<StockAdjustmentDto>> =>
        this.http.post<PaginationResponse<StockAdjustmentDto>>(`${this.base}/search`, req);
}
