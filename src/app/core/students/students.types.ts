export interface StudentDto
{
    id: string;
    studentId: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    address: string;
    phoneNumber: string;
    email: string;
    parentName: string;
    parentPhone: string;
    parentEmail?: string;
    emergencyContact: string;
    emergencyPhone: string;
    bloodGroup?: string;
    isActive: boolean;
    remarks?: string;
    createdOn: string;
    lastModifiedOn?: string;
}

export interface CreateStudentRequest
{
    studentId: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    address: string;
    phoneNumber: string;
    email: string;
    parentName: string;
    parentPhone: string;
    parentEmail?: string;
    emergencyContact: string;
    emergencyPhone: string;
    bloodGroup?: string;
    remarks?: string;
}

export interface UpdateStudentRequest
{
    id: string;
    studentId: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    address: string;
    phoneNumber: string;
    email: string;
    parentName: string;
    parentPhone: string;
    parentEmail?: string;
    emergencyContact: string;
    emergencyPhone: string;
    bloodGroup?: string;
    remarks?: string;
}

export interface SearchStudentsRequest
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