import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FeeTypeDto, CreateFeeTypeRequest, UpdateFeeTypeRequest, SearchFeeTypesRequest, PaginationResponse } from './fee-types.types';

@Injectable({ providedIn: 'root' })
export class FeeTypesService {
    private baseUrl = `${environment.apiUrl}/api/v1/feetypes`;

    constructor(private http: HttpClient) {}

    search(request: SearchFeeTypesRequest): Observable<PaginationResponse<FeeTypeDto>> {
        return this.http.post<PaginationResponse<FeeTypeDto>>(`${this.baseUrl}/search`, request);
    }

    getById(id: string): Observable<FeeTypeDto> {
        return this.http.get<FeeTypeDto>(`${this.baseUrl}/${id}`);
    }

    create(request: CreateFeeTypeRequest): Observable<string> {
        return this.http.post(`${this.baseUrl}`, request, { responseType: 'text' });
    }

    update(id: string, request: UpdateFeeTypeRequest): Observable<string> {
        return this.http.put(`${this.baseUrl}/${id}`, request, { responseType: 'text' });
    }

    delete(id: string): Observable<string> {
        return this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' });
    }
}
