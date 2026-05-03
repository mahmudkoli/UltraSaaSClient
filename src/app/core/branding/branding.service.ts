import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import {
    BrandingProfileDto,
    CreateBrandingProfileRequest,
    UpdateBrandingProfileRequest,
} from './branding.types';

@Injectable({ providedIn: 'root' })
export class BrandingProfilesService {
    private readonly http = inject(HttpClient);
    private readonly base = `${environment.apiUrl}/api/brandingprofiles`;

    getAll(): Observable<BrandingProfileDto[]> {
        return this.http.get<BrandingProfileDto[]>(this.base);
    }

    get(id: string): Observable<BrandingProfileDto> {
        return this.http.get<BrandingProfileDto>(`${this.base}/${id}`);
    }

    create(req: CreateBrandingProfileRequest): Observable<string> {
        return this.http.post<string>(this.base, req);
    }

    update(id: string, req: UpdateBrandingProfileRequest): Observable<string> {
        return this.http.put<string>(`${this.base}/${id}`, req);
    }

    delete(id: string): Observable<string> {
        return this.http.delete<string>(`${this.base}/${id}`);
    }

    uploadLogo(id: string, file: File): Observable<string> {
        const fd = new FormData();
        fd.append('file', file, file.name);
        return this.http.put<string>(`${this.base}/${id}/logo`, fd, { responseType: 'text' as 'json' });
    }

    deleteLogo(id: string): Observable<string> {
        return this.http.delete<string>(`${this.base}/${id}/logo`, { responseType: 'text' as 'json' });
    }

    /** Public URL of a profile's logo. Anonymous endpoint — safe to embed in <img src>. */
    logoUrl(id: string, cacheBust?: string): string {
        const v = cacheBust ?? Date.now().toString();
        return `${this.base}/${id}/logo?v=${v}`;
    }
}
