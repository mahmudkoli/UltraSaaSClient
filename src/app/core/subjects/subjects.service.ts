import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
    SubjectDto,
    CreateSubjectRequest,
    UpdateSubjectRequest,
    SearchSubjectsRequest,
    PaginationResponse
} from './subjects.types';

@Injectable({
    providedIn: 'root'
})
export class SubjectsService {
    private readonly baseUrl = `${environment.apiUrl}/api/v1/subjects`;

    constructor(private http: HttpClient) {}

    search(request: SearchSubjectsRequest): Observable<PaginationResponse<SubjectDto>> {
        return this.http.post<PaginationResponse<SubjectDto>>(`${this.baseUrl}/search`, request);
    }

    getById(id: string): Observable<SubjectDto> {
        return this.http.get<SubjectDto>(`${this.baseUrl}/${id}`);
    }

    create(request: CreateSubjectRequest): Observable<string> {
        return this.http.post(this.baseUrl, request, { responseType: 'text' });
    }

    update(id: string, request: UpdateSubjectRequest): Observable<string> {
        return this.http.put(`${this.baseUrl}/${id}`, request, { responseType: 'text' });
    }

    delete(id: string): Observable<string> {
        return this.http.delete<string>(`${this.baseUrl}/${id}`);
    }
}
