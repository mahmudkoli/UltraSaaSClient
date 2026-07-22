export interface PayrollSlipLineDto {
    id: string;
    employeeId: string;
    employeeName: string;
    designation?: string;
    department?: string;
    basic: number;
    allowances: number;
    bonus: number;
    providentFund: number;
    tax: number;
    otherDeduction: number;
    grossSalary: number;
    totalDeductions: number;
    netSalary: number;
    workingDays: number;
    leavesTaken: number;
    leavesUnpaid: number;
    remarks?: string;
}

export interface PayrollRunDto {
    id: string;
    periodYear: number;
    periodMonth: number;
    status: string;          // 'Draft' | 'Finalised'
    generatedOn: string;
    finalisedOn?: string;
    employeeCount: number;
    totalGross: number;
    totalDeductions: number;
    totalNet: number;
    notes?: string;
    slips: PayrollSlipLineDto[];
}

export interface GeneratePayrollRunRequest {
    year: number;
    month: number;
    notes?: string;
}
