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
                    id: payload.sub || payload.nameid,
                    name: payload.name || payload.given_name + ' ' + payload.family_name,
                    email: payload.email,
                    avatar: payload.picture || null,
                    status: 'online'
                };
                this._user.next(user);
            } catch (error) {
                console.error('Error parsing token:', error);
                // Set a default user if token parsing fails
                const defaultUser: User = {
                    id: 'default',
                    name: 'User',
                    email: 'user@example.com',
                    avatar: null,
                    status: 'online'
                };
                this._user.next(defaultUser);
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
        return this._httpClient.post(`${this.baseUrl}/api/users`, request, { 
            responseType: 'blob',
            headers: { 'Content-Type': 'application/json' }
        })
            .pipe(
                map(blob => {
                    console.log('UserService - createUser blob response:', blob);
                    // Convert blob to text if it's not empty
                    if (blob.size > 0) {
                        return new Promise<string>((resolve) => {
                            const reader = new FileReader();
                            reader.onload = () => resolve(reader.result as string);
                            reader.readAsText(blob);
                        });
                    } else {
                        return Promise.resolve('');
                    }
                }),
                mergeMap(promise => from(promise)),
                tap(response => {
                    console.log('UserService - createUser final response:', response);
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
        return this._httpClient.put(`${this.baseUrl}/api/users/${request.id}`, request, { 
            responseType: 'blob',
            headers: { 'Content-Type': 'application/json' }
        })
            .pipe(
                map(blob => {
                    console.log('UserService - updateUser blob response:', blob);
                    // Convert blob to text if it's not empty
                    if (blob.size > 0) {
                        return new Promise<string>((resolve) => {
                            const reader = new FileReader();
                            reader.onload = () => resolve(reader.result as string);
                            reader.readAsText(blob);
                        });
                    } else {
                        return Promise.resolve('');
                    }
                }),
                mergeMap(promise => from(promise)),
                tap(response => {
                    console.log('UserService - updateUser final response:', response);
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
