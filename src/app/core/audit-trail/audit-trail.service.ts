import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AuditTrailDto {
    id: string;
    userId: string;
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

    search(req: SearchAuditTrailsRequest): Observable<PaginationResponse<AuditTrailDto>> {
        return this.http.post<PaginationResponse<AuditTrailDto>>(`${this.baseUrl}/search`, req);
    }

    listTables(): Observable<string[]> {
        return this.http.get<string[]>(`${this.baseUrl}/tables`);
    }
}
