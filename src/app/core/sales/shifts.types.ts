export type ShiftStatus = 'Open' | 'Closed';

export interface ShiftDto {
    id: string;
    outletId: string;
    openedByUserId: string;
    openedAt: string;
    closedByUserId?: string;
    closedAt?: string;
    openingFloat: number;
    closingFloat?: number;
    expectedCash?: number;
    variance?: number;
    status: ShiftStatus;
    notes?: string;
}

export interface OpenShiftRequest {
    outletId: string;
    openingFloat: number;
    notes?: string;
}

export interface CloseShiftRequest {
    id: string;
    closingFloat: number;
    notes?: string;
}

export interface ShiftReportDto {
    shiftId: string;
    reportType: 'X' | 'Z';
    outletId: string;
    outletName: string;
    outletCode: string;
    openedAt: string;
    closedAt?: string;
    openedByUserId: string;
    closedByUserId?: string;
    status: ShiftStatus;
    printedAt: string;
    openingFloat: number;
    closingFloat?: number;
    expectedCash?: number;
    variance?: number;
    salesCount: number;
    voidedCount: number;
    grossSubtotal: number;
    totalDiscount: number;
    totalTax: number;
    netTotal: number;
    returnsCount: number;
    refundsTotal: number;
    byPaymentMethod: { method: string; count: number; total: number }[];
    topItems: { sku: string; productName: string; quantity: number; revenue: number }[];
    notes?: string;
}
