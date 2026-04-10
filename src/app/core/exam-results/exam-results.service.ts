import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ExamResultDto, CreateExamResultRequest, UpdateExamResultRequest, SearchExamResultsRequest, PaginationResponse } from './exam-results.types';

@Injectable({ providedIn: 'root' })
export class ExamResultsService {
    private baseUrl = `${environment.apiUrl}/api/v1/examresults`;

    constructor(private http: HttpClient) {}

    search(request: SearchExamResultsRequest): Observable<PaginationResponse<ExamResultDto>> {
        return this.http.post<PaginationResponse<ExamResultDto>>(`${this.baseUrl}/search`, request);
    }

    getById(id: string): Observable<ExamResultDto> {
        return this.http.get<ExamResultDto>(`${this.baseUrl}/${id}`);
    }

    create(request: CreateExamResultRequest): Observable<string> {
        return this.http.post(`${this.baseUrl}`, request, { responseType: 'text' });
    }

    update(id: string, request: UpdateExamResultRequest): Observable<string> {
        return this.http.put(`${this.baseUrl}/${id}`, request, { responseType: 'text' });
    }

    delete(id: string): Observable<string> {
        return this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' });
    }
}
