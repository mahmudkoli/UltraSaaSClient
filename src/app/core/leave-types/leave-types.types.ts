export interface LeaveTypeDto {
    id: string;
    name: string;
    code?: string;
    isPaid: boolean;
    accrualDaysPerYear?: number;
    maxDaysPerYear?: number;
    carryForward: boolean;
    encashable: boolean;
    description?: string;
    isActive: boolean;
    createdOn: string;
    lastModifiedOn?: string;
}

export interface CreateLeaveTypeRequest {
    name: string;
    code?: string;
    isPaid: boolean;
    accrualDaysPerYear?: number;
    maxDaysPerYear?: number;
    carryForward: boolean;
    encashable: boolean;
    description?: string;
}

export interface UpdateLeaveTypeRequest {
    id: string;
    name?: string;
    code?: string;
    isPaid?: boolean;
    accrualDaysPerYear?: number;
    maxDaysPerYear?: number;
    carryForward?: boolean;
    encashable?: boolean;
    description?: string;
    isActive?: boolean;
}

export interface SearchLeaveTypesRequest {
    pageNumber: number;
    pageSize: number;
    orderBy?: string[];
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
