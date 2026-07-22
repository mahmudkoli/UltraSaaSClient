import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
    StatutoryConfigDto,
    SetStatutoryConfigRequest,
    EstimateDeductionsRequest,
    StatutoryCalcResult,
} from './statutory-config.types';

@Injectable({ providedIn: 'root' })
export class StatutoryConfigService {
    private readonly baseUrl = `${environment.apiUrl}/api/v1/statutoryconfig`;

    constructor(private http: HttpClient) {}

    getCurrent(fiscalYear?: string): Observable<StatutoryConfigDto | null> {
        const q = fiscalYear ? `?fiscalYear=${encodeURIComponent(fiscalYear)}` : '';
        return this.http.get<StatutoryConfigDto | null>(`${this.baseUrl}${q}`);
    }

    set(request: SetStatutoryConfigRequest): Observable<string> {
        return this.http.post(this.baseUrl, request, { responseType: 'text' });
    }

    estimate(request: EstimateDeductionsRequest): Observable<StatutoryCalcResult> {
        return this.http.post<StatutoryCalcResult>(`${this.baseUrl}/estimate`, request);
    }
}
