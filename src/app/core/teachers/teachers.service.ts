import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
    TeacherDto, 
    CreateTeacherRequest, 
    UpdateTeacherRequest, 
    SearchTeachersRequest, 
    PaginationResponse 
} from './teachers.types';

@Injectable({
    providedIn: 'root'
})
export class TeachersService {
    private readonly baseUrl = `${environment.apiUrl}/api/v1/teachers`;

    constructor(private http: HttpClient) {}

    search(request: SearchTeachersRequest): Observable<PaginationResponse<TeacherDto>> {
        return this.http.post<PaginationResponse<TeacherDto>>(`${this.baseUrl}/search`, request);
    }

    getById(id: string): Observable<TeacherDto> {
        return this.http.get<TeacherDto>(`${this.baseUrl}/${id}`);
    }

    create(request: CreateTeacherRequest): Observable<string> {
        return this.http.post(this.baseUrl, request, { responseType: 'text' });
    }

    update(id: string, request: UpdateTeacherRequest): Observable<string> {
        return this.http.put(`${this.baseUrl}/${id}`, request, { responseType: 'text' });
    }

    delete(id: string): Observable<string> {
        return this.http.delete<string>(`${this.baseUrl}/${id}`);
    }
} 