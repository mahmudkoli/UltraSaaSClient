import { FeeFrequency } from '../fee-types/fee-types.types';

export interface FeeStructureDto {
    id: string;
    name: string;
    code: string;
    description?: string;
    isActive: boolean;
    academicYearId: string;
    academicYearName: string;
    classId: string;
    className: string;
    effectiveFrom: string;
    effectiveTo?: string;
    feeFrequency: FeeFrequency;
    applicableLevel?: number;
    applicableInstitutionType?: number;
    isDefault: boolean;
    createdOn: string;
    lastModifiedOn?: string;
}

export interface CreateFeeStructureRequest {
    name: string;
    code: string;
    description?: string;
    academicYearId: string;
    classId: string;
    effectiveFrom: string;
    effectiveTo?: string;
    feeFrequency: FeeFrequency;
    applicableLevel?: number;
    applicableInstitutionType?: number;
    isDefault: boolean;
}

export interface UpdateFeeStructureRequest {
    id: string;
    name: string;
    code: string;
    description?: string;
    effectiveFrom: string;
    effectiveTo?: string;
    feeFrequency: FeeFrequency;
    applicableLevel?: number;
    applicableInstitutionType?: number;
    isDefault: boolean;
}

export interface SearchFeeStructuresRequest {
    pageNumber: number;
    pageSize: number;
    keyword?: string;
}

export { PaginationResponse } from '../students/students.types';
