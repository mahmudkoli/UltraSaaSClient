import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

export interface ParkedCartLine {
    productId: string;
    productName?: string;
    sku?: string;
    quantity: number;
    unitPrice: number;
    discountAmount: number;
    serialNumber?: string;
    batchNumber?: string;
    weightKg?: number;
}

export interface ParkCartRequest {
    outletId: string;
    customerId?: string | null;
    customerName?: string | null;
    customerPhone?: string | null;
    label?: string | null;
    lines: ParkedCartLine[];
    promoCode?: string;
    loyaltyPointsRedeemed?: number;
    notes?: string;
}

export interface ParkedCartDto {
    id: string;
    outletId: string;
    parkedByUserId: string;
    customerId?: string;
    customerName?: string;
    customerPhone?: string;
    label?: string;
    subTotal: number;
    itemCount: number;
    parkedAt: string;
}

export interface RecalledCartDto {
    id: string;
    outletId: string;
    customerId?: string;
    customerName?: string;
    customerPhone?: string;
    label?: string;
    lines: ParkedCartLine[];
    promoCode?: string;
    loyaltyPointsRedeemed?: number;
    notes?: string;
}

@Injectable({ providedIn: 'root' })
export class ParkedCartsService {
    private readonly http = inject(HttpClient);
    private readonly base = `${environment.apiUrl}/api/parkedcarts`;

    park = (req: ParkCartRequest): Observable<string> =>
        this.http.post<string>(this.base, req);

    byOutlet = (outletId: string): Observable<ParkedCartDto[]> =>
        this.http.get<ParkedCartDto[]>(`${this.base}/by-outlet/${outletId}`);

    /** Recalls AND deletes the parked record server-side — caller must use the returned payload immediately. */
    recall = (id: string): Observable<RecalledCartDto> =>
        this.http.post<RecalledCartDto>(`${this.base}/${id}/recall`, {});

    discard = (id: string): Observable<string> =>
        this.http.delete<string>(`${this.base}/${id}`);
}
