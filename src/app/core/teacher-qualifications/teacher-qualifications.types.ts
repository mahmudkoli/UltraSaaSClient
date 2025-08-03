export interface TeacherQualificationDto {
    id: string;
    teacherId: string;
    teacherName?: string;
    highestQualification?: string;
    qualificationDetails?: string;
    university?: string;
    college?: string;
    yearOfPassing?: number;
    percentage?: number;
    grade?: string;
    division?: string;
    subject?: string;
    specialization?: string;
    additionalQualifications?: string;
    postGraduateQualifications?: string;
    researchQualifications?: string;
    certifications?: string;
    experience?: string;
    teachingExperience?: number;
    industryExperience?: number;
    publications?: string;
    awards?: string;
    skillSet?: string;
    languagesKnown?: string;
}

export interface CreateTeacherQualificationRequest {
    teacherId: string;
    highestQualification?: string;
    university?: string;
    college?: string;
    yearOfPassing?: number;
    percentage?: number;
}

export interface UpdateTeacherQualificationRequest {
    id: string;
    teacherId: string;
    highestQualification?: string;
    university?: string;
    college?: string;
    yearOfPassing?: number;
    percentage?: number;
}

export interface SearchTeacherQualificationsRequest {
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

// Teacher Qualification Analytics
export interface QualificationAnalytics {
    totalRecords: number;
    qualificationDistribution: QualificationLevel[];
    universityDistribution: UniversityStats[];
    experienceDistribution: ExperienceRange[];
    subjectSpecialization: SubjectStats[];
    averageExperience: number;
    averagePercentage: number;
    certificationStats: CertificationStats[];
    qualificationTrends: QualificationTrend[];
}

export interface QualificationLevel {
    level: string;
    count: number;
    percentage: number;
    color: string;
}

export interface UniversityStats {
    university: string;
    count: number;
    percentage: number;
    averagePercentage: number;
}

export interface ExperienceRange {
    range: string;
    count: number;
    percentage: number;
    minYears: number;
    maxYears: number;
}

export interface SubjectStats {
    subject: string;
    count: number;
    percentage: number;
    averageExperience: number;
}

export interface CertificationStats {
    certification: string;
    count: number;
    percentage: number;
}

export interface QualificationTrend {
    year: number;
    count: number;
    averagePercentage: number;
} 