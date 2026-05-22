import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginationResponse } from './sms-templates.service';

export interface MailLogDto {
    id: string;
    from: string;
    to: string;
    subject: string;
    body: string;
    cc?: string;
    bcc?: string;
    schedule?: string;
    isSuccess: boolean;
    failReason?: string;
}

@Injectable({ providedIn: 'root' })
export class MailLogsService {
    private baseUrl = `${environment.apiUrl}/api/v1/maillogs`;
    constructor(private http: HttpClient) {}
    search(req: { pageNumber: number; pageSize: number; keyword?: string }): Observable<PaginationResponse<MailLogDto>> {
        return this.http.post<PaginationResponse<MailLogDto>>(`${this.baseUrl}/search`, req);
    }
}
