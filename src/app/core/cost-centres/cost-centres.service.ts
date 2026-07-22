import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
    CostCentreDto,
    CreateCostCentreRequest,
    UpdateCostCentreRequest,
    SearchCostCentresRequest,
    PaginationResponse,
} from './cost-centres.types';

@Injectable({ providedIn: 'root' })
export class CostCentresService {
    private readonly baseUrl = `${environment.apiUrl}/api/v1/costcentres`;

    constructor(private http: HttpClient) {}

    search(request: SearchCostCentresRequest): Observable<PaginationResponse<CostCentreDto>> {
        return this.http.post<PaginationResponse<CostCentreDto>>(`${this.baseUrl}/search`, request);
    }

    getById(id: string): Observable<CostCentreDto> {
        return this.http.get<CostCentreDto>(`${this.baseUrl}/${id}`);
    }

    create(request: CreateCostCentreRequest): Observable<string> {
        return this.http.post(this.baseUrl, request, { responseType: 'text' });
    }

    update(id: string, request: UpdateCostCentreRequest): Observable<string> {
        return this.http.put(`${this.baseUrl}/${id}`, request, { responseType: 'text' });
    }

    delete(id: string): Observable<string> {
        return this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' });
    }
}
