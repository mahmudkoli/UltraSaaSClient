import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
    DepartmentDto,
    CreateDepartmentRequest,
    UpdateDepartmentRequest,
    SearchDepartmentsRequest,
    PaginationResponse,
} from './departments.types';

@Injectable({ providedIn: 'root' })
export class DepartmentsService {
    private readonly baseUrl = `${environment.apiUrl}/api/v1/departments`;

    constructor(private http: HttpClient) {}

    search(request: SearchDepartmentsRequest): Observable<PaginationResponse<DepartmentDto>> {
        return this.http.post<PaginationResponse<DepartmentDto>>(`${this.baseUrl}/search`, request);
    }

    getById(id: string): Observable<DepartmentDto> {
        return this.http.get<DepartmentDto>(`${this.baseUrl}/${id}`);
    }

    create(request: CreateDepartmentRequest): Observable<string> {
        return this.http.post(this.baseUrl, request, { responseType: 'text' });
    }

    update(id: string, request: UpdateDepartmentRequest): Observable<string> {
        return this.http.put(`${this.baseUrl}/${id}`, request, { responseType: 'text' });
    }

    delete(id: string): Observable<string> {
        return this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' });
    }
}
