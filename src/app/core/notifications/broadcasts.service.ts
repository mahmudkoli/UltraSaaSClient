import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface BroadcastSmsRequest {
    classId?: string;
    message: string;
}

export interface BroadcastSmsResponse {
    studentsTargeted: number;
    recipientNumbers: number;
}

@Injectable({ providedIn: 'root' })
export class BroadcastsService {
    private baseUrl = `${environment.apiUrl}/api/v1/broadcasts`;
    constructor(private http: HttpClient) {}

    sendSms(req: BroadcastSmsRequest): Observable<BroadcastSmsResponse> {
        return this.http.post<BroadcastSmsResponse>(`${this.baseUrl}/sms`, req);
    }
}
