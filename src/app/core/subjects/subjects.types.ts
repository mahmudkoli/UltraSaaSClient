import { PaginationResponse } from '../students/students.types';

export { PaginationResponse };

export enum SubjectType {
    Core = 1,
    Elective = 2,
    Optional = 3,
    Practical = 4,
    Theory = 5,
    Lab = 6,
    Major = 7,
    Minor = 8,
    Seminar = 9,
    Project = 10,
    Internship = 11,
    TestPrep = 12,
    SkillBased = 13,
    Workshop = 14,
    Research = 15,
    Dissertation = 16,
    Thesis = 17,
    FieldWork = 18,
    Clinical = 19,
    Industrial = 20,
    Online = 21,
    Hybrid = 22,
    Blended = 23,
    SelfStudy = 24
}

export interface SubjectDto {
    id: string;
    name: string;
    code: string;
    description?: string;
    isActive: boolean;
    creditHours?: number;
    subjectType?: SubjectType;
    applicableLevel?: number;
    syllabus?: string;
    prerequisites?: string;
    isPractical: boolean;
    isTheory: boolean;
    theoryHours?: number;
    practicalHours?: number;
    department?: string;
    createdBy?: string;
    createdOn?: string;
    lastModifiedBy?: string;
    lastModifiedOn?: string;
}

export interface CreateSubjectRequest {
    name: string;
    code: string;
    description?: string;
    creditHours?: number;
    subjectType?: number;
    applicableLevel?: number;
    syllabus?: string;
    prerequisites?: string;
    isPractical?: boolean;
    isTheory?: boolean;
    theoryHours?: number;
    practicalHours?: number;
    department?: string;
}

export interface UpdateSubjectRequest {
    id: string;
    name: string;
    code: string;
    description?: string;
    creditHours?: number;
    subjectType?: number;
    applicableLevel?: number;
    syllabus?: string;
    prerequisites?: string;
    isPractical?: boolean;
    isTheory?: boolean;
    theoryHours?: number;
    practicalHours?: number;
    department?: string;
}

export interface SearchSubjectsRequest {
    pageNumber: number;
    pageSize: number;
    orderBy?: string[];
    keyword?: string;
    isActive?: boolean;
}
