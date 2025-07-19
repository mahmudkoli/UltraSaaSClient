export interface VehicleDto
{
    id: string;
    vehicleNumber: string;
    vehicleType: string;
    make: string;
    model: string;
    year: number;
    capacity: number;
    color?: string;
    registrationNumber?: string;
    insuranceNumber?: string;
    insuranceExpiryDate?: string;
    fitnessExpiryDate?: string;
    isActive: boolean;
    driverName?: string;
    driverPhone?: string;
    conductorName?: string;
    conductorPhone?: string;
    remarks?: string;
    createdOn: string;
    createdBy?: string;
    lastModifiedOn?: string;
    lastModifiedBy?: string;
}

export interface CreateVehicleRequest
{
    vehicleNumber: string;
    vehicleType: string;
    make: string;
    model: string;
    year?: number;
    capacity?: number;
    color?: string;
    registrationNumber?: string;
    insuranceNumber?: string;
    insuranceExpiryDate?: string;
    fitnessExpiryDate?: string;
    driverName?: string;
    driverPhone?: string;
    conductorName?: string;
    conductorPhone?: string;
    remarks?: string;
}

export interface UpdateVehicleRequest
{
    id: string;
    vehicleNumber: string;
    vehicleType: string;
    make: string;
    model: string;
    year?: number;
    capacity?: number;
    color?: string;
    registrationNumber?: string;
    insuranceNumber?: string;
    insuranceExpiryDate?: string;
    fitnessExpiryDate?: string;
    driverName?: string;
    driverPhone?: string;
    conductorName?: string;
    conductorPhone?: string;
    remarks?: string;
}

export interface SearchVehiclesRequest
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