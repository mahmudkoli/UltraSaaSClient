import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
    StudentDto,
    CreateStudentRequest,
    UpdateStudentRequest,
    SearchStudentsRequest,
    ExportStudentsRequest,
    ExportProgress,
    PaginationResponse
} from './students.types';
import { MyChildDashboardDto } from './my-child.types';

@Injectable({
    providedIn: 'root'
})
export class StudentsService {
    private readonly baseUrl = `${environment.apiUrl}/api/v1/students`;
    private exportProgressSubject = new BehaviorSubject<ExportProgress | null>(null);
    public exportProgress$ = this.exportProgressSubject.asObservable();

    constructor(private http: HttpClient) {}

    search(request: SearchStudentsRequest): Observable<PaginationResponse<StudentDto>> {
        return this.http.post<PaginationResponse<StudentDto>>(`${this.baseUrl}/search`, request);
    }

    getById(id: string): Observable<StudentDto> {
        return this.http.get<StudentDto>(`${this.baseUrl}/${id}`);
    }

    /**
     * Get student details via Dapper (alternative query method)
     * Useful for performance testing and comparison
     */
    getByIdDapper(id: string): Observable<StudentDto> {
        const params = new HttpParams().set('id', id);
        return this.http.get<StudentDto>(`${this.baseUrl}/dapper`, { params });
    }

    create(request: CreateStudentRequest): Observable<string> {
        return this.http.post(this.baseUrl, request, { responseType: 'text' });
    }

    update(id: string, request: UpdateStudentRequest): Observable<string> {
        return this.http.put(`${this.baseUrl}/${id}`, request, { responseType: 'text' });
    }

    delete(id: string): Observable<string> {
        return this.http.delete<string>(`${this.baseUrl}/${id}`);
    }

    /**
     * Phase E2 — download the student's ID card as a printable PDF.
     */
    downloadIdCard(id: string): Observable<Blob> {
        return this.http.get(`${this.baseUrl}/${id}/id-card.pdf`, { responseType: 'blob' });
    }

    /**
     * Phase E8 — bulk-import students from an .xlsx file.
     */
    importExcel(file: File): Observable<{ created: number; skipped: number; errors: string[] }> {
        const fd = new FormData();
        fd.append('file', file, file.name);
        return this.http.post<{ created: number; skipped: number; errors: string[] }>(
            `${this.baseUrl}/import`,
            fd,
        );
    }

    /**
     * Phase F2 — download the import template .xlsx with sample row.
     */
    downloadImportTemplate(): Observable<Blob> {
        return this.http.get(`${this.baseUrl}/import/template.xlsx`, { responseType: 'blob' });
    }

    /**
     * Phase F6 — single-page parent / student dashboard for the
     * logged-in user. Resolves user → student via Student.UserId.
     */
    getMyChild(): Observable<MyChildDashboardDto> {
        return this.http.get<MyChildDashboardDto>(`${this.baseUrl}/me`);
    }

    /**
     * Export students data to file
     * Returns a blob that can be downloaded
     */
    export(request: ExportStudentsRequest): Observable<Blob> {
        // Update progress
        this.exportProgressSubject.next({
            status: 'preparing',
            progress: 0,
            message: 'Preparing export...'
        });

        const exportObservable = this.http.post(`${this.baseUrl}/export`, request, {
            responseType: 'blob',
            reportProgress: true,
            observe: 'response'
        });

        // Simulate progress updates (since backend might not provide them)
        const progressTimer = setInterval(() => {
            const current = this.exportProgressSubject.value;
            if (current && current.status === 'preparing' && current.progress < 90) {
                this.exportProgressSubject.next({
                    ...current,
                    progress: current.progress + 10,
                    message: 'Generating export file...'
                });
            }
        }, 500);

        return new Observable(observer => {
            exportObservable.subscribe({
                next: (response) => {
                    clearInterval(progressTimer);
                    
                    // Extract filename from content-disposition header if available
                    const contentDisposition = response.headers.get('content-disposition');
                    let filename = 'students_export.xlsx';
                    if (contentDisposition) {
                        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                        if (filenameMatch) {
                            filename = filenameMatch[1].replace(/['"]/g, '');
                        }
                    }

                    // Create download URL
                    const blob = response.body;
                    const downloadUrl = window.URL.createObjectURL(blob!);

                    this.exportProgressSubject.next({
                        status: 'completed',
                        progress: 100,
                        message: 'Export completed successfully!',
                        downloadUrl,
                        fileName: filename
                    });

                    observer.next(blob!);
                    observer.complete();
                },
                error: (error) => {
                    clearInterval(progressTimer);
                    this.exportProgressSubject.next({
                        status: 'error',
                        progress: 0,
                        message: 'Export failed. Please try again.'
                    });
                    observer.error(error);
                }
            });
        });
    }

    /**
     * Reset export progress state
     */
    resetExportProgress(): void {
        this.exportProgressSubject.next(null);
    }
} 