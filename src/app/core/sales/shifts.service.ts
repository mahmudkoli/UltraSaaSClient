import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { CloseShiftRequest, OpenShiftRequest, ShiftDto } from './shifts.types';

@Injectable({ providedIn: 'root' })
export class ShiftsService {
    private readonly http = inject(HttpClient);
    private readonly base = `${environment.apiUrl}/api/shifts`;

    open = (req: OpenShiftRequest): Observable<string> =>
        this.http.post<string>(`${this.base}/open`, req);

    close = (id: string, req: CloseShiftRequest): Observable<ShiftDto> =>
        this.http.post<ShiftDto>(`${this.base}/${id}/close`, { ...req, id });

    current = (outletId: string): Observable<ShiftDto | null> =>
        this.http.get<ShiftDto | null>(`${this.base}/current/${outletId}`);

    get = (id: string): Observable<ShiftDto> =>
        this.http.get<ShiftDto>(`${this.base}/${id}`);

    search = (params?: { outletId?: string; fromDate?: string; toDate?: string; take?: number }): Observable<ShiftDto[]> => {
        const qs = new URLSearchParams();
        if (params?.outletId) qs.append('outletId', params.outletId);
        if (params?.fromDate) qs.append('fromDate', params.fromDate);
        if (params?.toDate) qs.append('toDate', params.toDate);
        if (params?.take !== undefined) qs.append('take', String(params.take));
        return this.http.get<ShiftDto[]>(qs.toString() ? `${this.base}?${qs}` : this.base);
    };
}
