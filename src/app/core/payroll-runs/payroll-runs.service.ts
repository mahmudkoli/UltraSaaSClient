import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PayrollRunDto, GeneratePayrollRunRequest } from './payroll-runs.types';

@Injectable({ providedIn: 'root' })
export class PayrollRunsService {
    private readonly baseUrl = `${environment.apiUrl}/api/v1/payrollruns`;

    constructor(private http: HttpClient) {}

    list(): Observable<PayrollRunDto[]> {
        return this.http.get<PayrollRunDto[]>(`${this.baseUrl}/list`);
    }

    getById(id: string): Observable<PayrollRunDto> {
        return this.http.get<PayrollRunDto>(`${this.baseUrl}/${id}`);
    }

    generate(request: GeneratePayrollRunRequest): Observable<string> {
        return this.http.post(`${this.baseUrl}/generate`, request, { responseType: 'text' });
    }

    finalise(id: string): Observable<string> {
        return this.http.post(`${this.baseUrl}/${id}/finalise`, {}, { responseType: 'text' });
    }

    delete(id: string): Observable<string> {
        return this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' });
    }

    // Payslip PDF is served by the PayrollSlips controller (per-slip).
    payslipPdf(slipId: string): Observable<Blob> {
        return this.http.get(`${environment.apiUrl}/api/v1/payrollslips/${slipId}/pdf`, { responseType: 'blob' });
    }

    bankAdvice(runId: string): Observable<Blob> {
        return this.http.get(`${this.baseUrl}/${runId}/bank-advice`, { responseType: 'blob' });
    }

    register(runId: string): Observable<Blob> {
        return this.http.get(`${this.baseUrl}/${runId}/register`, { responseType: 'blob' });
    }
}
