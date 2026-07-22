import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
    AttendanceDto,
    AttendanceSummaryDto,
    CreateAttendanceRequest,
    UpdateAttendanceRequest,
    RegulariseAttendanceRequest,
    SearchAttendancesRequest,
    PaginationResponse,
} from './attendances.types';
import { HttpParams } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AttendancesService {
    private readonly baseUrl = `${environment.apiUrl}/api/v1/attendances`;

    constructor(private http: HttpClient) {}

    search(request: SearchAttendancesRequest): Observable<PaginationResponse<AttendanceDto>> {
        return this.http.post<PaginationResponse<AttendanceDto>>(`${this.baseUrl}/search`, request);
    }

    getById(id: string): Observable<AttendanceDto> {
        return this.http.get<AttendanceDto>(`${this.baseUrl}/${id}`);
    }

    create(request: CreateAttendanceRequest): Observable<string> {
        return this.http.post(this.baseUrl, request, { responseType: 'text' });
    }

    update(id: string, request: UpdateAttendanceRequest): Observable<string> {
        return this.http.put(`${this.baseUrl}/${id}`, request, { responseType: 'text' });
    }

    regularise(id: string, request: RegulariseAttendanceRequest): Observable<string> {
        return this.http.post(`${this.baseUrl}/${id}/regularise`, request, { responseType: 'text' });
    }

    delete(id: string): Observable<string> {
        return this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' });
    }

    summary(year: number, month: number, employeeId?: string): Observable<AttendanceSummaryDto[]> {
        let params = new HttpParams().set('year', year).set('month', month);
        if (employeeId) params = params.set('employeeId', employeeId);
        return this.http.get<AttendanceSummaryDto[]>(`${this.baseUrl}/summary`, { params });
    }
}
