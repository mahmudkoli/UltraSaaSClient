import { PaginationResponse } from '../students/students.types';

export { PaginationResponse };

export interface AcademicYearDto {
    id: string;
    name: string;
    code: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
    description?: string;
    createdBy?: string;
    createdOn?: string;
    lastModifiedBy?: string;
    lastModifiedOn?: string;
}

export interface CreateAcademicYearRequest {
    name: string;
    code: string;
    startDate: string;
    endDate: string;
    description?: string;
}

export interface UpdateAcademicYearRequest {
    id: string;
    name: string;
    code: string;
    startDate: string;
    endDate: string;
    description?: string;
}

export interface SearchAcademicYearsRequest {
    pageNumber: number;
    pageSize: number;
    orderBy?: string[];
    keyword?: string;
    isActive?: boolean;
}
