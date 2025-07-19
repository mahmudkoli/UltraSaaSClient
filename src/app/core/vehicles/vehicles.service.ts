import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
    VehicleDto,
    CreateVehicleRequest,
    UpdateVehicleRequest,
    SearchVehiclesRequest,
    PaginationResponse
} from './vehicles.types';

@Injectable({providedIn: 'root'})
export class VehiclesService
{
    private _httpClient = inject(HttpClient);
    private readonly baseUrl = environment.apiUrl;

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Search vehicles using available filters
     */
    search(request: SearchVehiclesRequest): Observable<PaginationResponse<VehicleDto>>
    {
        return this._httpClient.post<PaginationResponse<VehicleDto>>(`${this.baseUrl}/api/v1/vehicles/search`, request);
    }

    /**
     * Get vehicle details by ID
     */
    getById(id: string): Observable<VehicleDto>
    {
        return this._httpClient.get<VehicleDto>(`${this.baseUrl}/api/v1/vehicles/${id}`);
    }

    /**
     * Create a new vehicle
     */
    create(request: CreateVehicleRequest): Observable<string>
    {
        return this._httpClient.post<string>(`${this.baseUrl}/api/v1/vehicles`, request);
    }

    /**
     * Update a vehicle
     */
    update(id: string, request: UpdateVehicleRequest): Observable<string>
    {
        return this._httpClient.put<string>(`${this.baseUrl}/api/v1/vehicles/${id}`, request);
    }

    /**
     * Delete a vehicle
     */
    delete(id: string): Observable<string>
    {
        return this._httpClient.delete<string>(`${this.baseUrl}/api/v1/vehicles/${id}`);
    }
} 