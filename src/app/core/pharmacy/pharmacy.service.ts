import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { PaginationFilter, PaginationResponse } from 'app/core/common/pagination.types';
import { BatchDto, PrescriptionDto, ProductPharmacyDto } from './pharmacy.types';

const api = environment.apiUrl;

export interface SearchBatchesRequest extends PaginationFilter {
    productId?: string;
    outletId?: string;
    status?: 'Active' | 'Exhausted' | 'Expired' | 'Recalled';
    onlyAvailable?: boolean;
}

export interface SearchPrescriptionsRequest extends PaginationFilter {
    patientPhone?: string;
    status?: 'Active' | 'Dispensed' | 'Expired' | 'Cancelled';
    fromDate?: string;
    toDate?: string;
}

@Injectable({ providedIn: 'root' })
export class ProductPharmacyService {
    private readonly http = inject(HttpClient);
    private readonly base = `${api}/api/product-pharmacy`;
    get = (productId: string): Observable<ProductPharmacyDto | null> =>
        this.http.get<ProductPharmacyDto | null>(`${this.base}/${productId}`);
    upsert = (productId: string, req: Partial<ProductPharmacyDto>): Observable<string> =>
        this.http.put<string>(`${this.base}/${productId}`, { ...req, productId });
}

@Injectable({ providedIn: 'root' })
export class BatchesService {
    private readonly http = inject(HttpClient);
    private readonly base = `${api}/api/batches`;
    getAll = (params?: { productId?: string; outletId?: string; onlyAvailable?: boolean }): Observable<BatchDto[]> => {
        const qs = new URLSearchParams();
        if (params?.productId) qs.append('productId', params.productId);
        if (params?.outletId) qs.append('outletId', params.outletId);
        if (params?.onlyAvailable !== undefined) qs.append('onlyAvailable', String(params.onlyAvailable));
        return this.http.get<BatchDto[]>(qs.toString() ? `${this.base}?${qs}` : this.base);
    };
    get = (id: string): Observable<BatchDto> => this.http.get<BatchDto>(`${this.base}/${id}`);
    recall = (id: string, reason?: string): Observable<string> =>
        this.http.post<string>(`${this.base}/${id}/recall`, { reason });
    search = (req: SearchBatchesRequest): Observable<PaginationResponse<BatchDto>> =>
        this.http.post<PaginationResponse<BatchDto>>(`${this.base}/search`, req);
}

@Injectable({ providedIn: 'root' })
export class PrescriptionsService {
    private readonly http = inject(HttpClient);
    private readonly base = `${api}/api/prescriptions`;
    getAll = (params?: { patientPhone?: string; onlyValid?: boolean }): Observable<PrescriptionDto[]> => {
        const qs = new URLSearchParams();
        if (params?.patientPhone) qs.append('patientPhone', params.patientPhone);
        if (params?.onlyValid !== undefined) qs.append('onlyValid', String(params.onlyValid));
        return this.http.get<PrescriptionDto[]>(qs.toString() ? `${this.base}?${qs}` : this.base);
    };
    get = (id: string): Observable<PrescriptionDto> => this.http.get<PrescriptionDto>(`${this.base}/${id}`);
    byNumber = (num: string): Observable<PrescriptionDto | null> =>
        this.http.get<PrescriptionDto | null>(`${this.base}/by-number/${encodeURIComponent(num)}`);
    create = (req: Partial<PrescriptionDto>): Observable<string> => this.http.post<string>(this.base, req);
    cancel = (id: string, reason?: string): Observable<string> =>
        this.http.post<string>(`${this.base}/${id}/cancel`, { reason });
    search = (req: SearchPrescriptionsRequest): Observable<PaginationResponse<PrescriptionDto>> =>
        this.http.post<PaginationResponse<PrescriptionDto>>(`${this.base}/search`, req);
}
