export interface CostCentreDto {
    id: string;
    name: string;
    code?: string;
    description?: string;
    isActive: boolean;
    createdOn: string;
    lastModifiedOn?: string;
}

export interface CreateCostCentreRequest {
    name: string;
    code?: string;
    description?: string;
}

export interface UpdateCostCentreRequest {
    id: string;
    name?: string;
    code?: string;
    description?: string;
    isActive?: boolean;
}

export interface SearchCostCentresRequest {
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
