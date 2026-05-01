import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { PaginationFilter, PaginationResponse } from 'app/core/common/pagination.types';

export interface AuditTrailDto {
    id: string;
    userId: string;
    type?: 'Create' | 'Update' | 'Delete' | string;
    tableName?: string;
    dateTime: string;
    primaryKey?: string;
    oldValues?: string;
    newValues?: string;
    affectedColumns?: string;
}

export interface SearchAuditTrailsRequest extends PaginationFilter {
    userId?: string;
    tableName?: string;
    type?: 'Create' | 'Update' | 'Delete';
    fromDate?: string;
    toDate?: string;
}

@Injectable({ providedIn: 'root' })
export class AuditTrailService {
    private readonly http = inject(HttpClient);
    private readonly base = `${environment.apiUrl}/api/audittrail`;

    search = (req: SearchAuditTrailsRequest): Observable<PaginationResponse<AuditTrailDto>> =>
        this.http.post<PaginationResponse<AuditTrailDto>>(`${this.base}/search`, req);

    tables = (): Observable<string[]> =>
        this.http.get<string[]>(`${this.base}/tables`);
}
