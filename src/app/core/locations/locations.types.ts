export interface LocationDto {
    id: string;
    name: string;
    code?: string;
    address?: string;
    city?: string;
    isActive: boolean;
    createdOn: string;
    lastModifiedOn?: string;
}

export interface CreateLocationRequest {
    name: string;
    code?: string;
    address?: string;
    city?: string;
}

export interface UpdateLocationRequest {
    id: string;
    name?: string;
    code?: string;
    address?: string;
    city?: string;
    isActive?: boolean;
}

export interface SearchLocationsRequest {
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
