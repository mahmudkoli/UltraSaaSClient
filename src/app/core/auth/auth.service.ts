import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
    TokenRequest,
    TokenResponse,
    RefreshTokenRequest
} from './auth.types';
import { UserService } from '../user/user.service';
import { PermissionsService } from './permissions.service';
import { FeaturesService } from './features.service';
import { TenantInfoService } from './tenant-info.service';
import { TenantService } from '../tenant/tenant.service';

@Injectable({providedIn: 'root'})
export class AuthService
{
    private _httpClient = inject(HttpClient);
    private _userService = inject(UserService);
    private _permissionsService = inject(PermissionsService);
    private _featuresService = inject(FeaturesService);
    private _tenantInfoService = inject(TenantInfoService);
    private _tenantService = inject(TenantService);
    private readonly baseUrl = environment.apiUrl;

    // -----------------------------------------------------------------------------------------------------
    // @ Authentication methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Login with email and password
     */
    login(request: TokenRequest): Observable<TokenResponse>
    {
        const tenantId = this._tenantService.resolve();

        let headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });

        if (tenantId) {
            headers = headers.set('tenant', tenantId);
        }

        return this._httpClient.post<TokenResponse>(`${this.baseUrl}/api/tokens`, request, { headers }).pipe(
            tap((response) => {
                // Store tokens in localStorage
                localStorage.setItem('access_token', response.token);
                localStorage.setItem('refresh_token', response.refreshToken);
                localStorage.setItem('refresh_token_expiry', response.refreshTokenExpiryTime);
                
                // Initialize user data from token
                this._userService.initializeUserFromToken();
            })
        );
    }

    /**
     * Refresh access token
     */
    refreshToken(request: RefreshTokenRequest): Observable<TokenResponse>
    {
        const tenantId = this._tenantService.resolve();

        let headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });

        if (tenantId) {
            headers = headers.set('tenant', tenantId);
        }

        return this._httpClient.post<TokenResponse>(`${this.baseUrl}/api/tokens/refresh`, request, { headers }).pipe(
            tap((response) => {
                // Update tokens in localStorage
                localStorage.setItem('access_token', response.token);
                localStorage.setItem('refresh_token', response.refreshToken);
                localStorage.setItem('refresh_token_expiry', response.refreshTokenExpiryTime);
            })
        );
    }

    /**
     * Logout - clear tokens
     */
    logout(): void
    {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('refresh_token_expiry');
        localStorage.removeItem('tenant_id');

        // Clear user data
        this._userService.user = null;
        this._permissionsService.clear();
        this._featuresService.clear();
        this._tenantInfoService.clear();
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean
    {
        return !!localStorage.getItem('access_token');
    }

    /**
     * Get current access token
     */
    getAccessToken(): string | null
    {
        return localStorage.getItem('access_token');
    }

    /**
     * Get current refresh token
     */
    getRefreshToken(): string | null
    {
        return localStorage.getItem('refresh_token');
    }

    /**
     * Set tenant ID
     */
    setTenantId(tenantId: string): void
    {
        localStorage.setItem('tenant_id', tenantId);
    }

    /**
     * Get tenant ID
     */
    getTenantId(): string | null
    {
        return localStorage.getItem('tenant_id');
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Password management methods (moved from user service for auth flow)
    // -----------------------------------------------------------------------------------------------------

    /**
     * Forgot password
     */
    forgotPassword(request: { email: string }): Observable<any>
    {
        return this._httpClient.post(`${this.baseUrl}/api/users/forgot-password`, request);
    }

    /**
     * Reset password
     */
    resetPassword(request: { email: string; token: string; password: string; confirmPassword: string }): Observable<any>
    {
        return this._httpClient.post(`${this.baseUrl}/api/users/reset-password`, request);
    }

    /**
     * Confirm email
     */
    confirmEmail(request: { userId: string; token: string }): Observable<any>
    {
        return this._httpClient.post(`${this.baseUrl}/api/users/confirm-email`, request);
    }

    /**
     * Confirm phone number
     */
    confirmPhoneNumber(request: { userId: string; token: string }): Observable<any>
    {
        return this._httpClient.post(`${this.baseUrl}/api/users/confirm-phone-number`, request);
    }

    /**
     * Sign up (self register)
     */
    signUp(request: { name: string; email: string; password: string; company: string }): Observable<string>
    {
        const signUpRequest = {
            firstName: request.name.split(' ')[0] || request.name,
            lastName: request.name.split(' ').slice(1).join(' ') || '',
            email: request.email,
            userName: request.email,
            password: request.password,
            confirmPassword: request.password,
            phoneNumber: '',
            activateUser: true,
            autoConfirmEmail: false,
            autoConfirmPhoneNumber: false
        };

        return this._httpClient.post<string>(`${this.baseUrl}/api/users/self-register`, signUpRequest);
    }

    /**
     * Unlock session (simplified to just login)
     */
    unlockSession(request: { email: string; password: string }): Observable<TokenResponse>
    {
        const loginRequest = {
            email: request.email,
            password: request.password
        };

        return this.login(loginRequest);
    }
}
