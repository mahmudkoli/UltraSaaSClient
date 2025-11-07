import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApiService } from '../services/base-api.service';
import {
    FeatureDto,
    CreateFeatureRequest,
    AssignFeatureToTenantRequest,
    TenantFeatureDto,
    TenantFeatureManagementDto,
    UpdateTenantFeaturesRequest
} from './features.types';

@Injectable({
    providedIn: 'root'
})
export class FeaturesService extends BaseApiService {

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get all available features
     */
    getAllFeatures(): Observable<FeatureDto[]> {
        return this.get<FeatureDto[]>('/api/feature');
    }

    /**
     * Create a new feature
     */
    create(request: CreateFeatureRequest): Observable<string> {
        return this.postText('/api/feature', request);
    }

    /**
     * Assign a feature to a tenant
     */
    assignToTenant(request: AssignFeatureToTenantRequest): Observable<string> {
        return this.postText('/api/feature/assign', request);
    }

    /**
     * Get features assigned to a tenant
     */
    getTenantFeatures(tenantId: string, isEnabled?: boolean): Observable<TenantFeatureDto[]> {
        let httpParams = new HttpParams();

        if (isEnabled !== undefined) {
            httpParams = httpParams.set('isEnabled', isEnabled.toString());
        }

        return this.get<TenantFeatureDto[]>(`/api/feature/tenant/${tenantId}`, httpParams);
    }

    /**
     * Get tenant feature management data
     */
    getTenantFeatureManagement(tenantId: string): Observable<TenantFeatureManagementDto> {
        return this.get<TenantFeatureManagementDto>(`/api/feature/tenant/${tenantId}/management`);
    }

    /**
     * Update all features for a tenant
     */
    updateTenantFeatures(tenantId: string, request: UpdateTenantFeaturesRequest): Observable<string> {
        return this.putText(`/api/feature/tenant/${tenantId}/features`, request);
    }

    /**
     * Enable a feature for a tenant
     */
    enableFeature(tenantId: string, featureId: string): Observable<string> {
        return this.postText(`/api/feature/tenant/${tenantId}/features/${featureId}/enable`, {});
    }

    /**
     * Disable a feature for a tenant
     */
    disableFeature(tenantId: string, featureId: string): Observable<string> {
        return this.postText(`/api/feature/tenant/${tenantId}/features/${featureId}/disable`, {});
    }
} 