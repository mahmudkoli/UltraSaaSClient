import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StatsDto } from './dashboard.types';

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    private readonly baseUrl = `${environment.apiUrl}/api/v1/dashboard`;

    constructor(private http: HttpClient) {}

    getStats(): Observable<StatsDto> {
        return this.http.get<StatsDto>(this.baseUrl);
    }
}
