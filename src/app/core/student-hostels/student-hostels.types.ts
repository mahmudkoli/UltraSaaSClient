export enum HostelStatus {
    Active = 1,
    CheckedOut = 2,
    Suspended = 3,
    Cancelled = 4,
    OnHold = 5
}

export interface StudentHostelDto {
    id: string;
    studentId: string;
    hostelId: string;
    roomNumber: string;
    checkInDate: string;
    checkOutDate?: string;
    status: HostelStatus;
    monthlyFee: number;
    bedNumber?: string;
    floor?: string;
    block?: string;
    emergencyContact?: string;
    emergencyPhone?: string;
    remarks?: string;
    wardenName?: string;
    wardenPhone?: string;
    checkInRemarks?: string;
    checkOutRemarks?: string;
    checkedInBy?: string;
    checkedOutBy?: string;
    createdOn: string;
    lastModifiedOn?: string;
    createdBy?: string;
    lastModifiedBy?: string;
}

export interface CreateStudentHostelRequest {
    studentId: string;
    hostelId: string;
    roomNumber: string;
    checkInDate: string;
    monthlyFee: number;
    bedNumber?: string;
    floor?: string;
    block?: string;
    emergencyContact?: string;
    emergencyPhone?: string;
    remarks?: string;
    wardenName?: string;
    wardenPhone?: string;
    checkInRemarks?: string;
}

export interface UpdateStudentHostelRequest {
    id: string;
    studentId: string;
    hostelId: string;
    roomNumber: string;
    checkInDate: string;
    checkOutDate?: string;
    status: HostelStatus;
    monthlyFee: number;
    bedNumber?: string;
    floor?: string;
    block?: string;
    emergencyContact?: string;
    emergencyPhone?: string;
    remarks?: string;
    wardenName?: string;
    wardenPhone?: string;
    checkInRemarks?: string;
    checkOutRemarks?: string;
}

export interface SearchStudentHostelsRequest {
    pageNumber: number;
    pageSize: number;
    orderBy?: string[];
    advancedSearch?: Search;
    keyword?: string;
    id?: string;
    isActive?: boolean;
    studentId?: string;
    hostelId?: string;
    status?: HostelStatus;
    floor?: string;
    block?: string;
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

// Analytics for hostels
export interface HostelAnalytics {
    totalHostelStudents: number;
    activeHostelStudents: number;
    checkedOutStudents: number;
    suspendedStudents: number;
    averageMonthlyFee: number;
    totalRevenue: number;
    occupancyRate: number;
    statusDistribution: HostelStatusStats[];
    floorDistribution: FloorStats[];
    wardenStats: WardenStats[];
}

export interface HostelStatusStats {
    status: HostelStatus;
    count: number;
    percentage: number;
}

export interface FloorStats {
    floor: string;
    studentCount: number;
    roomCount: number;
    occupancyRate: number;
}

export interface WardenStats {
    wardenName: string;
    studentCount: number;
    wardenPhone: string;
} 