export type LeaveType = 'Casual' | 'Sick' | 'Earned' | 'Maternity' | 'Paternity' | 'Unpaid' | 'Compensatory' | 'Other';
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';

export interface LeaveDto {
    id: string;
    employeeId: string;
    employeeName: string;
    designation?: string;
    type: LeaveType;
    fromDate: string;
    toDate: string;
    days: number;
    reason: string;
    status: LeaveStatus;
    decidedByName?: string;
    decidedOn?: string;
    decisionRemarks?: string;
    createdOn?: string;
}

export interface ApplyLeaveRequest {
    employeeId: string;
    type: LeaveType;
    fromDate: string;
    toDate: string;
    reason: string;
}

export interface SearchLeavesRequest {
    pageNumber: number;
    pageSize: number;
    employeeId?: string;
    status?: LeaveStatus;
    type?: LeaveType;
    from?: string;
    to?: string;
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
