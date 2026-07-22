export interface LeaveBalanceDto {
    id: string;
    employeeId: string;
    employeeName: string;
    leaveTypeId: string;
    leaveTypeName?: string;
    year: number;
    entitled: number;
    taken: number;
    balance: number;
    createdOn: string;
}

export interface SetLeaveBalanceRequest {
    employeeId: string;
    leaveTypeId: string;
    year: number;
    entitled: number;
}

export interface SearchLeaveBalancesRequest {
    pageNumber: number;
    pageSize: number;
    orderBy?: string[];
    employeeId?: string;
    leaveTypeId?: string;
    year?: number;
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
