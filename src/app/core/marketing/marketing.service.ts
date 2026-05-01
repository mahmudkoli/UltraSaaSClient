import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { PaginationFilter, PaginationResponse } from 'app/core/common/pagination.types';
import {
    LoyaltyTransactionDto, PreviewCartLine, PromotionDiscountPreview, PromotionDto,
} from './marketing.types';

const api = environment.apiUrl;

export interface SearchPromotionsRequest extends PaginationFilter {
    type?: 'PercentageOff' | 'FixedAmountOff' | 'BuyXGetY';
    scope?: 'Cart' | 'Product' | 'Category';
    isActive?: boolean;
}

export interface SearchLoyaltyTransactionsRequest extends PaginationFilter {
    customerId?: string;
    type?: 'Earned' | 'Redeemed' | 'Adjustment' | 'Reversal';
    fromDate?: string;
    toDate?: string;
}

@Injectable({ providedIn: 'root' })
export class PromotionsService {
    private readonly http = inject(HttpClient);
    private readonly base = `${api}/api/promotions`;
    getAll = (onlyValid?: boolean): Observable<PromotionDto[]> =>
        this.http.get<PromotionDto[]>(onlyValid ? `${this.base}?onlyValid=true` : this.base);
    get = (id: string): Observable<PromotionDto> => this.http.get<PromotionDto>(`${this.base}/${id}`);
    byCode = (code: string): Observable<PromotionDto | null> =>
        this.http.get<PromotionDto | null>(`${this.base}/by-code/${encodeURIComponent(code)}`);
    create = (req: Partial<PromotionDto>): Observable<string> => this.http.post<string>(this.base, req);
    update = (id: string, req: Partial<PromotionDto>): Observable<string> =>
        this.http.put<string>(`${this.base}/${id}`, { ...req, id });
    delete = (id: string): Observable<string> => this.http.delete<string>(`${this.base}/${id}`);
    previewDiscount = (code: string, lines: PreviewCartLine[]): Observable<PromotionDiscountPreview> =>
        this.http.post<PromotionDiscountPreview>(`${this.base}/preview-discount`, { code, lines });
    search = (req: SearchPromotionsRequest): Observable<PaginationResponse<PromotionDto>> =>
        this.http.post<PaginationResponse<PromotionDto>>(`${this.base}/search`, req);
}

@Injectable({ providedIn: 'root' })
export class LoyaltyService {
    private readonly http = inject(HttpClient);
    private readonly base = `${api}/api/loyalty`;
    transactions = (customerId?: string): Observable<LoyaltyTransactionDto[]> =>
        this.http.get<LoyaltyTransactionDto[]>(customerId ? `${this.base}/transactions?customerId=${customerId}` : `${this.base}/transactions`);
    adjust = (req: { customerId: string; points: number; notes?: string }): Observable<string> =>
        this.http.post<string>(`${this.base}/adjust`, req);
    searchTransactions = (req: SearchLoyaltyTransactionsRequest): Observable<PaginationResponse<LoyaltyTransactionDto>> =>
        this.http.post<PaginationResponse<LoyaltyTransactionDto>>(`${this.base}/transactions/search`, req);
}
