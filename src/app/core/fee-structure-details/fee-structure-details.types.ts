export interface FeeStructureDetailDto {
    id: string;
    feeStructureId: string;
    feeStructureName: string;
    feeTypeId: string;
    feeTypeName: string;
    amount: number;
    isActive: boolean;
    remarks?: string;
    createdOn: string;
    lastModifiedOn?: string;
}

export interface CreateFeeStructureDetailRequest {
    feeStructureId: string;
    feeTypeId: string;
    amount: number;
    remarks?: string;
}

export interface UpdateFeeStructureDetailRequest {
    id: string;
    amount: number;
    remarks?: string;
}

export interface SearchFeeStructureDetailsRequest {
    feeStructureId?: string;
    keyword?: string;
    pageNumber: number;
    pageSize: number;
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
