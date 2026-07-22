export interface DesignationDto {
    id: string;
    name: string;
    code?: string;
    level?: number;
    description?: string;
    isActive: boolean;
    createdOn: string;
    lastModifiedOn?: string;
}

export interface CreateDesignationRequest {
    name: string;
    code?: string;
    level?: number;
    description?: string;
}

export interface UpdateDesignationRequest {
    id: string;
    name?: string;
    code?: string;
    level?: number;
    description?: string;
    isActive?: boolean;
}

export interface SearchDesignationsRequest {
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
