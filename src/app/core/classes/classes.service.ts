import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
    ClassDto,
    CreateClassRequest,
    UpdateClassRequest,
    SearchClassesRequest,
    PaginationResponse
} from './classes.types';

@Injectable({
    providedIn: 'root'
})
export class ClassesService {
    private readonly baseUrl = `${environment.apiUrl}/api/v1/classes`;

    constructor(private http: HttpClient) {}

    search(request: SearchClassesRequest): Observable<PaginationResponse<ClassDto>> {
        return this.http.post<PaginationResponse<ClassDto>>(`${this.baseUrl}/search`, request);
    }

    getById(id: string): Observable<ClassDto> {
        return this.http.get<ClassDto>(`${this.baseUrl}/${id}`);
    }

    create(request: CreateClassRequest): Observable<string> {
        return this.http.post(this.baseUrl, request, { responseType: 'text' });
    }

    update(id: string, request: UpdateClassRequest): Observable<string> {
        return this.http.put(`${this.baseUrl}/${id}`, request, { responseType: 'text' });
    }

    delete(id: string): Observable<string> {
        return this.http.delete<string>(`${this.baseUrl}/${id}`);
    }
}
