import { PaginationResponse } from '../students/students.types';

export { PaginationResponse };

export interface ClassDto {
    id: string;
    name: string;
    code: string;
    grade: number;
    section?: string;
    capacity: number;
    description?: string;
    roomNumber?: string;
    floor?: string;
    building?: string;
    academicYearId: string;
    academicYearName?: string;
    educationLevel?: number;
    classTeacherId?: string;
    classTeacherName?: string;
    isActive: boolean;
    currentStrength: number;
    createdBy?: string;
    createdOn?: string;
    lastModifiedBy?: string;
    lastModifiedOn?: string;
}

export interface CreateClassRequest {
    name: string;
    code: string;
    grade: number;
    section?: string;
    capacity: number;
    description?: string;
    roomNumber?: string;
    floor?: string;
    building?: string;
    academicYearId: string;
    educationLevel?: number;
    classTeacherId?: string;
    classTeacherName?: string;
}

export interface UpdateClassRequest {
    id: string;
    name: string;
    code: string;
    grade: number;
    section?: string;
    capacity: number;
    description?: string;
    roomNumber?: string;
    floor?: string;
    building?: string;
    academicYearId: string;
    educationLevel?: number;
    classTeacherId?: string;
    classTeacherName?: string;
}

export interface SearchClassesRequest {
    pageNumber: number;
    pageSize: number;
    orderBy?: string[];
    keyword?: string;
    isActive?: boolean;
    academicYearId?: string;
    grade?: number;
}
