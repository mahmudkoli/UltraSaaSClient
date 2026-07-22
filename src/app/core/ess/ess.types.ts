export interface MyPayslipDto {
    id: string;
    serialNumber: string;
    periodYear: number;
    periodMonth: number;
    issuedOn: string;
    basic: number;
    grossSalary: number;
    providentFund: number;
    tax: number;
    totalDeductions: number;
    netSalary: number;
    workingDays: number;
    leavesTaken: number;
    leavesUnpaid: number;
    remarks?: string;
}

export interface MyLeaveBalanceDto {
    id: string;
    leaveTypeId: string;
    leaveTypeName?: string;
    year: number;
    entitled: number;
    taken: number;
    balance: number;
}

export interface MyProfileDto {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    userName: string;
    phoneNumber?: string;
    employeeId?: string;
    employeeCode?: string;
    joiningDate?: string;
}
