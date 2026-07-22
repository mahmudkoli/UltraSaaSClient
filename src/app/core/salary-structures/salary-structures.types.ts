// Values MUST match the BE (Core/Domain/Common/Enums).
export enum SalaryComponentType {
    Earning = 1,
    Deduction = 2,
}

export enum SalaryCalculationType {
    Fixed = 1,
    PercentOfBasic = 2,
}

export interface SalaryComponentDto {
    id?: string;
    name: string;
    code?: string;
    type: SalaryComponentType;
    calculationType: SalaryCalculationType;
    value: number;
    isTaxable: boolean;
    displayOrder: number;
}

export interface SalaryStructureDto {
    id: string;
    name: string;
    description?: string;
    basic: number;
    isActive: boolean;
    componentCount: number;
    grossEarnings: number;
    totalDeductions: number;
    netPay: number;
    components: SalaryComponentDto[];
    createdOn: string;
    lastModifiedOn?: string;
}

export interface CreateSalaryStructureRequest {
    name: string;
    description?: string;
    basic: number;
    components: SalaryComponentDto[];
}

export interface UpdateSalaryStructureRequest {
    id: string;
    name?: string;
    description?: string;
    basic?: number;
    isActive?: boolean;
    components?: SalaryComponentDto[];
}

export interface SearchSalaryStructuresRequest {
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

export const COMPONENT_TYPE_LABELS: Record<number, string> = { 1: 'Earning', 2: 'Deduction' };
export const CALC_TYPE_LABELS: Record<number, string> = { 1: 'Fixed', 2: '% of Basic' };
