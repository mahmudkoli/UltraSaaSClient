import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import {
    CreateOrUpdateRoleRequest,
    RoleDto,
    RoleWithPermissionsDto,
    UpdateRolePermissionsRequest,
} from './roles.types';

@Injectable({ providedIn: 'root' })
export class RolesService {
    private readonly http = inject(HttpClient);
    private readonly base = `${environment.apiUrl}/api/roles`;

    getAll = (): Observable<RoleDto[]> => this.http.get<RoleDto[]>(this.base);

    get = (id: string): Observable<RoleDto> => this.http.get<RoleDto>(`${this.base}/${id}`);

    getWithPermissions = (id: string): Observable<RoleWithPermissionsDto> =>
        this.http.get<RoleWithPermissionsDto>(`${this.base}/${id}/permissions`);

    createOrUpdate = (req: CreateOrUpdateRoleRequest): Observable<string> =>
        this.http.post<string>(this.base, req);

    delete = (id: string): Observable<string> => this.http.delete<string>(`${this.base}/${id}`);

    updatePermissions = (id: string, req: UpdateRolePermissionsRequest): Observable<string> =>
        this.http.put<string>(`${this.base}/${id}/permissions`, req);
}
