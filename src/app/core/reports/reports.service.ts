import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HeadcountReportDto } from './reports.types';

@Injectable({ providedIn: 'root' })
export class ReportsService {
    private readonly baseUrl = `${environment.apiUrl}/api/v1/reports`;

    constructor(private http: HttpClient) {}

    headcount(): Observable<HeadcountReportDto> {
        return this.http.get<HeadcountReportDto>(`${this.baseUrl}/headcount`);
    }
}
