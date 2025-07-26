export enum Designation {
    Principal = 0,
    VicePrincipal = 1,
    HeadOfDepartment = 2,
    SeniorTeacher = 3,
    Teacher = 4,
    AssistantTeacher = 5,
    Lecturer = 6,
    SeniorLecturer = 7,
    AssistantProfessor = 8,
    AssociateProfessor = 9,
    Professor = 10,
    VisitingProfessor = 11,
    AdjunctProfessor = 12,
    ResearchScholar = 13,
    TeachingAssistant = 14,
    LabAssistant = 15,
    Librarian = 16,
    Counselor = 17,
    Coordinator = 18,
    Administrator = 19,
    Manager = 20,
    Director = 21,
    Dean = 22,
    Registrar = 23,
    Accountant = 24,
    Clerk = 25,
    Peon = 26,
    Driver = 27,
    SecurityGuard = 28,
    Other = 29
}

export interface TeacherDto {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    userName: string;
    phoneNumber?: string;
    address?: string;
    gender?: string;
    dateOfBirth?: string;
    imageUrl?: string;
    isActive: boolean;
    designation?: Designation;
}

export interface CreateTeacherRequest {
    firstName: string;
    lastName: string;
    email?: string;
    userName: string;
    phoneNumber: string;
    address?: string;
    gender?: string;
    dateOfBirth?: string;
    image?: FileUploadRequest;
    designation?: Designation;
    password: string;
}

export interface UpdateTeacherRequest {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    userName: string;
    phoneNumber: string;
    address?: string;
    gender?: string;
    dateOfBirth?: string;
    image?: FileUploadRequest;
    deleteCurrentImage?: boolean;
    designation?: Designation;
}

export interface SearchTeachersRequest {
    pageNumber: number;
    pageSize: number;
    orderBy?: string[];
    advancedSearch?: Search;
    keyword?: string;
    id?: string;
    isActive?: boolean;
}

export interface Search {
    fields: string[];
    keyword: string;
}

export interface FileUploadRequest {
    name: string;
    extension: string;
    data: string;
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