import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from '../services/base-api.service';
import {
    TenantDto,
    CreateTenantRequest,
    UpdateTenantRequest,
    CreateTenantWithInstituteRequest,
    CreateTenantWithInstituteResponse,
    UpgradeSubscriptionRequest,
    TenantWithPermissionsDto,
    UpdateTenantPermissionsRequest,
    PermissionDto,
    PaginationResponse,
    SuspendTenantRequest,
    ArchiveTenantRequest,
    UpdateBillingPlanRequest,
    UpdateResourceLimitsRequest,
    TenantUsageDto,
    ExtendValidityRequest,
    UpdateResourceUsageRequest,
} from './tenants.types';

@Injectable({
    providedIn: 'root'
})
export class TenantsService extends BaseApiService {

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    // ============= BASIC CRUD OPERATIONS =============

    /**
     * Get all tenants
     */
    getAll(): Observable<TenantDto[]> {
        return this.get<TenantDto[]>('/api/tenants');
    }

    /**
     * Get paginated list of tenants
     */
    getPaginated(pageNumber: number = 1, pageSize: number = 10, searchString?: string): Observable<PaginationResponse<TenantDto>> {
        const params = new URLSearchParams();
        params.append('pageNumber', pageNumber.toString());
        params.append('pageSize', pageSize.toString());
        if (searchString) {
            params.append('searchString', searchString);
        }
        return this.get<PaginationResponse<TenantDto>>(`/api/tenants/paginated?${params.toString()}`);
    }

    /**
     * Get tenant by ID
     */
    getById(id: string): Observable<TenantDto> {
        return this.get<TenantDto>(`/api/tenants/${id}`);
    }

    /**
     * Create a new tenant
     */
    create(request: CreateTenantRequest): Observable<string> {
        return this.postText('/api/tenants', request);
    }

    /**
     * Update an existing tenant
     */
    update(id: string, request: UpdateTenantRequest): Observable<string> {
        return this.putText(`/api/tenants/${id}`, request);
    }

    // ============= TENANT WITH INSTITUTE =============

    /**
     * Create a new tenant with institute in a single operation
     */
    createWithInstitute(request: CreateTenantWithInstituteRequest): Observable<CreateTenantWithInstituteResponse> {
        return this.post<CreateTenantWithInstituteResponse>('/api/tenants/with-institute', request);
    }

    // ============= STATUS MANAGEMENT =============

    /**
     * Activate a tenant
     */
    activate(id: string): Observable<string> {
        return this.postText(`/api/tenants/${id}/activate`, {});
    }

    /**
     * Suspend a tenant temporarily
     */
    suspend(id: string, request: SuspendTenantRequest): Observable<string> {
        return this.postText(`/api/tenants/${id}/suspend`, request);
    }

    /**
     * Reactivate a suspended tenant
     */
    reactivate(id: string): Observable<string> {
        return this.postText(`/api/tenants/${id}/reactivate`, {});
    }

    /**
     * Archive a tenant
     */
    archive(id: string, request: ArchiveTenantRequest): Observable<string> {
        return this.postText(`/api/tenants/${id}/archive`, request);
    }

    // ============= SUBSCRIPTION & BILLING =============

    /**
     * Upgrade tenant subscription
     */
    upgradeSubscription(id: string, request: UpgradeSubscriptionRequest): Observable<string> {
        return this.postText(`/api/tenants/${id}/upgrade-subscription`, request);
    }

    /**
     * Update tenant billing plan
     */
    updateBillingPlan(id: string, request: UpdateBillingPlanRequest): Observable<string> {
        return this.putText(`/api/tenants/${id}/billing-plan`, request);
    }

    /**
     * Extend tenant validity period
     */
    extendValidity(id: string, request: ExtendValidityRequest): Observable<string> {
        return this.postText(`/api/tenants/${id}/extend-validity`, request);
    }

    // ============= RESOURCE MANAGEMENT =============

    /**
     * Update tenant resource limits
     */
    updateResourceLimits(id: string, request: UpdateResourceLimitsRequest): Observable<string> {
        return this.putText(`/api/tenants/${id}/resource-limits`, request);
    }

    /**
     * Get tenant resource usage
     */
    getUsage(id: string): Observable<TenantUsageDto> {
        return this.get<TenantUsageDto>(`/api/tenants/${id}/usage`);
    }

    /**
     * Get all tenants resource usage
     */
    getAllUsage(): Observable<TenantUsageDto[]> {
        return this.get<TenantUsageDto[]>('/api/tenants/usage/all');
    }

    /**
     * Update tenant current resource usage
     */
    updateUsage(id: string, request: UpdateResourceUsageRequest): Observable<string> {
        return this.postText(`/api/tenants/${id}/update-usage`, request);
    }

    // ============= PERMISSIONS =============

    /**
     * Get all available permissions that can be assigned to tenants
     */
    getAvailablePermissions(): Observable<PermissionDto[]> {
        return this.get<PermissionDto[]>('/api/tenants/permissions/available');
    }

    /**
     * Get tenant with permissions
     */
    getWithPermissions(id: string): Observable<TenantWithPermissionsDto> {
        return this.get<TenantWithPermissionsDto>(`/api/tenants/${id}/permissions`);
    }

    /**
     * Update tenant permissions
     */
    updatePermissions(id: string, request: UpdateTenantPermissionsRequest): Observable<string> {
        return this.putText(`/api/tenants/${id}/permissions`, request);
    }

    // ============= BACKWARD COMPATIBILITY =============

    /**
     * Deactivate a tenant (Deprecated: Use suspend instead)
     * @deprecated Use suspend endpoint instead
     */
    deactivate(id: string): Observable<string> {
        return this.postText(`/api/tenants/${id}/deactivate`, {});
    }

    /**
     * Legacy method names for backward compatibility
     */
    suspendTenant(id: string, reason: string): Observable<string> {
        return this.suspend(id, { tenantId: id, reason });
    }

    archiveTenant(id: string, reason: string): Observable<string> {
        return this.archive(id, { tenantId: id, reason });
    }
} 