import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SMSTemplateDto { id: string; title: string; message: string; }
export interface CreateSMSTemplateRequest { title: string; message: string; }
export interface UpdateSMSTemplateRequest extends CreateSMSTemplateRequest { id: string; }
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
export class SMSTemplatesService {
    private baseUrl = `${environment.apiUrl}/api/smstemplates`;
    constructor(private http: HttpClient) {}
    search(req: { pageNumber: number; pageSize: number; keyword?: string }): Observable<PaginationResponse<SMSTemplateDto>> {
        return this.http.post<PaginationResponse<SMSTemplateDto>>(`${this.baseUrl}/search`, req);
    }
    getById(id: string): Observable<SMSTemplateDto> { return this.http.get<SMSTemplateDto>(`${this.baseUrl}/${id}`); }
    create(req: CreateSMSTemplateRequest): Observable<string> { return this.http.post(this.baseUrl, req, { responseType: 'text' }); }
    update(id: string, req: UpdateSMSTemplateRequest): Observable<string> { return this.http.put(`${this.baseUrl}/${id}`, req, { responseType: 'text' }); }
    delete(id: string): Observable<string> { return this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' }); }
}
