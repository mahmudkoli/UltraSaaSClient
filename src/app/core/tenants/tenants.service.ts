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
    BulkSuspendTenantsRequest,
    BulkActivateTenantsRequest,
    BulkUpdateBillingPlanRequest
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

    // ============= VERTICAL =============

    /**
     * Change a tenant's BusinessType + OutletLabel post-creation. High-stakes:
     * pivoting a tenant orphans existing batches/serials/etc. from their
     * vertical UI. Always wrap calls in a confirmation dialog.
     */
    updateVertical(id: string, businessType: string, outletLabel?: string): Observable<any> {
        return this.put<any>(`/api/tenants/${id}/vertical`, { businessType, outletLabel });
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

    // ============= ANALYTICS & REPORTING =============

    /**
     * Get tenants expiring soon
     */
    getExpiringTenants(daysAhead: number = 30): Observable<any[]> {
        return this.get<any[]>(`/api/tenants/expiring?daysAhead=${daysAhead}`);
    }

    /**
     * Get overdue tenants
     */
    getOverdueTenants(): Observable<any[]> {
        return this.get<any[]>('/api/tenants/overdue');
    }

    /**
     * Get high usage tenants
     */
    getHighUsageTenants(threshold: number = 90): Observable<any[]> {
        return this.get<any[]>(`/api/tenants/high-usage?threshold=${threshold}`);
    }

    /**
     * Get tenant analytics
     */
    getTenantAnalytics(id: string): Observable<any> {
        return this.get<any>(`/api/tenants/${id}/analytics`);
    }

    // ============= BULK OPERATIONS =============

    /**
     * Suspend multiple tenants
     */
    bulkSuspend(request: BulkSuspendTenantsRequest): Observable<string> {
        return this.postText('/api/tenants/bulk/suspend', request);
    }

    /**
     * Activate multiple tenants
     */
    bulkActivate(request: BulkActivateTenantsRequest): Observable<string> {
        return this.postText('/api/tenants/bulk/activate', request);
    }

    /**
     * Update billing plan for multiple tenants
     */
    bulkUpdateBillingPlan(request: BulkUpdateBillingPlanRequest): Observable<string> {
        return this.postText('/api/tenants/bulk/update-plan', request);
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

    // ============= HEALTH & VALIDATION =============

    /**
     * Get tenant health summary
     */
    getHealthSummary(id: string): Observable<any> {
        return this.get<any>(`/api/tenants/${id}/health`);
    }

    /**
     * Validate tenant health
     */
    validateHealth(id: string): Observable<boolean> {
        return this.post<boolean>(`/api/tenants/${id}/validate`, {});
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