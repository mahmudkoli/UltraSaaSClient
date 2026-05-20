import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from '../services/base-api.service';
import { CreatePlanRequest, PlanDto, UpdatePlanRequest } from './billing.types';

/**
 * Phase v1-C0.4 — platform-admin CRUD over SubscriptionPlan. All endpoints
 * gated by `Tenants.View` / `Tenants.Create` / `Tenants.Update` permissions
 * (root admin only). Tenant-side picker uses `getAll(activeOnly=true)`.
 */
@Injectable({ providedIn: 'root' })
export class PlansService extends BaseApiService {
    /** List plans. Pass `activeOnly=true` to filter out deactivated rows. */
    getAll(activeOnly = false): Observable<PlanDto[]> {
        return this.get<PlanDto[]>(`/api/subscriptionplans?activeOnly=${activeOnly}`);
    }

    getById(id: string): Observable<PlanDto> {
        return this.get<PlanDto>(`/api/subscriptionplans/${id}`);
    }

    create(request: CreatePlanRequest): Observable<string> {
        return this.post<string>('/api/subscriptionplans', request);
    }

    update(id: string, request: UpdatePlanRequest): Observable<string> {
        return this.putText(`/api/subscriptionplans/${id}`, request);
    }
}
