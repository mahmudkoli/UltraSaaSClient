export interface PayrollSlipDto {
    id: string;
    serialNumber: string;
    teacherId: string;
    teacherName: string;
    designation?: string;
    department?: string;
    periodYear: number;
    periodMonth: number;
    issuedOn: string;

    basic: number;
    houseAllowance: number;
    medicalAllowance: number;
    transportAllowance: number;
    otherAllowance: number;
    bonus: number;

    providentFund: number;
    tax: number;
    loanDeduction: number;
    otherDeduction: number;

    workingDays: number;
    leavesTaken: number;
    leavesUnpaid: number;

    grossSalary: number;
    totalDeductions: number;
    netSalary: number;

    remarks?: string;
}

export interface GeneratePayrollSlipRequest {
    teacherId: string;
    periodYear: number;
    periodMonth: number;
    basic: number;
    houseAllowance: number;
    medicalAllowance: number;
    transportAllowance: number;
    otherAllowance: number;
    bonus: number;
    providentFund: number;
    tax: number;
    loanDeduction: number;
    otherDeduction: number;
    workingDays: number;
    leavesTaken: number;
    leavesUnpaid: number;
    remarks?: string;
}

export interface SearchPayrollSlipsRequest {
    pageNumber: number;
    pageSize: number;
    teacherId?: string;
    year?: number;
    month?: number;
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
