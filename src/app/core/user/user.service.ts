import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { User, 
    UserDetailsDto,
    CreateUserRequest,
    UpdateUserRequest,
    ToggleUserStatusRequest,
    UserRoleDto,
    UserRolesRequest,
    UserListFilter,
    PaginationResponseOfUserDetailsDto,
    SelfRegisterRequest
} from './user.types';
import { map, Observable, ReplaySubject, tap, catchError, from, mergeMap } from 'rxjs';

@Injectable({providedIn: 'root'})
export class UserService
{
    private _httpClient = inject(HttpClient);
    private _user: ReplaySubject<User | null> = new ReplaySubject<User | null>(1);
    private readonly baseUrl = environment.apiUrl;

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for user
     *
     * @param value
     */
    set user(value: User | null)
    {
        // Store the value
        this._user.next(value);
    }

    get user$(): Observable<User | null>
    {
        return this._user.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get the current signed-in user data
     */
    get(): Observable<User>
    {
        return this._httpClient.get<User>(`${this.baseUrl}/api/personal/profile`).pipe(
            map((user) =>
            {
                // /api/personal/profile returns firstName + lastName separately
                // but the sidebar header and the avatar initials read user.name.
                // Compose the display name once here so every consumer gets it.
                const composed = [user.firstName, user.lastName]
                    .filter(part => part && part.trim().length > 0)
                    .join(' ')
                    .trim();
                return { ...user, name: user.name || composed || user.email };
            }),
            tap((user) =>
            {
                this._user.next(user);
            }),
        );
    }

    /**
     * Initialize user data from auth token
     */
    initializeUserFromToken(): void
    {
        const token = localStorage.getItem('access_token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const user: User = {
                    id: payload.sub || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
                    name: payload.fullName || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || 'User',
                    email: payload.email || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
                    avatar: payload.image_url || null,
                    status: 'online'
                };
                this._user.next(user);
            } catch (error) {
                console.error('Error parsing token:', error);
                this._user.next(null);
            }
        }
    }

    /**
     * Update the user
     *
     * @param user
     */
    update(user: User): Observable<any>
    {
        return this._httpClient.patch<User>('api/common/user', {user}).pipe(
            map((response) =>
            {
                this._user.next(response);
            }),
        );
    }

    // -----------------------------------------------------------------------------------------------------
    // @ API User Management methods (exactly matching API docs)
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get list of all users
     * GET /api/users
     */
    getUsers(): Observable<UserDetailsDto[]>
    {
        return this._httpClient.get<UserDetailsDto[]>(`${this.baseUrl}/api/users`);
    }

    /**
     * Search users with pagination
     * POST /api/users/search
     */
    searchUsers(filter: UserListFilter): Observable<PaginationResponseOfUserDetailsDto>
    {
        console.log('UserService - searchUsers called with filter:', filter);
        return this._httpClient.post<PaginationResponseOfUserDetailsDto>(`${this.baseUrl}/api/users/search`, filter)
            .pipe(
                tap(response => {
                    console.log('UserService - searchUsers response:', response);
                })
            );
    }

    /**
     * Get user by ID
     * GET /api/users/{id}
     */
    getUserById(id: string): Observable<UserDetailsDto>
    {
        return this._httpClient.get<UserDetailsDto>(`${this.baseUrl}/api/users/${id}`);
    }

    /**
     * Create a new user
     * POST /api/users
     */
    createUser(request: CreateUserRequest): Observable<string>
    {
        console.log('UserService - createUser called with request:', request);
        return this._httpClient.post(`${this.baseUrl}/api/users`, request, { responseType: 'text' })
            .pipe(
                tap(response => {
                    console.log('UserService - createUser response:', response);
                }),
                catchError(error => {
                    console.error('UserService - createUser error:', error);
                    throw error;
                })
            );
    }

    /**
     * Update a user
     * PUT /api/users/{id}
     */
    updateUser(request: UpdateUserRequest): Observable<any>
    {
        console.log('UserService - updateUser called with request:', request);
        return this._httpClient.put(`${this.baseUrl}/api/users/${request.id}`, request, { responseType: 'text' })
            .pipe(
                tap(response => {
                    console.log('UserService - updateUser response:', response);
                }),
                catchError(error => {
                    console.error('UserService - updateUser error:', error);
                    throw error;
                })
            );
    }

    /**
     * Toggle user status
     * POST /api/users/{id}/toggle-status
     */
    toggleUserStatus(id: string, activateUser: boolean): Observable<void>
    {
        const request: ToggleUserStatusRequest = {
            activateUser: activateUser,
            userId: id
        };
        return this._httpClient.post<void>(`${this.baseUrl}/api/users/${id}/toggle-status`, request);
    }

    /**
     * Admin-power reset of another user's password.
     * POST /api/users/{id}/admin-reset-password
     *
     * No old password required. Server flips MustChangePassword=true on the
     * target user, so they're routed to Change Password on next sign-in.
     */
    adminResetPassword(id: string, password: string): Observable<string>
    {
        return this._httpClient.post<string>(
            `${this.baseUrl}/api/users/${id}/admin-reset-password`,
            { password, confirmPassword: password },
            { responseType: 'text' as 'json' }
        );
    }

    /**
     * Get user roles
     * GET /api/users/{id}/roles
     */
    getUserRoles(id: string): Observable<UserRoleDto[]>
    {
        return this._httpClient.get<UserRoleDto[]>(`${this.baseUrl}/api/users/${id}/roles`);
    }

    /**
     * Assign roles to user
     * POST /api/users/{id}/roles
     */
    assignUserRoles(id: string, request: UserRolesRequest): Observable<string>
    {
        return this._httpClient.post<string>(`${this.baseUrl}/api/users/${id}/roles`, request);
    }

    /**
     * Get the outlets a user can access (empty list = all outlets)
     * GET /api/users/{id}/outlets
     */
    getUserOutlets(id: string): Observable<string[]>
    {
        return this._httpClient.get<string[]>(`${this.baseUrl}/api/users/${id}/outlets`);
    }

    /**
     * Replace the outlets a user can access (empty list = all outlets)
     * PUT /api/users/{id}/outlets
     */
    assignUserOutlets(id: string, outletIds: string[]): Observable<string>
    {
        return this._httpClient.put<string>(`${this.baseUrl}/api/users/${id}/outlets`, { userId: id, outletIds });
    }

    /**
     * Self register a new user
     * POST /api/users/self-register
     */
    selfRegister(request: SelfRegisterRequest): Observable<string>
    {
        return this._httpClient.post<string>(`${this.baseUrl}/api/users/self-register`, request);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Password and confirmation methods (exactly matching API docs)
    // -----------------------------------------------------------------------------------------------------

    /**
     * Forgot password
     * POST /api/users/forgot-password
     */
    forgotPassword(email: string): Observable<string>
    {
        return this._httpClient.post<string>(`${this.baseUrl}/api/users/forgot-password`, { email });
    }

    /**
     * Reset password
     * POST /api/users/reset-password
     */
    resetPassword(email: string, password: string, token: string): Observable<string>
    {
        return this._httpClient.post<string>(`${this.baseUrl}/api/users/reset-password`, { 
            email, 
            password, 
            token 
        });
    }

    /**
     * Confirm email (GET method with query parameters)
     * GET /api/users/confirm-email?tenant={tenant}&userId={userId}&code={code}
     */
    confirmEmail(tenant: string, userId: string, code: string): Observable<string>
    {
        const params = new URLSearchParams({
            tenant: tenant,
            userId: userId,
            code: code
        });
        return this._httpClient.get<string>(`${this.baseUrl}/api/users/confirm-email?${params.toString()}`);
    }

    /**
     * Confirm phone number (GET method with query parameters)
     * GET /api/users/confirm-phone-number?userId={userId}&code={code}
     */
    confirmPhoneNumber(userId: string, code: string): Observable<string>
    {
        const params = new URLSearchParams({
            userId: userId,
            code: code
        });
        return this._httpClient.get<string>(`${this.baseUrl}/api/users/confirm-phone-number?${params.toString()}`);
    }
}
