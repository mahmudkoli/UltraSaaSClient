import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { CreateOutletRequest, OutletDto, UpdateOutletRequest } from './outlets.types';

@Injectable({ providedIn: 'root' })
export class OutletsService {
    private readonly http = inject(HttpClient);
    private readonly base = `${environment.apiUrl}/api/outlets`;

    getAll(tenantId?: string): Observable<OutletDto[]> {
        const url = tenantId ? `${this.base}?tenantId=${encodeURIComponent(tenantId)}` : this.base;
        return this.http.get<OutletDto[]>(url);
    }

    get(id: string): Observable<OutletDto> {
        return this.http.get<OutletDto>(`${this.base}/${id}`);
    }

    create(req: CreateOutletRequest): Observable<string> {
        return this.http.post<string>(this.base, req);
    }

    update(id: string, req: UpdateOutletRequest): Observable<string> {
        return this.http.put<string>(`${this.base}/${id}`, req);
    }

    delete(id: string): Observable<string> {
        return this.http.delete<string>(`${this.base}/${id}`);
    }

    suspend(id: string): Observable<string> {
        return this.http.post<string>(`${this.base}/${id}/suspend`, {});
    }

    reactivate(id: string): Observable<string> {
        return this.http.post<string>(`${this.base}/${id}/reactivate`, {});
    }

    archive(id: string): Observable<string> {
        return this.http.post<string>(`${this.base}/${id}/archive`, {});
    }
}
