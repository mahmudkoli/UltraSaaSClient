import { PaginationResponse } from '../students/students.types';

export { PaginationResponse };

export enum AttendanceStatus {
    Present = 1,
    Absent = 2,
    Late = 3,
    HalfDay = 4,
    Excused = 5,
    Medical = 6,
    Holiday = 7,
    Weekend = 8
}

export interface AttendanceDto {
    id: string;
    studentId: string;
    studentName: string;
    classId: string;
    className: string;
    subjectId?: string;
    subjectName?: string;
    date: string;
    status: AttendanceStatus;
    remarks?: string;
    markedBy: string;
    markedByName: string;
    checkInTime?: string;
    checkOutTime?: string;
    markedAt?: string;
    createdOn?: string;
    lastModifiedOn?: string;
}

export interface CreateAttendanceRequest {
    studentId: string;
    classId: string;
    subjectId?: string;
    date: string;
    status: AttendanceStatus;
    markedBy: string;
    remarks?: string;
    checkInTime?: string;
    checkOutTime?: string;
    markedByName?: string;
}

export interface UpdateAttendanceRequest {
    id: string;
    status: AttendanceStatus;
    remarks?: string;
    checkInTime?: string;
    checkOutTime?: string;
}

export interface SearchAttendancesRequest {
    pageNumber: number;
    pageSize: number;
    orderBy?: string[];
    keyword?: string;
}
