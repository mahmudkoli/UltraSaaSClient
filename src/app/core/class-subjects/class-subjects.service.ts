import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ClassSubjectDto, CreateClassSubjectRequest, UpdateClassSubjectRequest, SearchClassSubjectsRequest, PaginationResponse } from './class-subjects.types';

@Injectable({ providedIn: 'root' })
export class ClassSubjectsService {
    private baseUrl = `${environment.apiUrl}/api/v1/classsubjects`;

    constructor(private _httpClient: HttpClient) {}

    search(request: SearchClassSubjectsRequest): Observable<PaginationResponse<ClassSubjectDto>> {
        return this._httpClient.post<PaginationResponse<ClassSubjectDto>>(`${this.baseUrl}/search`, request);
    }

    getById(id: string): Observable<ClassSubjectDto> {
        return this._httpClient.get<ClassSubjectDto>(`${this.baseUrl}/${id}`);
    }

    create(request: CreateClassSubjectRequest): Observable<string> {
        return this._httpClient.post(this.baseUrl, request, { responseType: 'text' });
    }

    update(id: string, request: UpdateClassSubjectRequest): Observable<string> {
        return this._httpClient.put(`${this.baseUrl}/${id}`, request, { responseType: 'text' });
    }

    delete(id: string): Observable<string> {
        return this._httpClient.delete(`${this.baseUrl}/${id}`, { responseType: 'text' });
    }
}
