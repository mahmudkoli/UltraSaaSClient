import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginationResponse } from './sms-templates.service';

export interface MailTemplateDto { id: string; title: string; subject: string; body: string; }
export interface CreateMailTemplateRequest { title: string; subject: string; body: string; }
export interface UpdateMailTemplateRequest extends CreateMailTemplateRequest { id: string; }

@Injectable({ providedIn: 'root' })
export class MailTemplatesService {
    private baseUrl = `${environment.apiUrl}/api/v1/mailtemplates`;
    constructor(private http: HttpClient) {}
    search(req: { pageNumber: number; pageSize: number; keyword?: string }): Observable<PaginationResponse<MailTemplateDto>> {
        return this.http.post<PaginationResponse<MailTemplateDto>>(`${this.baseUrl}/search`, req);
    }
    getById(id: string): Observable<MailTemplateDto> { return this.http.get<MailTemplateDto>(`${this.baseUrl}/${id}`); }
    create(req: CreateMailTemplateRequest): Observable<string> { return this.http.post(this.baseUrl, req, { responseType: 'text' }); }
    update(id: string, req: UpdateMailTemplateRequest): Observable<string> { return this.http.put(`${this.baseUrl}/${id}`, req, { responseType: 'text' }); }
    delete(id: string): Observable<string> { return this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' }); }
}
