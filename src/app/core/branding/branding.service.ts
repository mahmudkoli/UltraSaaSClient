import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { TenantService } from 'app/core/tenant/tenant.service';
import {
    BrandingProfileDto,
    CreateBrandingProfileRequest,
    UpdateBrandingProfileRequest,
} from './branding.types';

@Injectable({ providedIn: 'root' })
export class BrandingProfilesService {
    private readonly http = inject(HttpClient);
    private readonly tenantService = inject(TenantService);
    private readonly base = `${environment.apiUrl}/api/brandingprofiles`;

    getAll(): Observable<BrandingProfileDto[]> {
        return this.http.get<BrandingProfileDto[]>(this.base);
    }

    get(id: string): Observable<BrandingProfileDto> {
        return this.http.get<BrandingProfileDto>(`${this.base}/${id}`);
    }

    // Create returns Task<Guid> → JSON-quoted "<guid>" → parses fine as JSON.
    create(req: CreateBrandingProfileRequest): Observable<string> {
        return this.http.post<string>(this.base, req);
    }

    // Update / Delete return Task<ActionResult<string>> + Ok($"…updated.") and Task<string>
    // respectively. ASP.NET's StringOutputFormatter wins content negotiation for primitive
    // string returns, so the body is plain text (no JSON quotes). Without responseType:'text'
    // HttpClient would try JSON.parse and fire the error callback on HTTP 200.
    update(id: string, req: UpdateBrandingProfileRequest): Observable<string> {
        return this.http.put(`${this.base}/${id}`, req, { responseType: 'text' });
    }

    delete(id: string): Observable<string> {
        return this.http.delete(`${this.base}/${id}`, { responseType: 'text' });
    }

    uploadLogo(id: string, file: File): Observable<string> {
        const fd = new FormData();
        fd.append('file', file, file.name);
        return this.http.put<string>(`${this.base}/${id}/logo`, fd, { responseType: 'text' as 'json' });
    }

    deleteLogo(id: string): Observable<string> {
        return this.http.delete<string>(`${this.base}/${id}/logo`, { responseType: 'text' as 'json' });
    }

    /** Public URL of a profile's logo. Anonymous endpoint — safe to embed in <img src>.
     *  <img> requests bypass Angular's auth interceptor so the `tenant` HTTP header
     *  isn't sent; the tenant is passed as a query-string param instead (matches the
     *  backend's WithQueryStringStrategy). Required for the broken-image fix on multi-
     *  tenant subdomains where Finbuckle has no other way to resolve which tenant DB
     *  to read from. */
    logoUrl(id: string, cacheBust?: string): string {
        const v = cacheBust ?? Date.now().toString();
        const tenant = this.tenantService.resolve();
        const tenantParam = tenant ? `&tenant=${encodeURIComponent(tenant)}` : '';
        return `${this.base}/${id}/logo?v=${v}${tenantParam}`;
    }
}
