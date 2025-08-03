import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
    StudentTransportDto, 
    CreateStudentTransportRequest, 
    UpdateStudentTransportRequest, 
    SearchStudentTransportsRequest,
    PaginationResponse 
} from './student-transports.types';

@Injectable({
    providedIn: 'root'
})
export class StudentTransportsService {
    private readonly baseUrl = `${environment.apiUrl}/api/v1/studenttransports`;

    constructor(private http: HttpClient) {}

    search(request: SearchStudentTransportsRequest): Observable<PaginationResponse<StudentTransportDto>> {
        return this.http.post<PaginationResponse<StudentTransportDto>>(`${this.baseUrl}/search`, request);
    }

    getById(id: string): Observable<StudentTransportDto> {
        return this.http.get<StudentTransportDto>(`${this.baseUrl}/${id}`);
    }

    create(request: CreateStudentTransportRequest): Observable<string> {
        return this.http.post(this.baseUrl, request, { responseType: 'text' });
    }

    update(id: string, request: UpdateStudentTransportRequest): Observable<string> {
        return this.http.put(`${this.baseUrl}/${id}`, request, { responseType: 'text' });
    }

    delete(id: string): Observable<string> {
        return this.http.delete<string>(`${this.baseUrl}/${id}`);
    }
} 