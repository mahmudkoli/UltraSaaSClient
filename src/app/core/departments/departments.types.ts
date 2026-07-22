export interface DepartmentDto {
    id: string;
    name: string;
    code?: string;
    description?: string;
    isActive: boolean;
    createdOn: string;
    lastModifiedOn?: string;
}

export interface CreateDepartmentRequest {
    name: string;
    code?: string;
    description?: string;
}

export interface UpdateDepartmentRequest {
    id: string;
    name?: string;
    code?: string;
    description?: string;
    isActive?: boolean;
}

export interface SearchDepartmentsRequest {
    pageNumber: number;
    pageSize: number;
    orderBy?: string[];
    keyword?: string;
    name?: string;
    isActive?: boolean;
}

export interface PaginationResponse<T> {
    data: T[];
    currentPage: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}
