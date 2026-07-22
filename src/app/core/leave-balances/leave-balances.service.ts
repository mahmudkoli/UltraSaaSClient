import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
    LeaveBalanceDto,
    SetLeaveBalanceRequest,
    SearchLeaveBalancesRequest,
    PaginationResponse,
} from './leave-balances.types';

@Injectable({ providedIn: 'root' })
export class LeaveBalancesService {
    private readonly baseUrl = `${environment.apiUrl}/api/v1/leavebalances`;

    constructor(private http: HttpClient) {}

    search(request: SearchLeaveBalancesRequest): Observable<PaginationResponse<LeaveBalanceDto>> {
        return this.http.post<PaginationResponse<LeaveBalanceDto>>(`${this.baseUrl}/search`, request);
    }

    set(request: SetLeaveBalanceRequest): Observable<string> {
        return this.http.post(this.baseUrl, request, { responseType: 'text' });
    }

    delete(id: string): Observable<string> {
        return this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' });
    }
}
