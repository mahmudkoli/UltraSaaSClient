import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, of, tap } from 'rxjs';
import { environment } from 'environments/environment';

export type BusinessType = 'Generic' | 'Electronics' | 'Pharmacy' | 'Supermarket';

export interface TenantInfoDto {
    id: string;
    name: string;
    businessType: BusinessType;
    outletLabel: string;
}

/**
 * Cache of the current tenant's identity bits — id, name, BusinessType,
 * OutletLabel. Loaded once at app init alongside permissions/features. Used
 * to drive vertical UI gating (Pharmacy / Electronics / Supermarket /
 * Generic). Server-side, the same gates are enforced via the
 * RequireBusinessType attribute — this is the UI-visibility companion.
 */
@Injectable({ providedIn: 'root' })
export class TenantInfoService {
    private readonly http = inject(HttpClient);

    private readonly _info = signal<TenantInfoDto | null>(null);
    readonly info = this._info.asReadonly();
    readonly businessType = computed<BusinessType | null>(() => this._info()?.businessType ?? null);

    load(): Observable<TenantInfoDto | null> {
        return this.http
            .get<TenantInfoDto>(`${environment.apiUrl}/api/personal/tenant-info`)
            .pipe(
                tap(info => this._info.set(info ?? null)),
                catchError(() => {
                    this._info.set(null);
                    return of<TenantInfoDto | null>(null);
                }),
            );
    }

    /**
     * `true` when the current tenant's BusinessType is in the allow-list, OR
     * when the tenant is Generic (which always passes vertical gates).
     * Returns `true` defensively when info hasn't loaded yet so we don't
     * flash-hide nav before the resolver finishes.
     */
    isVertical(...allowed: BusinessType[]): boolean {
        const t = this._info();
        if (!t) return true;
        if (t.businessType === 'Generic') return true;
        return allowed.includes(t.businessType);
    }

    clear(): void { this._info.set(null); }
}
