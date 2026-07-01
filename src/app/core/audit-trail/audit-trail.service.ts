import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AuditTrailDto {
    id: string;
    userId: string;
    userName?: string;        // resolved server-side (Phase v1 QA H5)
    userEmail?: string;
    type?: string;            // Create / Update / Delete
    tableName?: string;
    dateTime: string;
    primaryKey?: string;
    oldValues?: string;
    newValues?: string;
    affectedColumns?: string;
}

export interface SearchAuditTrailsRequest {
    pageNumber: number;
    pageSize: number;
    userId?: string;
    tableName?: string;
    type?: string;
    fromDate?: string;
    toDate?: string;
}

export interface PaginationResponse<T> {
    data: T[];
    currentPage: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuditTrailService {
    private baseUrl = `${environment.apiUrl}/api/audittrail`;
    constructor(private http: HttpClient) {}

    /** When tenantId is set (root only), targets that tenant's audit trail; otherwise the current tenant's. */
    search(req: SearchAuditTrailsRequest, tenantId?: string): Observable<PaginationResponse<AuditTrailDto>> {
        const url = tenantId ? `${this.baseUrl}/tenant/${tenantId}/search` : `${this.baseUrl}/search`;
        return this.http.post<PaginationResponse<AuditTrailDto>>(url, req);
    }

    listTables(tenantId?: string): Observable<string[]> {
        const url = tenantId ? `${this.baseUrl}/tenant/${tenantId}/tables` : `${this.baseUrl}/tables`;
        return this.http.get<string[]>(url);
    }
}
