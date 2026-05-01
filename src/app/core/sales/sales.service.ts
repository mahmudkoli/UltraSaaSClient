import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { PaginationFilter, PaginationResponse } from 'app/core/common/pagination.types';
import {
    CreateSaleRequest, CreateSaleReturnRequest, CustomerDto, SaleDto, SaleReturnDto, WarrantyDto,
} from './sales.types';

export interface SearchSalesRequest extends PaginationFilter {
    outletId?: string;
    customerId?: string;
    fromDate?: string;
    toDate?: string;
    status?: 'Draft' | 'Finalized' | 'Voided';
}

export interface SearchSaleReturnsRequest extends PaginationFilter {
    outletId?: string;
    customerId?: string;
    fromDate?: string;
    toDate?: string;
    status?: 'Draft' | 'Completed' | 'Voided';
}

export interface SearchCustomersRequest extends PaginationFilter {
    customerType?: 'Retail' | 'Wholesale' | 'Corporate';
    isActive?: boolean;
}

export interface SearchWarrantiesRequest extends PaginationFilter {
    customerId?: string;
    status?: 'Active' | 'Expired' | 'Void';
    onlyActive?: boolean;
}

const api = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class CustomersService {
    private readonly http = inject(HttpClient);
    private readonly base = `${api}/api/customers`;
    getAll = (search?: string): Observable<CustomerDto[]> =>
        this.http.get<CustomerDto[]>(search ? `${this.base}?search=${encodeURIComponent(search)}` : this.base);
    get = (id: string): Observable<CustomerDto> => this.http.get<CustomerDto>(`${this.base}/${id}`);
    create = (req: Partial<CustomerDto>): Observable<string> => this.http.post<string>(this.base, req);
    update = (id: string, req: Partial<CustomerDto>): Observable<string> =>
        this.http.put<string>(`${this.base}/${id}`, { ...req, id });
    delete = (id: string): Observable<string> => this.http.delete<string>(`${this.base}/${id}`);
    search = (req: SearchCustomersRequest): Observable<PaginationResponse<CustomerDto>> =>
        this.http.post<PaginationResponse<CustomerDto>>(`${this.base}/search`, req);
}

@Injectable({ providedIn: 'root' })
export class SalesService {
    private readonly http = inject(HttpClient);
    private readonly base = `${api}/api/sales`;
    getAll = (params?: { outletId?: string; customerId?: string; fromDate?: string; toDate?: string; take?: number }): Observable<SaleDto[]> => {
        const qs = new URLSearchParams();
        if (params?.outletId) qs.append('outletId', params.outletId);
        if (params?.customerId) qs.append('customerId', params.customerId);
        if (params?.fromDate) qs.append('fromDate', params.fromDate);
        if (params?.toDate) qs.append('toDate', params.toDate);
        if (params?.take !== undefined) qs.append('take', String(params.take));
        return this.http.get<SaleDto[]>(qs.toString() ? `${this.base}?${qs}` : this.base);
    };
    get = (id: string): Observable<SaleDto> => this.http.get<SaleDto>(`${this.base}/${id}`);
    create = (req: CreateSaleRequest): Observable<string> => this.http.post<string>(this.base, req);
    /** Server-side paginated / sortable / filterable search. */
    search = (req: SearchSalesRequest): Observable<PaginationResponse<SaleDto>> =>
        this.http.post<PaginationResponse<SaleDto>>(`${this.base}/search`, req);
}

@Injectable({ providedIn: 'root' })
export class SaleReturnsService {
    private readonly http = inject(HttpClient);
    private readonly base = `${api}/api/salereturns`;
    getAll = (params?: { outletId?: string; customerId?: string }): Observable<SaleReturnDto[]> => {
        const qs = new URLSearchParams();
        if (params?.outletId) qs.append('outletId', params.outletId);
        if (params?.customerId) qs.append('customerId', params.customerId);
        return this.http.get<SaleReturnDto[]>(qs.toString() ? `${this.base}?${qs}` : this.base);
    };
    get = (id: string): Observable<SaleReturnDto> => this.http.get<SaleReturnDto>(`${this.base}/${id}`);
    getBySale = (saleId: string): Observable<SaleReturnDto[]> =>
        this.http.get<SaleReturnDto[]>(`${this.base}/by-sale/${saleId}`);
    create = (req: CreateSaleReturnRequest): Observable<string> => this.http.post<string>(this.base, req);
    search = (req: SearchSaleReturnsRequest): Observable<PaginationResponse<SaleReturnDto>> =>
        this.http.post<PaginationResponse<SaleReturnDto>>(`${this.base}/search`, req);
}

@Injectable({ providedIn: 'root' })
export class WarrantiesService {
    private readonly http = inject(HttpClient);
    private readonly base = `${api}/api/warranties`;
    getAll = (params?: { customerId?: string; onlyActive?: boolean }): Observable<WarrantyDto[]> => {
        const qs = new URLSearchParams();
        if (params?.customerId) qs.append('customerId', params.customerId);
        if (params?.onlyActive !== undefined) qs.append('onlyActive', String(params.onlyActive));
        return this.http.get<WarrantyDto[]>(qs.toString() ? `${this.base}?${qs}` : this.base);
    };
    bySerial = (serial: string): Observable<WarrantyDto | null> =>
        this.http.get<WarrantyDto | null>(`${this.base}/by-serial/${encodeURIComponent(serial)}`);
    search = (req: SearchWarrantiesRequest): Observable<PaginationResponse<WarrantyDto>> =>
        this.http.post<PaginationResponse<WarrantyDto>>(`${this.base}/search`, req);
}
