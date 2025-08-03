export enum AcademicStatus {
    Active = 0,
    Inactive = 1,
    Graduated = 2,
    Suspended = 3,
    Transferred = 4,
    Dropped = 5
}

export interface StudentAcademicDto {
    id: string;
    studentId: string;
    studentName?: string;
    section?: string;
    stream?: string;
    batch?: string;
    academicYear?: string;
    semester?: string;
    cgpa?: number;
    grade?: string;
    attendancePercentage?: number;
    currentClass?: string;
    currentSubject?: string;
    academicStatus: AcademicStatus;
    isScholarshipHolder: boolean;
    scholarshipType?: string;
    scholarshipAmount?: number;
    totalCredits?: number;
    creditsEarned?: number;
    gpa?: number;
    rank?: number;
    totalStudents?: number;
}

export interface CreateStudentAcademicRequest {
    studentId: string;
    section?: string;
    stream?: string;
    batch?: string;
    academicYear?: string;
    semester?: string;
    cgpa?: number;
    grade?: string;
    attendancePercentage?: number;
}

export interface UpdateStudentAcademicRequest {
    id: string;
    studentId: string;
    section?: string;
    stream?: string;
    batch?: string;
    academicYear?: string;
    semester?: string;
    cgpa?: number;
    grade?: string;
    attendancePercentage?: number;
}

export interface SearchStudentAcademicsRequest {
    pageNumber: number;
    pageSize: number;
    orderBy?: string[];
    advancedSearch?: Search;
    keyword?: string;
}

export interface Search {
    fields: string[];
    keyword: string;
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

// Analytics interfaces for dashboard
export interface AcademicAnalytics {
    averageCGPA: number;
    averageAttendance: number;
    totalStudents: number;
    scholarshipHolders: number;
    gradeDistribution: GradeDistribution[];
    attendanceDistribution: AttendanceRange[];
    topPerformers: StudentAcademicDto[];
}

export interface GradeDistribution {
    grade: string;
    count: number;
    percentage: number;
}

export interface AttendanceRange {
    range: string;
    count: number;
    percentage: number;
} 