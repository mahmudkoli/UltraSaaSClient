import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from '../services/base-api.service';
import { 
    RouteDto,
    CreateRouteRequest,
    UpdateRouteRequest,
    SearchRoutesRequest,
    PaginationResponse
} from './routes.types';

@Injectable({providedIn: 'root'})
export class RoutesService extends BaseApiService
{
    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Search routes using available filters
     */
    search(request: SearchRoutesRequest): Observable<PaginationResponse<RouteDto>>
    {
        return this.post<PaginationResponse<RouteDto>>('/api/v1/routes/search', request);
    }

    /**
     * Get route details by ID
     */
    getById(id: string): Observable<RouteDto>
    {
        return this.get<RouteDto>(`/api/v1/routes/${id}`);
    }

    /**
     * Create a new route
     */
    create(request: CreateRouteRequest): Observable<string>
    {
        return this.post<string>('/api/v1/routes', request);
    }

    /**
     * Update a route
     */
    update(id: string, request: UpdateRouteRequest): Observable<string>
    {
        return this.put<string>(`/api/v1/routes/${id}`, request);
    }

    /**
     * Delete a route
     */
    deleteRoute(id: string): Observable<string>
    {
        return this.delete<string>(`/api/v1/routes/${id}`);
    }
} 