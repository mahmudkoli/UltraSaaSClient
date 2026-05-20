import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface GradeBandDto {
    id: string;
    lowerPercent: number;
    upperPercent: number;
    label: string;
    gpa?: number;
    displayOrder: number;
}

export interface CreateGradeBandRequest {
    lowerPercent: number;
    upperPercent: number;
    label: string;
    gpa?: number;
    displayOrder: number;
}

export interface UpdateGradeBandRequest extends CreateGradeBandRequest {
    id: string;
}

@Injectable({ providedIn: 'root' })
export class GradeBandsService {
    private baseUrl = `${environment.apiUrl}/api/v1/gradebands`;
    constructor(private http: HttpClient) {}

    list(): Observable<GradeBandDto[]> {
        return this.http.get<GradeBandDto[]>(this.baseUrl);
    }

    create(req: CreateGradeBandRequest): Observable<string> {
        return this.http.post(this.baseUrl, req, { responseType: 'text' });
    }

    update(id: string, req: UpdateGradeBandRequest): Observable<string> {
        return this.http.put(`${this.baseUrl}/${id}`, req, { responseType: 'text' });
    }

    delete(id: string): Observable<string> {
        return this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' });
    }
}
