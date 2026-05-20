export enum InvoiceStatus {
    Pending = 1, Partial = 2, Paid = 3, Overdue = 4,
    Cancelled = 5, Refunded = 6, Disputed = 7, OnHold = 8
}

export interface FeeInvoiceDto {
    id: string;
    invoiceNumber: string;
    studentId: string;
    studentName: string;
    classId: string;
    className: string;
    academicYearId: string;
    academicYearName: string;
    invoiceDate: string;
    dueDate: string;
    totalAmount: number;
    paidAmount: number;
    balanceAmount: number;
    status: InvoiceStatus;
    remarks?: string;
    paymentMethod?: string;
    paymentDate?: string;
    discountAmount?: number;
    taxAmount?: number;
    lateFeeAmount?: number;
    transactionId?: string;
    paidDate?: string;
    paidBy?: string;
    receiptNumber?: string;
    createdOn: string;
    lastModifiedOn?: string;
}

export interface CreateFeeInvoiceRequest {
    invoiceNumber: string;
    studentId: string;
    classId: string;
    academicYearId: string;
    invoiceDate: string;
    dueDate: string;
    totalAmount: number;
    remarks?: string;
    discountAmount?: number;
    taxAmount?: number;
    lateFeeAmount?: number;
}

export interface UpdateFeeInvoiceRequest {
    id: string;
    paidAmount: number;
    paymentMethod: string;
    remarks?: string;
    transactionId?: string;
    paidBy?: string;
    receiptNumber?: string;
}

export interface SearchFeeInvoicesRequest {
    pageNumber: number;
    pageSize: number;
    keyword?: string;
    studentId?: string;
    classId?: string;
    academicYearId?: string;
    overdueOnly?: boolean;
}

export { PaginationResponse } from '../students/students.types';

export interface FeeStatusBucket {
    status: string;
    count: number;
    amount: number;
}

export interface FeeAnalytics {
    totalInvoices: number;
    totalInvoiced: number;
    totalCollected: number;
    totalOutstanding: number;
    overdueCount: number;
    overdueAmount: number;
    thisMonthCollected: number;
    collectionRate: number;
    statusBreakdown: FeeStatusBucket[];
}

// Phase E3 — dues + collection report
export interface FeeDuesDto {
    studentId: string;
    studentName: string;
    rollNumber?: string;
    className?: string;
    invoiceCount: number;
    overdueCount: number;
    totalOutstanding: number;
    totalOverdue: number;
    oldestDueDate: string;
}

export interface FeeCollectionReportDto {
    from: string;
    to: string;
    totalCollected: number;
    paidInvoiceCount: number;
    totalOutstanding: number;
    overdueInvoiceCount: number;
    series: FeeCollectionRow[];
}

export interface FeeCollectionRow {
    bucketStart: string;
    label: string;
    collected: number;
    paidCount: number;
}
