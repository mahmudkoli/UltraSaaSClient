import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from '../services/base-api.service';
import {
    TenantDto,
    CreateTenantRequest,
    UpdateTenantRequest,
    CreateTenantWithInstituteRequest,
    CreateTenantWithInstituteResponse,
    TenantWithPermissionsDto,
    UpdateTenantPermissionsRequest,
    PermissionDto,
    PaginationResponse,
    SuspendTenantRequest,
    ArchiveTenantRequest,
    CancelTenantRequest,
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

    update(id: string, request: UpdateTenantRequest): Observable<string> {
        return this.putText(`/api/tenants/${id}`, request);
    }

    // ============= TENANT WITH INSTITUTE =============

    createWithInstitute(request: CreateTenantWithInstituteRequest): Observable<CreateTenantWithInstituteResponse> {
        return this.post<CreateTenantWithInstituteResponse>('/api/tenants/with-institute', request);
    }

    // ============= STATUS MANAGEMENT =============

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

    /** Phase v1-C7 — terminal cancellation. RecordPayment does NOT auto-reactivate. */
    cancel(id: string, request: CancelTenantRequest): Observable<string> {
        return this.postText(`/api/tenants/${id}/cancel`, request);
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

    // ============= BACKWARD COMPATIBILITY =============

    /** @deprecated Use suspend instead */
    deactivate(id: string): Observable<string> {
        return this.postText(`/api/tenants/${id}/deactivate`, {});
    }
}
