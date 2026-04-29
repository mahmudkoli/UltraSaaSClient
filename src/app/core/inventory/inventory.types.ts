export interface StockDto {
    productId: string;
    outletId: string;
    quantity: number;
    productName: string;
    sku: string;
    lastMovementOn?: string;
}

export interface StockMovementDto {
    id: string;
    productId: string;
    outletId: string;
    movementType: 'Purchase' | 'Sale' | 'Return' | 'TransferOut' | 'TransferIn' | 'Adjustment' | 'Damage' | 'Loss' | 'OpeningBalance' | 'Recount';
    quantity: number;
    unitCost?: number;
    referenceType?: string;
    referenceId?: string;
    serialNumber?: string;
    batchNumber?: string;
    notes?: string;
    movedOn: string;
}

export interface StockSerialDto {
    id: string;
    productId: string;
    outletId: string;
    serialNumber: string;
    imei?: string;
    status: 'InStock' | 'Reserved' | 'Sold' | 'Returned' | 'UnderRepair' | 'WrittenOff' | 'Transferred';
    purchaseCost: number;
    receivedOn: string;
    soldOn?: string;
}

export interface ProductElectronicsDto {
    id: string;
    productId: string;
    requiresSerial: boolean;
    isIMEIRequired: boolean;
    modelNumber?: string;
    warrantyMonths: number;
    warrantyTerms?: string;
}
