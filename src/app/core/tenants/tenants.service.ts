import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from '../services/base-api.service';
import {
    TenantDto,
    CreateTenantRequest,
    UpdateTenantRequest,
    TenantWithPermissionsDto,
    UpdateTenantPermissionsRequest,
    PermissionDto,
    PaginationResponse,
    SuspendTenantRequest,
    ArchiveTenantRequest,
    TenantUsageDto,
} from './tenants.types';

@Injectable({ providedIn: 'root' })
export class TenantsService extends BaseApiService {
    // ============= BASIC CRUD =============

    getAll(): Observable<TenantDto[]> {
        return this.get<TenantDto[]>('/api/tenants');
    }

    getPaginated(pageNumber = 1, pageSize = 10, searchString?: string): Observable<PaginationResponse<TenantDto>> {
        const params = new URLSearchParams();
        params.append('pageNumber', pageNumber.toString());
        params.append('pageSize', pageSize.toString());
        if (searchString) params.append('searchString', searchString);
        return this.get<PaginationResponse<TenantDto>>(`/api/tenants/paginated?${params.toString()}`);
    }

    getById(id: string): Observable<TenantDto> {
        return this.get<TenantDto>(`/api/tenants/${id}`);
    }

    create(request: CreateTenantRequest): Observable<string> {
        return this.postText('/api/tenants', request);
    }

    /**
     * Update an existing tenant. When `request.force` is true, appends
     * `?force=true` so the backend bypasses the plan-change quota pre-flight
     * (caller has already accepted the over-quota state).
     */
    update(id: string, request: UpdateTenantRequest): Observable<string> {
        const url = request.force ? `/api/tenants/${id}?force=true` : `/api/tenants/${id}`;
        return this.putText(url, request);
    }

    // ============= STATUS =============

    activate(id: string): Observable<string> {
        return this.postText(`/api/tenants/${id}/activate`, {});
    }

    suspend(id: string, request: SuspendTenantRequest): Observable<string> {
        return this.postText(`/api/tenants/${id}/suspend`, request);
    }

    reactivate(id: string): Observable<string> {
        return this.postText(`/api/tenants/${id}/reactivate`, {});
    }

    archive(id: string, request: ArchiveTenantRequest): Observable<string> {
        return this.postText(`/api/tenants/${id}/archive`, request);
    }

    /** Phase 2.55 — terminal cancellation. Distinct from suspend (admin-initiated,
     * reversible). Record Payment will NOT auto-reactivate a cancelled tenant. */
    cancel(id: string, reason: string): Observable<string> {
        return this.postText(`/api/tenants/${id}/cancel`, { tenantId: id, reason });
    }

    /** Suspend helper used by the list / dashboard action buttons. */
    suspendTenant(id: string, reason: string): Observable<string> {
        return this.suspend(id, { tenantId: id, reason });
    }

    /** Archive helper used by the list / dashboard action buttons. */
    archiveTenant(id: string, reason: string): Observable<string> {
        return this.archive(id, { tenantId: id, reason });
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

    // ============= USAGE =============

    getUsage(id: string): Observable<TenantUsageDto> {
        return this.get<TenantUsageDto>(`/api/tenants/${id}/usage`);
    }

    getAllUsage(): Observable<TenantUsageDto[]> {
        return this.get<TenantUsageDto[]>('/api/tenants/usage/all');
    }

    // ============= PERMISSIONS =============

    getAvailablePermissions(): Observable<PermissionDto[]> {
        return this.get<PermissionDto[]>('/api/tenants/permissions/available');
    }

    getWithPermissions(id: string): Observable<TenantWithPermissionsDto> {
        return this.get<TenantWithPermissionsDto>(`/api/tenants/${id}/permissions`);
    }

    updatePermissions(id: string, request: UpdateTenantPermissionsRequest): Observable<string> {
        return this.putText(`/api/tenants/${id}/permissions`, request);
    }
}
