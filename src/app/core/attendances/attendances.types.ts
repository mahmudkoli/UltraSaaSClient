// Values MUST match the BE (Core/Domain/Common/Enums).
export enum AttendanceStatus {
    Present = 1,
    Absent = 2,
    Late = 3,
    HalfDay = 4,
    Excused = 5,
    Medical = 6,
    Holiday = 7,
    Weekend = 8
}

export enum AttendanceSource {
    Web = 1,
    Device = 2,
    Manual = 3
}

export interface AttendanceDto {
    id: string;
    employeeId: string;
    employeeName: string;
    date: string;
    inTime?: string;
    outTime?: string;
    status: AttendanceStatus;
    source: AttendanceSource;
    overtimeMinutes: number;
    workedMinutes: number;
    isRegularised: boolean;
    remarks?: string;
    createdOn: string;
}

export interface CreateAttendanceRequest {
    employeeId: string;
    date: string;
    status: AttendanceStatus;
    source: AttendanceSource;
    inTime?: string;
    outTime?: string;
    overtimeMinutes?: number;
    remarks?: string;
}

export interface UpdateAttendanceRequest {
    id: string;
    status: AttendanceStatus;
    inTime?: string;
    outTime?: string;
    overtimeMinutes?: number;
    remarks?: string;
}

export interface RegulariseAttendanceRequest {
    id: string;
    status: AttendanceStatus;
    inTime?: string;
    outTime?: string;
    remarks?: string;
}

export interface SearchAttendancesRequest {
    pageNumber: number;
    pageSize: number;
    orderBy?: string[];
    employeeId?: string;
    dateFrom?: string;
    dateTo?: string;
    status?: AttendanceStatus;
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

export const ATTENDANCE_STATUS_LABELS: Record<number, string> = {
    1: 'Present', 2: 'Absent', 3: 'Late', 4: 'Half Day',
    5: 'Excused', 6: 'Medical', 7: 'Holiday', 8: 'Weekend'
};

export const ATTENDANCE_SOURCE_LABELS: Record<number, string> = {
    1: 'Web', 2: 'Device', 3: 'Manual'
};
