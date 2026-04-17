import { PaginationResponse } from '../students/students.types';

export { PaginationResponse };

export interface StudentClassDto {
    id: string;
    studentId: string;
    studentName: string;
    classId: string;
    className: string;
    academicYearId: string;
    academicYearName: string;
    enrollmentDate: string;
    withdrawalDate?: string;
    status: string;
    rollNumber?: string;
    createdOn?: string;
    lastModifiedOn?: string;
}

export interface CreateStudentClassRequest {
    studentId: string;
    classId: string;
    academicYearId: string;
    rollNumber?: string;
}

export interface UpdateStudentClassRequest {
    id: string;
    rollNumber?: string;
    status: string;
}

export interface SearchStudentClassesRequest {
    pageNumber: number;
    pageSize: number;
    orderBy?: string[];
    keyword?: string;
    classId?: string;
    studentId?: string;
    academicYearId?: string;
}
