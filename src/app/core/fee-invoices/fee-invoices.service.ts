import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FeeInvoiceDto, CreateFeeInvoiceRequest, UpdateFeeInvoiceRequest, SearchFeeInvoicesRequest, PaginationResponse } from './fee-invoices.types';

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
}
