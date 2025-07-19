export interface RouteDto
{
    id: string;
    name: string;
    code: string;
    description?: string;
    startLocation: string;
    endLocation: string;
    distance: number;
    estimatedTime?: string; // HH:MM:SS format
    fare: number;
    isActive: boolean;
    stops?: string;
    remarks?: string;
    createdOn: string;
    lastModifiedOn?: string;
}

export interface CreateRouteRequest
{
    name: string;
    code: string;
    description?: string;
    startLocation: string;
    endLocation: string;
    distance: number;
    estimatedTime?: string;
    fare: number;
    stops?: string;
    remarks?: string;
}

export interface UpdateRouteRequest
{
    id: string;
    name: string;
    code: string;
    description?: string;
    startLocation: string;
    endLocation: string;
    distance: number;
    estimatedTime?: string;
    fare: number;
    stops?: string;
    remarks?: string;
}

export interface SearchRoutesRequest
{
    pageNumber: number;
    pageSize: number;
    orderBy?: string[];
    advancedSearch?: Search;
    keyword?: string;
}

export interface Search
{
    fields: string[];
    keyword: string;
}

export interface PaginationResponse<T>
{
    data: T[];
    currentPage: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
} 