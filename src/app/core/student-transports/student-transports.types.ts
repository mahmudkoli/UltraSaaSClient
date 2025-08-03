export enum TransportStatus {
    Active = 1,
    Inactive = 2,
    Suspended = 3,
    Cancelled = 4,
    OnHold = 5
}

export interface StudentTransportDto {
    id: string;
    studentId: string;
    routeId: string;
    vehicleId: string;
    pickupPoint: string;
    dropPoint: string;
    pickupTime: string;
    dropTime: string;
    transportFee: number;
    status: TransportStatus;
    emergencyContact?: string;
    emergencyPhone?: string;
    isPickupEnabled: boolean;
    isDropEnabled: boolean;
    remarks?: string;
    effectiveDate: string;
    endDate?: string;
    createdOn: string;
    lastModifiedOn?: string;
    createdBy?: string;
    lastModifiedBy?: string;
}

export interface CreateStudentTransportRequest {
    studentId: string;
    routeId: string;
    vehicleId: string;
    pickupPoint: string;
    dropPoint: string;
    pickupTime: string;
    dropTime: string;
    transportFee: number;
    emergencyContact?: string;
    emergencyPhone?: string;
    isPickupEnabled?: boolean;
    isDropEnabled?: boolean;
    remarks?: string;
    effectiveDate: string;
    endDate?: string;
}

export interface UpdateStudentTransportRequest {
    id: string;
    studentId: string;
    routeId: string;
    vehicleId: string;
    pickupPoint: string;
    dropPoint: string;
    pickupTime: string;
    dropTime: string;
    transportFee: number;
    status: TransportStatus;
    emergencyContact?: string;
    emergencyPhone?: string;
    isPickupEnabled?: boolean;
    isDropEnabled?: boolean;
    remarks?: string;
    effectiveDate: string;
    endDate?: string;
}

export interface SearchStudentTransportsRequest {
    pageNumber: number;
    pageSize: number;
    orderBy?: string[];
    advancedSearch?: Search;
    keyword?: string;
    id?: string;
    isActive?: boolean;
    studentId?: string;
    routeId?: string;
    vehicleId?: string;
    status?: TransportStatus;
}

export interface Search {
    fields: string[];
    keyword: string;
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