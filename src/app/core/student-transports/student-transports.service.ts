import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
    StudentTransportDto,
    CreateStudentTransportRequest,
    UpdateStudentTransportRequest,
    SearchStudentTransportsRequest,
    PaginationResponse
} from './student-transports.types';

@Injectable({providedIn: 'root'})
export class StudentTransportsService
{
    private _httpClient = inject(HttpClient);
    private readonly baseUrl = environment.apiUrl;

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Search student transports using available filters
     */
    search(request: SearchStudentTransportsRequest): Observable<PaginationResponse<StudentTransportDto>>
    {
        return this._httpClient.post<PaginationResponse<StudentTransportDto>>(`${this.baseUrl}/api/v1/studenttransports/search`, request);
    }

    /**
     * Get student transport details by ID
     */
    getById(id: string): Observable<StudentTransportDto>
    {
        return this._httpClient.get<StudentTransportDto>(`${this.baseUrl}/api/v1/studenttransports/${id}`);
    }

    /**
     * Create a new student transport
     */
    create(request: CreateStudentTransportRequest): Observable<string>
    {
        return this._httpClient.post<string>(`${this.baseUrl}/api/v1/studenttransports`, request);
    }

    /**
     * Update a student transport
     */
    update(id: string, request: UpdateStudentTransportRequest): Observable<string>
    {
        return this._httpClient.put<string>(`${this.baseUrl}/api/v1/studenttransports/${id}`, request);
    }

    /**
     * Delete a student transport
     */
    delete(id: string): Observable<string>
    {
        return this._httpClient.delete<string>(`${this.baseUrl}/api/v1/studenttransports/${id}`);
    }
} 