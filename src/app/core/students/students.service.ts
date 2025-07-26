import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
    StudentDto,
    CreateStudentRequest,
    UpdateStudentRequest,
    SearchStudentsRequest,
    PaginationResponse
} from './students.types';

@Injectable({providedIn: 'root'})
export class StudentsService
{
    private _httpClient = inject(HttpClient);
    private readonly baseUrl = environment.apiUrl;

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Search students using available filters
     */
    search(request: SearchStudentsRequest): Observable<PaginationResponse<StudentDto>>
    {
        return this._httpClient.post<PaginationResponse<StudentDto>>(`${this.baseUrl}/api/v1/students/search`, request);
    }

    /**
     * Get student details by ID
     */
    getById(id: string): Observable<StudentDto>
    {
        return this._httpClient.get<StudentDto>(`${this.baseUrl}/api/v1/students/${id}`);
    }

    /**
     * Create a new student
     */
    create(request: CreateStudentRequest): Observable<string>
    {
        return this._httpClient.post(`${this.baseUrl}/api/v1/students`, request, { responseType: 'text' });
    }

    /**
     * Update a student
     */
    update(id: string, request: UpdateStudentRequest): Observable<string>
    {
        return this._httpClient.put(`${this.baseUrl}/api/v1/students/${id}`, request, { responseType: 'text' });
    }

    /**
     * Delete a student
     */
    delete(id: string): Observable<string>
    {
        return this._httpClient.delete<string>(`${this.baseUrl}/api/v1/students/${id}`);
    }

    /**
     * Get students using Dapper
     */
    getStudentsDapper(): Observable<StudentDto[]>
    {
        return this._httpClient.get<StudentDto[]>(`${this.baseUrl}/api/v1/students/dapper`);
    }

    /**
     * Export students
     */
    exportStudents(): Observable<Blob>
    {
        return this._httpClient.get(`${this.baseUrl}/api/v1/students/export`, { responseType: 'blob' });
    }
} 