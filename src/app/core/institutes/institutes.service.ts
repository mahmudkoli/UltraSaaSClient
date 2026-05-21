import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApiService } from '../services/base-api.service';
import {
    InstituteDto,
    CreateInstituteRequest,
    UpdateInstituteRequest,
    InstituteSearchParams,
    PaginationResponse,
    UpdateInstituteBrandingRequest,
    UpdateInstituteStatisticsRequest,
    InstituteUsageDto,
    InstituteDashboardSummary,
    UpdateInstituteCapacityRequest,
    SuspendInstituteRequest,
    ArchiveInstituteRequest
} from './institutes.types';

@Injectable({
    providedIn: 'root'
})
export class InstitutesService extends BaseApiService {

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    // ============= BASIC CRUD OPERATIONS =============

    /**
     * Get all institutes with optional filtering
     */
    getAll(params?: InstituteSearchParams): Observable<InstituteDto[]> {
        let httpParams = new HttpParams();

        if (params) {
            if (params.SearchString) {
                httpParams = httpParams.set('SearchString', params.SearchString);
            }
            if (params.Type) {
                httpParams = httpParams.set('Type', params.Type);
            }
            if (params.Status) {
                httpParams = httpParams.set('Status', params.Status);
            }
        }

        return this.get<InstituteDto[]>('/api/institute', httpParams);
    }

    /**
     * Get paginated list of institutes
     */
    getPaginated(pageNumber: number = 1, pageSize: number = 10, params?: InstituteSearchParams): Observable<PaginationResponse<InstituteDto>> {
        let httpParams = new HttpParams();
        httpParams = httpParams.set('pageNumber', pageNumber.toString());
        httpParams = httpParams.set('pageSize', pageSize.toString());

        if (params) {
            if (params.SearchString) {
                httpParams = httpParams.set('SearchString', params.SearchString);
            }
            if (params.Type) {
                httpParams = httpParams.set('Type', params.Type);
            }
            if (params.Status) {
                httpParams = httpParams.set('Status', params.Status);
            }
        }

        return this.get<PaginationResponse<InstituteDto>>('/api/institute/paginated', httpParams);
    }

    /**
     * Get institute by ID
     */
    getById(id: string): Observable<InstituteDto> {
        return this.get<InstituteDto>(`/api/institute/${id}`);
    }

    /**
     * Create a new institute
     */
    create(request: CreateInstituteRequest): Observable<string> {
        return this.post<string>('/api/institute', request);
    }

    /**
     * Update an institute
     */
    update(id: string, request: UpdateInstituteRequest): Observable<string> {
        return this.put<string>(`/api/institute/${id}`, request);
    }

    /**
     * Check if institute code exists
     */
    checkCodeExists(code: string): Observable<boolean> {
        return this.get<boolean>(`/api/institute/exists/code/${code}`);
    }


    // ============= STATUS MANAGEMENT =============

    /**
     * Activate an institute
     */
    activate(id: string): Observable<string> {
        return this.post<string>(`/api/institute/${id}/activate`, {});
    }

    /**
     * Suspend an institute
     */
    suspend(id: string, request: SuspendInstituteRequest): Observable<string> {
        return this.post<string>(`/api/institute/${id}/suspend`, request);
    }

    /**
     * Reactivate a suspended institute
     */
    reactivate(id: string): Observable<string> {
        return this.post<string>(`/api/institute/${id}/reactivate`, {});
    }

    /**
     * Archive an institute
     */
    archive(id: string, request: ArchiveInstituteRequest): Observable<string> {
        return this.post<string>(`/api/institute/${id}/archive`, request);
    }

    // ============= BRANDING MANAGEMENT =============

    /**
     * Update institute branding
     */
    updateBranding(id: string, request: UpdateInstituteBrandingRequest): Observable<string> {
        return this.put<string>(`/api/institute/${id}/branding`, request);
    }

    // ============= CAPACITY & STATISTICS =============

    /**
     * Update institute capacity
     */
    updateCapacity(id: string, request: UpdateInstituteCapacityRequest): Observable<string> {
        return this.put<string>(`/api/institute/${id}/capacity`, request);
    }

    /**
     * Update institute statistics
     */
    updateStatistics(id: string, request: UpdateInstituteStatisticsRequest): Observable<string> {
        return this.put<string>(`/api/institute/${id}/statistics`, request);
    }

    /**
     * Get institute usage
     */
    getUsage(id: string): Observable<InstituteUsageDto> {
        return this.get<InstituteUsageDto>(`/api/institute/${id}/usage`);
    }

    // ============= ANALYTICS & REPORTING =============

    /**
     * Get dashboard summary
     */
    getDashboardSummary(): Observable<InstituteDashboardSummary> {
        return this.get<InstituteDashboardSummary>('/api/institute/dashboard-summary');
    }

    /**
     * Get pending setup institutes
     */
    getPendingSetup(): Observable<InstituteDto[]> {
        return this.get<InstituteDto[]>('/api/institute/pending-setup');
    }

    // ============= SETUP & VALIDATION =============

    /**
     * Complete institute setup
     */
    completeSetup(id: string): Observable<string> {
        return this.post<string>(`/api/institute/${id}/complete-setup`, {});
    }

    /**
     * Validate institute is fully set up (returns true if all required fields populated).
     */
    validateHealth(id: string): Observable<boolean> {
        return this.post<boolean>(`/api/institute/${id}/validate`, {});
    }

    // ============= BACKWARD COMPATIBILITY =============

    /**
     * Deactivate an institute (Deprecated: Use suspend instead)
     * @deprecated Use suspend endpoint instead
     */
    deactivate(id: string): Observable<string> {
        return this.post<string>(`/api/institute/${id}/deactivate`, {});
    }
} 