import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { GeneratePayrollSlipRequest, PaginationResponse, PayrollSlipDto, SearchPayrollSlipsRequest } from './payroll.types';

@Injectable({ providedIn: 'root' })
export class PayrollService {
    private baseUrl = `${environment.apiUrl}/api/v1/payrollslips`;
    constructor(private http: HttpClient) {}

    search(req: SearchPayrollSlipsRequest): Observable<PaginationResponse<PayrollSlipDto>> {
        return this.http.post<PaginationResponse<PayrollSlipDto>>(`${this.baseUrl}/search`, req);
    }

    generate(req: GeneratePayrollSlipRequest): Observable<string> {
        return this.http.post(this.baseUrl, req, { responseType: 'text' });
    }

    downloadPdf(id: string): Observable<Blob> {
        return this.http.get(`${this.baseUrl}/${id}/pdf`, { responseType: 'blob' });
    }
}
