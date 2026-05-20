import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApplyLeaveRequest, LeaveDto, PaginationResponse, SearchLeavesRequest } from './leaves.types';

@Injectable({ providedIn: 'root' })
export class LeavesService {
    private baseUrl = `${environment.apiUrl}/api/v1/leaves`;
    constructor(private http: HttpClient) {}

    search(req: SearchLeavesRequest): Observable<PaginationResponse<LeaveDto>> {
        return this.http.post<PaginationResponse<LeaveDto>>(`${this.baseUrl}/search`, req);
    }

    apply(req: ApplyLeaveRequest): Observable<string> {
        return this.http.post(this.baseUrl, req, { responseType: 'text' });
    }

    approve(id: string, remarks?: string): Observable<string> {
        return this.http.post(`${this.baseUrl}/${id}/approve`, { remarks }, { responseType: 'text' });
    }

    reject(id: string, remarks?: string): Observable<string> {
        return this.http.post(`${this.baseUrl}/${id}/reject`, { remarks }, { responseType: 'text' });
    }

    cancel(id: string): Observable<string> {
        return this.http.post(`${this.baseUrl}/${id}/cancel`, {}, { responseType: 'text' });
    }
}
