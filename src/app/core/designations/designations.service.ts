import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
    DesignationDto,
    CreateDesignationRequest,
    UpdateDesignationRequest,
    SearchDesignationsRequest,
    PaginationResponse,
} from './designations.types';

@Injectable({ providedIn: 'root' })
export class DesignationsService {
    private readonly baseUrl = `${environment.apiUrl}/api/v1/designations`;

    constructor(private http: HttpClient) {}

    search(request: SearchDesignationsRequest): Observable<PaginationResponse<DesignationDto>> {
        return this.http.post<PaginationResponse<DesignationDto>>(`${this.baseUrl}/search`, request);
    }

    getById(id: string): Observable<DesignationDto> {
        return this.http.get<DesignationDto>(`${this.baseUrl}/${id}`);
    }

    create(request: CreateDesignationRequest): Observable<string> {
        return this.http.post(this.baseUrl, request, { responseType: 'text' });
    }

    update(id: string, request: UpdateDesignationRequest): Observable<string> {
        return this.http.put(`${this.baseUrl}/${id}`, request, { responseType: 'text' });
    }

    delete(id: string): Observable<string> {
        return this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' });
    }
}
