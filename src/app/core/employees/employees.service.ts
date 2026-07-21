import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
    EmployeeDto, 
    CreateEmployeeRequest, 
    UpdateEmployeeRequest, 
    SearchEmployeesRequest,
    GenerateRandomEmployeeRequest,
    GenerationProgress,
    PaginationResponse 
} from './employees.types';

@Injectable({
    providedIn: 'root'
})
export class EmployeesService {
    private readonly baseUrl = `${environment.apiUrl}/api/v1/employees`;
    private generationProgressSubject = new BehaviorSubject<GenerationProgress | null>(null);
    public generationProgress$ = this.generationProgressSubject.asObservable();

    constructor(private http: HttpClient) {}

    search(request: SearchEmployeesRequest): Observable<PaginationResponse<EmployeeDto>> {
        return this.http.post<PaginationResponse<EmployeeDto>>(`${this.baseUrl}/search`, request);
    }

    getById(id: string): Observable<EmployeeDto> {
        return this.http.get<EmployeeDto>(`${this.baseUrl}/${id}`);
    }

    create(request: CreateEmployeeRequest): Observable<string> {
        return this.http.post(this.baseUrl, request, { responseType: 'text' });
    }

    update(id: string, request: UpdateEmployeeRequest): Observable<string> {
        return this.http.put(`${this.baseUrl}/${id}`, request, { responseType: 'text' });
    }

    delete(id: string): Observable<string> {
        return this.http.delete<string>(`${this.baseUrl}/${id}`);
    }

    /**
     * Generate random employees for testing
     * Useful for populating demo data
     */
    generateRandom(request: GenerateRandomEmployeeRequest = {}): Observable<string> {
        // Update progress
        this.generationProgressSubject.next({
            status: 'generating',
            progress: 0,
            message: 'Generating random employees...',
            generatedCount: 0,
            totalCount: request.nSeed || 10
        });

        // Simulate progress updates
        const progressTimer = setInterval(() => {
            const current = this.generationProgressSubject.value;
            if (current && current.status === 'generating' && current.progress < 90) {
                const newProgress = Math.min(current.progress + 15, 90);
                const generatedCount = Math.floor((newProgress / 100) * (current.totalCount || 10));
                
                this.generationProgressSubject.next({
                    ...current,
                    progress: newProgress,
                    message: `Generated ${generatedCount} of ${current.totalCount} employees...`,
                    generatedCount
                });
            }
        }, 800);

        return new Observable(observer => {
            this.http.post<string>(`${this.baseUrl}/generate-random`, request).subscribe({
                next: (response) => {
                    clearInterval(progressTimer);
                    const current = this.generationProgressSubject.value;
                    
                    this.generationProgressSubject.next({
                        status: 'completed',
                        progress: 100,
                        message: 'Random employees generated successfully!',
                        generatedCount: current?.totalCount || 10,
                        totalCount: current?.totalCount || 10
                    });

                    observer.next(response);
                    observer.complete();
                },
                error: (error) => {
                    clearInterval(progressTimer);
                    this.generationProgressSubject.next({
                        status: 'error',
                        progress: 0,
                        message: 'Failed to generate employees. Please try again.',
                        generatedCount: 0,
                        totalCount: 0
                    });
                    observer.error(error);
                }
            });
        });
    }

    /**
     * Delete all randomly generated employees
     * Useful for cleaning up test data
     */
    deleteRandom(): Observable<string> {
        return this.http.delete<string>(`${this.baseUrl}/delete-random`);
    }

    /**
     * Reset generation progress state
     */
    resetGenerationProgress(): void {
        this.generationProgressSubject.next(null);
    }
} 