export interface StockDto {
    id: string;
    productId: string;
    outletId: string;
    quantity: number;
    lastCountedOn?: string;
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
    saleId?: string;
    notes?: string;
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

export type StockTransferStatus = 'Draft' | 'InTransit' | 'Received' | 'Cancelled';

export interface StockTransferItemDto {
    id: string;
    stockTransferId: string;
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
}

export interface StockTransferDto {
    id: string;
    fromOutletId: string;
    toOutletId: string;
    transferNumber: string;
    sequenceNumber: number;
    status: StockTransferStatus;
    createdOnUtc: string;
    dispatchedOnUtc?: string;
    receivedOnUtc?: string;
    notes?: string;
    items: StockTransferItemDto[];
}

export interface CreateStockTransferLine {
    productId: string;
    quantity: number;
}

export interface CreateStockTransferRequest {
    fromOutletId: string;
    toOutletId: string;
    lines: CreateStockTransferLine[];
    notes?: string;
}

export type StockCountStatus = 'InProgress' | 'Completed' | 'Cancelled';
export type StockCountScope = 'AllProducts' | 'ByCategory' | 'ByBrand';

export interface StockCountLineDto {
    id: string;
    stockCountId: string;
    productId: string;
    productName: string;
    sku: string;
    expectedQty: number;
    countedQty?: number;
    countedAt?: string;
    lineNotes?: string;
    variance: number;
    hasCount: boolean;
}

export interface StockCountDto {
    id: string;
    outletId: string;
    countNumber: string;
    sequenceNumber: number;
    scope: StockCountScope;
    categoryId?: string;
    brandId?: string;
    status: StockCountStatus;
    startedByUserId: string;
    startedAt: string;
    completedByUserId?: string;
    completedAt?: string;
    notes?: string;
    lineCount: number;
    countedLines: number;
    totalAbsVariance: number;
    lines: StockCountLineDto[];
}

export interface StartStockCountRequest {
    outletId: string;
    scope: StockCountScope;
    categoryId?: string;
    brandId?: string;
    notes?: string;
}

export interface RecordStockCountLineRequest {
    countId: string;
    lineId: string;
    countedQty: number;
    lineNotes?: string;
}

export type StockAdjustmentReason =
    | 'PhysicalCount' | 'Damage' | 'Loss' | 'Expiry' | 'Correction' | 'OpeningBalance' | 'Other';

export interface StockAdjustmentDto {
    id: string;
    productId: string;
    outletId: string;
    oldQuantity: number;
    newQuantity: number;
    delta: number;
    reason: StockAdjustmentReason;
    notes?: string;
    adjustedOn: string;
    createdOn: string;
}

export interface CreateStockAdjustmentRequest {
    productId: string;
    outletId: string;
    newQuantity: number;
    reason: StockAdjustmentReason;
    notes?: string;
}
