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
