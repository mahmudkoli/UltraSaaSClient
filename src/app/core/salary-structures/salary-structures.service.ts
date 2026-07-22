import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
    SalaryStructureDto,
    CreateSalaryStructureRequest,
    UpdateSalaryStructureRequest,
    SearchSalaryStructuresRequest,
    PaginationResponse,
} from './salary-structures.types';

@Injectable({ providedIn: 'root' })
export class SalaryStructuresService {
    private readonly baseUrl = `${environment.apiUrl}/api/v1/salarystructures`;

    constructor(private http: HttpClient) {}

    search(request: SearchSalaryStructuresRequest): Observable<PaginationResponse<SalaryStructureDto>> {
        return this.http.post<PaginationResponse<SalaryStructureDto>>(`${this.baseUrl}/search`, request);
    }

    getById(id: string): Observable<SalaryStructureDto> {
        return this.http.get<SalaryStructureDto>(`${this.baseUrl}/${id}`);
    }

    create(request: CreateSalaryStructureRequest): Observable<string> {
        return this.http.post(this.baseUrl, request, { responseType: 'text' });
    }

    update(id: string, request: UpdateSalaryStructureRequest): Observable<string> {
        return this.http.put(`${this.baseUrl}/${id}`, request, { responseType: 'text' });
    }

    delete(id: string): Observable<string> {
        return this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' });
    }
}
