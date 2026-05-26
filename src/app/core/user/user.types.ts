export interface User
{
    id: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    email: string;
    avatar?: string;
    status?: string;
    /** Phase 2.58 — null = inherit tenant default. */
    preferredLanguage?: string | null;
}

// API User Management Types (exactly matching API docs)
export interface UserDetailsDto
{
    id: string;
    userName?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    isActive: boolean;
    emailConfirmed: boolean;
    phoneNumber?: string;
    imageUrl?: string;
    phoneNumberConfirmed: boolean;
    address?: string;
    gender?: string;
    dateOfBirth?: string;
    /** Phase 2.58 — null = inherit tenant default. */
    preferredLanguage?: string | null;
}

export interface CreateUserRequest
{
    firstName: string;
    lastName: string;
    email: string;
    userName: string;
    password: string;
    confirmPassword: string;
    phoneNumber?: string;
    address?: string;
    gender?: string;
    dateOfBirth?: string;
}

export interface UpdateUserRequest
{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    address?: string;
    gender?: string;
    dateOfBirth?: string;
    image?: FileUploadRequest;
    deleteCurrentImage?: boolean;
    /** Phase 2.58 — null = inherit tenant default. */
    preferredLanguage?: string | null;
}

export interface ToggleUserStatusRequest
{
    activateUser: boolean;
    userId?: string;
}

export interface UserRoleDto
{
    roleId?: string;
    roleName?: string;
    description?: string;
    enabled: boolean;
}

export interface UserRolesRequest
{
    userRoles: UserRoleDto[];
}

// Base Filter (from API docs)
export interface BaseFilter
{
    advancedSearch?: Search;
    keyword?: string;
}

// Search (from API docs)
export interface Search
{
    fields: string[];
    keyword?: string;
}

// Pagination Filter (from API docs)
export interface PaginationFilter extends BaseFilter
{
    pageNumber: number;
    pageSize: number;
    orderBy?: string[];
}

// User List Filter (from API docs)
export interface UserListFilter extends PaginationFilter
{
    name?: string;
    isActive?: boolean;
}

export interface PaginationResponseOfUserDetailsDto
{
    data: UserDetailsDto[];
    currentPage: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

export interface SelfRegisterRequest
{
    firstName: string;
    lastName: string;
    email: string;
    userName: string;
    password: string;
    confirmPassword: string;
    phoneNumber?: string;
    activateUser: boolean;
    autoConfirmEmail: boolean;
    autoConfirmPhoneNumber: boolean;
}

export interface FileUploadRequest
{
    name: string;
    extension: string;
    data: string;
}
