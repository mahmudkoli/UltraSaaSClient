export interface ClassSubjectDto {
    id: string;
    classId: string;
    className: string;
    subjectId: string;
    subjectName: string;
    teacherId: string;
    teacherName: string;
    isActive: boolean;
    weeklyHours: number;
    createdOn: string;
    lastModifiedOn?: string;
}

export interface CreateClassSubjectRequest {
    classId: string;
    subjectId: string;
    teacherId: string;
    weeklyHours: number;
    isActive?: boolean;
    remarks?: string;
}

export interface UpdateClassSubjectRequest {
    id: string;
    teacherId: string;
    weeklyHours: number;
    isActive: boolean;
}

export interface SearchClassSubjectsRequest {
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
