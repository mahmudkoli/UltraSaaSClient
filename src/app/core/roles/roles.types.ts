export interface RoleDto {
    id: string;
    name: string;
    description?: string;
    isDefault?: boolean;
}

export interface PermissionDto {
    name: string;
    description?: string;
    action?: string;
    resource?: string;
    category?: string;
    riskLevel?: string;
}

export interface RoleWithPermissionsDto extends RoleDto {
    permissions: string[];
}

export interface CreateOrUpdateRoleRequest {
    id?: string;
    name: string;
    description?: string;
}

export interface UpdateRolePermissionsRequest {
    roleId: string;
    permissions: string[];
}
