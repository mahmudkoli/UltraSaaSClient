import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SiblingDiscountPolicyDto {
    isEnabled: boolean;
    secondChildDiscountPercent: number;
    thirdChildDiscountPercent: number;
    fourthPlusChildDiscountPercent: number;
}

export type UpsertSiblingDiscountPolicyRequest = SiblingDiscountPolicyDto;

@Injectable({ providedIn: 'root' })
export class SiblingDiscountPolicyService {
    private baseUrl = `${environment.apiUrl}/api/v1/siblingdiscountpolicy`;
    constructor(private http: HttpClient) {}

    get(): Observable<SiblingDiscountPolicyDto> {
        return this.http.get<SiblingDiscountPolicyDto>(this.baseUrl);
    }

    upsert(req: UpsertSiblingDiscountPolicyRequest): Observable<SiblingDiscountPolicyDto> {
        return this.http.put<SiblingDiscountPolicyDto>(this.baseUrl, req);
    }
}
