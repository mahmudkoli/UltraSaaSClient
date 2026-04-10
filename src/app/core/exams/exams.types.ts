export interface ExamDto {
    id: string;
    name: string;
    code: string;
    description?: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
    examType: string;
    academicYearId: string;
    academicYearName: string;
    totalMarks: number;
    passingMarks: number;
    createdOn: string;
    lastModifiedOn?: string;
}

export interface CreateExamRequest {
    name: string;
    code: string;
    description?: string;
    startDate: string;
    endDate: string;
    examType: string;
    academicYearId: string;
    totalMarks: number;
    passingMarks: number;
}

export interface UpdateExamRequest {
    id: string;
    name: string;
    code: string;
    description?: string;
    startDate: string;
    endDate: string;
    totalMarks: number;
    passingMarks: number;
}

export interface SearchExamsRequest {
    pageNumber: number;
    pageSize: number;
    keyword?: string;
    isActive?: boolean;
}

export { PaginationResponse } from '../students/students.types';
