import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FeeStructureDto, CreateFeeStructureRequest, UpdateFeeStructureRequest, SearchFeeStructuresRequest, PaginationResponse } from './fee-structures.types';

@Injectable({ providedIn: 'root' })
export class FeeStructuresService {
    private baseUrl = `${environment.apiUrl}/api/v1/feestructures`;

    constructor(private http: HttpClient) {}

    search(request: SearchFeeStructuresRequest): Observable<PaginationResponse<FeeStructureDto>> {
        return this.http.post<PaginationResponse<FeeStructureDto>>(`${this.baseUrl}/search`, request);
    }

    getById(id: string): Observable<FeeStructureDto> {
        return this.http.get<FeeStructureDto>(`${this.baseUrl}/${id}`);
    }

    create(request: CreateFeeStructureRequest): Observable<string> {
        return this.http.post(`${this.baseUrl}`, request, { responseType: 'text' });
    }

    update(id: string, request: UpdateFeeStructureRequest): Observable<string> {
        return this.http.put(`${this.baseUrl}/${id}`, request, { responseType: 'text' });
    }

    delete(id: string): Observable<string> {
        return this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' });
    }
}
