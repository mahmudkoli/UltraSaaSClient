import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SMSConfigDto { id?: string; apiUrl: string; sid?: string; userId: string; password: string; }
export interface MailConfigDto { id?: string; host: string; port: number; displayName: string; from: string; userName: string; password: string; }

@Injectable({ providedIn: 'root' })
export class SMSConfigService {
    private baseUrl = `${environment.apiUrl}/api/smsconfig`;
    constructor(private http: HttpClient) {}
    get(): Observable<SMSConfigDto> { return this.http.get<SMSConfigDto>(this.baseUrl); }
    upsert(req: SMSConfigDto): Observable<string> { return this.http.post(this.baseUrl, req, { responseType: 'text' }); }
}

@Injectable({ providedIn: 'root' })
export class MailConfigService {
    private baseUrl = `${environment.apiUrl}/api/mailconfig`;
    constructor(private http: HttpClient) {}
    get(): Observable<MailConfigDto> { return this.http.get<MailConfigDto>(this.baseUrl); }
    upsert(req: MailConfigDto): Observable<string> { return this.http.post(this.baseUrl, req, { responseType: 'text' }); }
}
