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
