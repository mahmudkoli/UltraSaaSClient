import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { MyDashboardDto } from './my-dashboard.types';

@Injectable({ providedIn: 'root' })
export class MyDashboardService {
    private readonly http = inject(HttpClient);
    private readonly url = `${environment.apiUrl}/api/mydashboard`;

    get = (): Observable<MyDashboardDto> => this.http.get<MyDashboardDto>(this.url);
}
