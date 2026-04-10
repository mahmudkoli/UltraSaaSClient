import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ExamDto, CreateExamRequest, UpdateExamRequest, SearchExamsRequest, PaginationResponse } from './exams.types';

@Injectable({ providedIn: 'root' })
export class ExamsService {
    private baseUrl = `${environment.apiUrl}/api/v1/exams`;

    constructor(private http: HttpClient) {}

    search(request: SearchExamsRequest): Observable<PaginationResponse<ExamDto>> {
        return this.http.post<PaginationResponse<ExamDto>>(`${this.baseUrl}/search`, request);
    }

    getById(id: string): Observable<ExamDto> {
        return this.http.get<ExamDto>(`${this.baseUrl}/${id}`);
    }

    create(request: CreateExamRequest): Observable<string> {
        return this.http.post(`${this.baseUrl}`, request, { responseType: 'text' });
    }

    update(id: string, request: UpdateExamRequest): Observable<string> {
        return this.http.put(`${this.baseUrl}/${id}`, request, { responseType: 'text' });
    }

    delete(id: string): Observable<string> {
        return this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' });
    }
}
