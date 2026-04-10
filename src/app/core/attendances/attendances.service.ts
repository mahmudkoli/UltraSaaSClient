import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
    AttendanceDto,
    CreateAttendanceRequest,
    UpdateAttendanceRequest,
    SearchAttendancesRequest,
    PaginationResponse
} from './attendances.types';

@Injectable({
    providedIn: 'root'
})
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

    delete(id: string): Observable<string> {
        return this.http.delete<string>(`${this.baseUrl}/${id}`);
    }
}
