import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { 
    PersonalProfileDto,
    UpdatePersonalProfileRequest,
    ChangePasswordRequest
} from './personal.types';
import { Observable } from 'rxjs';

@Injectable({providedIn: 'root'})
export class PersonalService
{
    private _httpClient = inject(HttpClient);
    private readonly baseUrl = environment.apiUrl;

    // -----------------------------------------------------------------------------------------------------
    // @ Personal profile methods (exactly matching API docs)
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get personal profile
     * GET /api/personal/profile
     */
    getPersonalProfile(): Observable<PersonalProfileDto>
    {
        return this._httpClient.get<PersonalProfileDto>(`${this.baseUrl}/api/personal/profile`);
    }

    /**
     * Update personal profile
     * PUT /api/personal/profile
     */
    updatePersonalProfile(request: UpdatePersonalProfileRequest): Observable<any>
    {
        return this._httpClient.put(`${this.baseUrl}/api/personal/profile`, request);
    }

    /**
     * Change password
     * PUT /api/personal/change-password
     */
    changePassword(request: ChangePasswordRequest): Observable<any>
    {
        return this._httpClient.put(`${this.baseUrl}/api/personal/change-password`, request);
    }

    /**
     * Get user permissions
     * GET /api/personal/permissions
     */
    getUserPermissions(): Observable<string[]>
    {
        return this._httpClient.get<string[]>(`${this.baseUrl}/api/personal/permissions`);
    }

    /**
     * Get user logs
     * GET /api/personal/logs
     */
    getUserLogs(): Observable<any[]>
    {
        return this._httpClient.get<any[]>(`${this.baseUrl}/api/personal/logs`);
    }
} 