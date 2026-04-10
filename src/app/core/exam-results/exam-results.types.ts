export enum ExamType {
    UnitTest = 1,
    MidTerm = 2,
    Final = 3,
    Quiz = 4,
    Assignment = 5,
    Project = 6,
    Practical = 7,
    Semester = 8,
    Viva = 9,
    Thesis = 10,
    Dissertation = 11,
    MockTest = 12,
    PracticeTest = 13,
    Entrance = 14,
    Competitive = 15,
    SkillAssessment = 16,
    Comprehensive = 17,
    Qualifying = 18,
    Placement = 19,
    Certification = 20,
    Online = 21,
    Proctored = 22,
    Oral = 23,
    Written = 24,
    Laboratory = 25,
    Field = 26,
    Clinical = 27,
    Portfolio = 28,
    Other = 99
}

export enum Grade {
    APlus = 1,
    A = 2,
    BPlus = 3,
    B = 4,
    CPlus = 5,
    C = 6,
    D = 7,
    F = 8,
    Pass = 9,
    Fail = 10,
    Outstanding = 11,
    Excellent = 12,
    Good = 13,
    Satisfactory = 14,
    NeedsImprovement = 15
}

export interface ExamResultDto {
    id: string;
    studentId: string;
    studentName: string;
    examId: string;
    examName: string;
    subjectId: string;
    subjectName: string;
    classId: string;
    className: string;
    marksObtained: number;
    totalMarks: number;
    percentage: number;
    grade: Grade;
    remarks?: string;
    markedBy: string;
    examType: ExamType;
    examDate?: string;
    evaluatedBy?: string;
    evaluatedAt?: string;
    isAbsent: boolean;
    absentReason?: string;
    createdOn: string;
    lastModifiedOn?: string;
}

export interface CreateExamResultRequest {
    studentId: string;
    examId: string;
    subjectId: string;
    classId: string;
    marksObtained: number;
    totalMarks: number;
    markedBy: string;
    examType: ExamType;
    remarks?: string;
    examDate?: string;
    evaluatedBy?: string;
    isAbsent: boolean;
    absentReason?: string;
}

export interface UpdateExamResultRequest {
    id: string;
    marksObtained: number;
    totalMarks: number;
    remarks?: string;
    isAbsent: boolean;
    absentReason?: string;
}

export interface SearchExamResultsRequest {
    pageNumber: number;
    pageSize: number;
    keyword?: string;
}

export { PaginationResponse } from '../students/students.types';
