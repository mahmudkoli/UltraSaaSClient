export enum TransportStatus
{
    Active = 1,
    Inactive = 2,
    Suspended = 3,
    Cancelled = 4,
    OnHold = 5
}

export interface StudentTransportDto
{
    id: string;
    studentId: string;
    studentName: string;
    routeId: string;
    routeName: string;
    vehicleId?: string;
    vehicleName?: string;
    startDate: string;
    endDate?: string;
    status: TransportStatus;
    monthlyFee: number;
    pickupLocation?: string;
    dropLocation?: string;
    pickupTime?: string; // HH:MM:SS format
    dropTime?: string; // HH:MM:SS format
    remarks?: string;
    conductorName?: string;
    conductorPhone?: string;
    distance?: number;
    emergencyContact?: string;
    emergencyPhone?: string;
    createdOn: string;
    lastModifiedOn?: string;
}

export interface CreateStudentTransportRequest
{
    studentId: string;
    routeId: string;
    vehicleId?: string;
    startDate: string;
    monthlyFee?: number;
    pickupLocation?: string;
    dropLocation?: string;
    pickupTime?: string;
    dropTime?: string;
    remarks?: string;
    conductorName?: string;
    conductorPhone?: string;
    emergencyContact?: string;
    emergencyPhone?: string;
}

export interface UpdateStudentTransportRequest
{
    id: string;
    studentId: string;
    routeId: string;
    vehicleId?: string;
    startDate: string;
    endDate?: string;
    status: TransportStatus;
    monthlyFee?: number;
    pickupLocation?: string;
    dropLocation?: string;
    pickupTime?: string;
    dropTime?: string;
    remarks?: string;
    conductorName?: string;
    conductorPhone?: string;
    emergencyContact?: string;
    emergencyPhone?: string;
}

export interface SearchStudentTransportsRequest
{
    pageNumber: number;
    pageSize: number;
    orderBy?: string[];
    advancedSearch?: Search;
    keyword?: string;
    studentId?: string;
    routeId?: string;
    vehicleId?: string;
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