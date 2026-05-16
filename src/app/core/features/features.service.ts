import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApiService } from '../services/base-api.service';
import {
    FeatureDto,
    TenantFeatureDto,
    TenantFeatureManagementDto,
} from './features.types';

/**
 * Phase 2.56 — read-only. TenantFeature rows are plan-derived; the four
 * write endpoints (assign / enable / disable / bulk-update) and the Create
 * Feature endpoint are gone. Bringing them back requires a real
 * per-tenant override design (see CLEANUP-LOG.md §Phase 2.56).
 */
@Injectable({ providedIn: 'root' })
export class FeaturesService extends BaseApiService {
    /** Catalog — currently CUSTOM_BRAND only. */
    getAllFeatures(): Observable<FeatureDto[]> {
        return this.get<FeatureDto[]>('/api/feature');
    }

    /** Per-tenant enabled features. */
    getTenantFeatures(tenantId: string, isEnabled?: boolean): Observable<TenantFeatureDto[]> {
        let httpParams = new HttpParams();
        if (isEnabled !== undefined) {
            httpParams = httpParams.set('isEnabled', isEnabled.toString());
        }
        return this.get<TenantFeatureDto[]>(`/api/feature/tenant/${tenantId}`, httpParams);
    }

    /** Combined catalog + tenant state for the read-only management page. */
    getTenantFeatureManagement(tenantId: string): Observable<TenantFeatureManagementDto> {
        return this.get<TenantFeatureManagementDto>(`/api/feature/tenant/${tenantId}/management`);
    }
}
