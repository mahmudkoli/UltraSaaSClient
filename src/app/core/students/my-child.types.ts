export interface MyChildDashboardDto {
    studentId: string;
    name: string;
    rollNumber?: string;
    admissionNumber?: string;
    className?: string;
    fathersName?: string;
    mothersName?: string;
    guardianPhone?: string;
    familyCode?: string;

    attendanceDays: number;
    attendancePresent: number;
    attendanceAbsent: number;
    attendancePercent: number;

    feesOutstanding: number;
    overdueInvoices: number;

    recentExamResults: RecentExamResultDto[];
    siblings: SiblingDto[];

    /** Phase v1-K10 — per-invoice history (last 24 months). */
    feeInvoices?: FeeInvoiceSummaryDto[];
}

export interface FeeInvoiceSummaryDto {
    id: string;
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    totalAmount: number;
    paidAmount: number;
    balanceAmount: number;
    status: string;
}

export interface RecentExamResultDto {
    examName: string;
    subjectName: string;
    marksObtained: number;
    totalMarks: number;
    percentage: number;
    grade: string;
    examDate?: string;
}

export interface SiblingDto {
    studentId: string;
    name: string;
    className?: string;
}

// ── Phase F7 — student self-service detail rows (read-only) ────────────────────

export interface Paginated<T> {
    data: T[];
    currentPage: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

/** AttendanceStatus enum (numeric) as serialized by the API. */
export interface StudentAttendanceRow {
    id: string;
    date: string;
    status: number;          // 1 Present, 2 Absent, 3 Late, 4 HalfDay, 5 Excused, 6 Medical, 7 Holiday, 8 Weekend
    className: string;
    subjectName?: string;
    remarks?: string;
    markedByName?: string;
}

export interface StudentExamResultRow {
    id: string;
    examName: string;
    subjectName: string;
    marksObtained: number;
    totalMarks: number;
    percentage: number;
    grade?: string;
    gpaPoint?: number;
    examDate?: string;
    isAbsent: boolean;
}

export interface StudentTimetableRow {
    id: string;
    subjectName?: string;
    teacherName?: string;
    timeSlotName?: string;
    startTime?: string;
    endTime?: string;
    dayOfWeek: string;
    roomNumber?: string;
}

export interface StudentInvoiceRow {
    id: string;
    invoiceNumber: string;
    studentName?: string;
    className?: string;
    academicYearName?: string;
    invoiceDate: string;
    dueDate: string;
    totalAmount: number;
    paidAmount: number;
    balanceAmount: number;
    status: number;          // InvoiceStatus: 1 Pending, 2 Partial, 3 Paid, 4 Overdue, 5 Cancelled, 6 Refunded, 7 Disputed, 8 OnHold
    discountAmount?: number;
    taxAmount?: number;
    lateFeeAmount?: number;
    paymentMethod?: string;
    paidDate?: string;
    receiptNumber?: string;
    remarks?: string;
}

export interface StudentEventRow {
    id: string;
    title: string;
    description?: string;
    startDate: string;
    endDate: string;
    startTime?: string;
    endTime?: string;
    eventType: number;
    location?: string;
    isAllDay: boolean;
    organizer?: string;
    color?: string;
}
