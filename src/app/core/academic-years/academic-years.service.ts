import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
    AcademicYearDto,
    CreateAcademicYearRequest,
    UpdateAcademicYearRequest,
    SearchAcademicYearsRequest,
    PaginationResponse
} from './academic-years.types';

@Injectable({
    providedIn: 'root'
})
export class AcademicYearsService {
    private readonly baseUrl = `${environment.apiUrl}/api/v1/academicyears`;

    constructor(private http: HttpClient) {}

    search(request: SearchAcademicYearsRequest): Observable<PaginationResponse<AcademicYearDto>> {
        return this.http.post<PaginationResponse<AcademicYearDto>>(`${this.baseUrl}/search`, request);
    }

    getById(id: string): Observable<AcademicYearDto> {
        return this.http.get<AcademicYearDto>(`${this.baseUrl}/${id}`);
    }

    create(request: CreateAcademicYearRequest): Observable<string> {
        return this.http.post(this.baseUrl, request, { responseType: 'text' });
    }

    update(id: string, request: UpdateAcademicYearRequest): Observable<string> {
        return this.http.put(`${this.baseUrl}/${id}`, request, { responseType: 'text' });
    }

    delete(id: string): Observable<string> {
        return this.http.delete<string>(`${this.baseUrl}/${id}`);
    }
}
