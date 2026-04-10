import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
    StudentClassDto,
    CreateStudentClassRequest,
    UpdateStudentClassRequest,
    SearchStudentClassesRequest,
    PaginationResponse
} from './student-classes.types';

@Injectable({
    providedIn: 'root'
})
export class StudentClassesService {
    private readonly baseUrl = `${environment.apiUrl}/api/v1/studentclasses`;

    constructor(private http: HttpClient) {}

    search(request: SearchStudentClassesRequest): Observable<PaginationResponse<StudentClassDto>> {
        return this.http.post<PaginationResponse<StudentClassDto>>(`${this.baseUrl}/search`, request);
    }

    getById(id: string): Observable<StudentClassDto> {
        return this.http.get<StudentClassDto>(`${this.baseUrl}/${id}`);
    }

    create(request: CreateStudentClassRequest): Observable<string> {
        return this.http.post(this.baseUrl, request, { responseType: 'text' });
    }

    update(id: string, request: UpdateStudentClassRequest): Observable<string> {
        return this.http.put(`${this.baseUrl}/${id}`, request, { responseType: 'text' });
    }

    delete(id: string): Observable<string> {
        return this.http.delete<string>(`${this.baseUrl}/${id}`);
    }
}
