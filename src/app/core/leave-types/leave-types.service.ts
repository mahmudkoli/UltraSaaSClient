import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
    LeaveTypeDto,
    CreateLeaveTypeRequest,
    UpdateLeaveTypeRequest,
    SearchLeaveTypesRequest,
    PaginationResponse,
} from './leave-types.types';

@Injectable({ providedIn: 'root' })
export class LeaveTypesService {
    private readonly baseUrl = `${environment.apiUrl}/api/v1/leavetypes`;

    constructor(private http: HttpClient) {}

    search(request: SearchLeaveTypesRequest): Observable<PaginationResponse<LeaveTypeDto>> {
        return this.http.post<PaginationResponse<LeaveTypeDto>>(`${this.baseUrl}/search`, request);
    }

    getById(id: string): Observable<LeaveTypeDto> {
        return this.http.get<LeaveTypeDto>(`${this.baseUrl}/${id}`);
    }

    create(request: CreateLeaveTypeRequest): Observable<string> {
        return this.http.post(this.baseUrl, request, { responseType: 'text' });
    }

    update(id: string, request: UpdateLeaveTypeRequest): Observable<string> {
        return this.http.put(`${this.baseUrl}/${id}`, request, { responseType: 'text' });
    }

    delete(id: string): Observable<string> {
        return this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' });
    }
}
