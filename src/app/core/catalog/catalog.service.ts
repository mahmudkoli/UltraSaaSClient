import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { PaginationFilter, PaginationResponse } from 'app/core/common/pagination.types';
import { BrandDto, CategoryDto, CreateProductRequest, ProductDto, ProductOutletPriceDto, ResolvedPriceDto, SetProductOutletPriceRequest, UnitDto, UpdateProductRequest } from './catalog.types';

const api = environment.apiUrl;

export interface SearchProductsRequest extends PaginationFilter {
    categoryId?: string;
    brandId?: string;
    isActive?: boolean;
}

@Injectable({ providedIn: 'root' })
export class CategoriesService {
    private readonly http = inject(HttpClient);
    private readonly base = `${api}/api/categories`;
    getAll = (): Observable<CategoryDto[]> => this.http.get<CategoryDto[]>(this.base);
    get = (id: string): Observable<CategoryDto> => this.http.get<CategoryDto>(`${this.base}/${id}`);
    create = (req: Partial<CategoryDto>): Observable<string> => this.http.post<string>(this.base, req);
    update = (id: string, req: Partial<CategoryDto>): Observable<string> => this.http.put<string>(`${this.base}/${id}`, { ...req, id });
    delete = (id: string): Observable<string> => this.http.delete<string>(`${this.base}/${id}`);
}

@Injectable({ providedIn: 'root' })
export class BrandsService {
    private readonly http = inject(HttpClient);
    private readonly base = `${api}/api/brands`;
    getAll = (): Observable<BrandDto[]> => this.http.get<BrandDto[]>(this.base);
    get = (id: string): Observable<BrandDto> => this.http.get<BrandDto>(`${this.base}/${id}`);
    create = (req: Partial<BrandDto>): Observable<string> => this.http.post<string>(this.base, req);
    update = (id: string, req: Partial<BrandDto>): Observable<string> => this.http.put<string>(`${this.base}/${id}`, { ...req, id });
    delete = (id: string): Observable<string> => this.http.delete<string>(`${this.base}/${id}`);
}

@Injectable({ providedIn: 'root' })
export class UnitsService {
    private readonly http = inject(HttpClient);
    private readonly base = `${api}/api/units`;
    getAll = (): Observable<UnitDto[]> => this.http.get<UnitDto[]>(this.base);
    get = (id: string): Observable<UnitDto> => this.http.get<UnitDto>(`${this.base}/${id}`);
    create = (req: Partial<UnitDto>): Observable<string> => this.http.post<string>(this.base, req);
    update = (id: string, req: Partial<UnitDto>): Observable<string> => this.http.put<string>(`${this.base}/${id}`, { ...req, id });
    delete = (id: string): Observable<string> => this.http.delete<string>(`${this.base}/${id}`);
}

@Injectable({ providedIn: 'root' })
export class ProductsService {
    private readonly http = inject(HttpClient);
    private readonly base = `${api}/api/products`;
    getAll = (params?: { categoryId?: string; brandId?: string; isActive?: boolean }): Observable<ProductDto[]> => {
        const qs = new URLSearchParams();
        if (params?.categoryId) qs.append('categoryId', params.categoryId);
        if (params?.brandId) qs.append('brandId', params.brandId);
        if (params?.isActive !== undefined) qs.append('isActive', String(params.isActive));
        return this.http.get<ProductDto[]>(qs.toString() ? `${this.base}?${qs}` : this.base);
    };
    get = (id: string): Observable<ProductDto> => this.http.get<ProductDto>(`${this.base}/${id}`);
    create = (req: CreateProductRequest): Observable<string> => this.http.post<string>(this.base, req);
    update = (id: string, req: Partial<UpdateProductRequest>): Observable<string> =>
        this.http.put<string>(`${this.base}/${id}`, { ...req, id });
    delete = (id: string): Observable<string> => this.http.delete<string>(`${this.base}/${id}`);

    // ── Outlet-specific pricing ────────────────────────────────────
    getPrices = (productId: string): Observable<ProductOutletPriceDto[]> =>
        this.http.get<ProductOutletPriceDto[]>(`${this.base}/${productId}/prices`);
    resolvePrice = (productId: string, outletId: string): Observable<ResolvedPriceDto> =>
        this.http.get<ResolvedPriceDto>(`${this.base}/${productId}/prices/resolve/${outletId}`);
    setPrice = (productId: string, outletId: string, req: SetProductOutletPriceRequest): Observable<string> =>
        this.http.put<string>(`${this.base}/${productId}/prices/${outletId}`, req);
    removePrice = (productId: string, outletId: string): Observable<string> =>
        this.http.delete<string>(`${this.base}/${productId}/prices/${outletId}`);
    search = (req: SearchProductsRequest): Observable<PaginationResponse<ProductDto>> =>
        this.http.post<PaginationResponse<ProductDto>>(`${this.base}/search`, req);
}
