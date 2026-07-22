import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MyPayslipDto, MyLeaveBalanceDto, MyProfileDto } from './ess.types';

@Injectable({ providedIn: 'root' })
export class EssService {
    private readonly baseUrl = `${environment.apiUrl}/api/v1/ess`;

    constructor(private http: HttpClient) {}

    profile(): Observable<MyProfileDto> {
        return this.http.get<MyProfileDto>(`${this.baseUrl}/profile`);
    }

    payslips(): Observable<MyPayslipDto[]> {
        return this.http.get<MyPayslipDto[]>(`${this.baseUrl}/payslips`);
    }

    payslipPdf(id: string): Observable<Blob> {
        return this.http.get(`${this.baseUrl}/payslips/${id}/pdf`, { responseType: 'blob' });
    }

    leaveBalances(): Observable<MyLeaveBalanceDto[]> {
        return this.http.get<MyLeaveBalanceDto[]>(`${this.baseUrl}/leave-balances`);
    }
}
