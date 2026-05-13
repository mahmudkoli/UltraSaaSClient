import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { TenantService } from 'app/core/tenant/tenant.service';
import { CreateOutletRequest, OutletDto, UpdateOutletRequest } from './outlets.types';

@Injectable({ providedIn: 'root' })
export class OutletsService {
    private readonly http = inject(HttpClient);
    private readonly tenantService = inject(TenantService);
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

    // Backend returns plain text (Ok($"Logo updated…")) — opt out of JSON parsing so
    // the rxjs next: branch fires on success (otherwise the form shows "Upload failed"
    // and refreshLogoPreview() never runs, so the preview stays stale).
    uploadLogo(id: string, file: File): Observable<string> {
        const fd = new FormData();
        fd.append('file', file, file.name);
        return this.http.put(`${this.base}/${id}/logo`, fd, { responseType: 'text' });
    }

    deleteLogo(id: string): Observable<string> {
        return this.http.delete(`${this.base}/${id}/logo`, { responseType: 'text' });
    }

    /** Public URL for an outlet's logo image, suitable for <img src>. Adds a
     * cache-bust token tied to the logo mime type so re-uploads refresh.
     * Includes &tenant=<id> because <img> bypasses Angular's auth interceptor —
     * Finbuckle would otherwise have no way to resolve the tenant on the demo deploy. */
    logoUrl(id: string, cacheBust?: string): string {
        const v = cacheBust ?? Date.now().toString();
        const tenant = this.tenantService.resolve();
        const tenantParam = tenant ? `&tenant=${encodeURIComponent(tenant)}` : '';
        return `${this.base}/${id}/logo?v=${v}${tenantParam}`;
    }
}
