import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { PaginationFilter, PaginationResponse } from 'app/core/common/pagination.types';
import {
    CreateGoodsReceiptRequest, CreatePurchaseOrderRequest, GoodsReceiptDto, PurchaseOrderDto, SupplierDto,
} from './purchasing.types';

const api = environment.apiUrl;

export interface SearchSuppliersRequest extends PaginationFilter {
    isActive?: boolean;
}

export interface SearchPurchaseOrdersRequest extends PaginationFilter {
    outletId?: string;
    supplierId?: string;
    fromDate?: string;
    toDate?: string;
    status?: 'Draft' | 'Submitted' | 'PartiallyReceived' | 'Received' | 'Cancelled';
}

export interface SearchGoodsReceiptsRequest extends PaginationFilter {
    outletId?: string;
    purchaseOrderId?: string;
    fromDate?: string;
    toDate?: string;
}

@Injectable({ providedIn: 'root' })
export class SuppliersService {
    private readonly http = inject(HttpClient);
    private readonly base = `${api}/api/suppliers`;
    getAll = (search?: string): Observable<SupplierDto[]> =>
        this.http.get<SupplierDto[]>(search ? `${this.base}?search=${encodeURIComponent(search)}` : this.base);
    get = (id: string): Observable<SupplierDto> => this.http.get<SupplierDto>(`${this.base}/${id}`);
    create = (req: Partial<SupplierDto>): Observable<string> => this.http.post<string>(this.base, req);
    update = (id: string, req: Partial<SupplierDto>): Observable<string> =>
        this.http.put<string>(`${this.base}/${id}`, { ...req, id });
    delete = (id: string): Observable<string> => this.http.delete<string>(`${this.base}/${id}`);
    search = (req: SearchSuppliersRequest): Observable<PaginationResponse<SupplierDto>> =>
        this.http.post<PaginationResponse<SupplierDto>>(`${this.base}/search`, req);
}

@Injectable({ providedIn: 'root' })
export class PurchaseOrdersService {
    private readonly http = inject(HttpClient);
    private readonly base = `${api}/api/purchaseorders`;
    getAll = (params?: { outletId?: string; supplierId?: string }): Observable<PurchaseOrderDto[]> => {
        const qs = new URLSearchParams();
        if (params?.outletId) qs.append('outletId', params.outletId);
        if (params?.supplierId) qs.append('supplierId', params.supplierId);
        return this.http.get<PurchaseOrderDto[]>(qs.toString() ? `${this.base}?${qs}` : this.base);
    };
    get = (id: string): Observable<PurchaseOrderDto> => this.http.get<PurchaseOrderDto>(`${this.base}/${id}`);
    create = (req: CreatePurchaseOrderRequest): Observable<string> => this.http.post<string>(this.base, req);
    submit = (id: string): Observable<string> => this.http.post<string>(`${this.base}/${id}/submit`, {});
    cancel = (id: string): Observable<string> => this.http.post<string>(`${this.base}/${id}/cancel`, {});
    search = (req: SearchPurchaseOrdersRequest): Observable<PaginationResponse<PurchaseOrderDto>> =>
        this.http.post<PaginationResponse<PurchaseOrderDto>>(`${this.base}/search`, req);
}

@Injectable({ providedIn: 'root' })
export class GoodsReceiptsService {
    private readonly http = inject(HttpClient);
    private readonly base = `${api}/api/goodsreceipts`;
    getAll = (params?: { outletId?: string; purchaseOrderId?: string }): Observable<GoodsReceiptDto[]> => {
        const qs = new URLSearchParams();
        if (params?.outletId) qs.append('outletId', params.outletId);
        if (params?.purchaseOrderId) qs.append('purchaseOrderId', params.purchaseOrderId);
        return this.http.get<GoodsReceiptDto[]>(qs.toString() ? `${this.base}?${qs}` : this.base);
    };
    get = (id: string): Observable<GoodsReceiptDto> => this.http.get<GoodsReceiptDto>(`${this.base}/${id}`);
    create = (req: CreateGoodsReceiptRequest): Observable<string> => this.http.post<string>(this.base, req);
    search = (req: SearchGoodsReceiptsRequest): Observable<PaginationResponse<GoodsReceiptDto>> =>
        this.http.post<PaginationResponse<GoodsReceiptDto>>(`${this.base}/search`, req);
}
