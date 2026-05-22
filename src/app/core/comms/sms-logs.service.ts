import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginationResponse } from './sms-templates.service';

export interface SMSLogDto {
    id: string;
    sid?: string;
    message: string;
    to: string;
    schedule?: string;
    isSuccess: boolean;
    failReason?: string;
}

@Injectable({ providedIn: 'root' })
export class SMSLogsService {
    private baseUrl = `${environment.apiUrl}/api/v1/smslogs`;
    constructor(private http: HttpClient) {}
    search(req: { pageNumber: number; pageSize: number; keyword?: string }): Observable<PaginationResponse<SMSLogDto>> {
        return this.http.post<PaginationResponse<SMSLogDto>>(`${this.baseUrl}/search`, req);
    }
}
