import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FeeStructureDetailDto, CreateFeeStructureDetailRequest, UpdateFeeStructureDetailRequest, SearchFeeStructureDetailsRequest, PaginationResponse } from './fee-structure-details.types';

@Injectable({ providedIn: 'root' })
export class FeeStructureDetailsService {
    private baseUrl = `${environment.apiUrl}/api/v1/feestructuredetails`;

    constructor(private _httpClient: HttpClient) {}

    search(request: SearchFeeStructureDetailsRequest): Observable<PaginationResponse<FeeStructureDetailDto>> {
        return this._httpClient.post<PaginationResponse<FeeStructureDetailDto>>(`${this.baseUrl}/search`, request);
    }

    getById(id: string): Observable<FeeStructureDetailDto> {
        return this._httpClient.get<FeeStructureDetailDto>(`${this.baseUrl}/${id}`);
    }

    create(request: CreateFeeStructureDetailRequest): Observable<string> {
        return this._httpClient.post(this.baseUrl, request, { responseType: 'text' });
    }

    update(id: string, request: UpdateFeeStructureDetailRequest): Observable<string> {
        return this._httpClient.put(`${this.baseUrl}/${id}`, request, { responseType: 'text' });
    }

    delete(id: string): Observable<string> {
        return this._httpClient.delete(`${this.baseUrl}/${id}`, { responseType: 'text' });
    }
}
