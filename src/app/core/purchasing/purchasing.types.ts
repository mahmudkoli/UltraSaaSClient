export interface SupplierDto {
    id: string;
    name: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    address?: string;
    taxId?: string;
    notes?: string;
    isActive: boolean;
}

export type PurchaseOrderStatus = 'Draft' | 'Submitted' | 'PartiallyReceived' | 'Received' | 'Cancelled';

export interface PurchaseOrderItemDto {
    id: string;
    purchaseOrderId: string;
    productId: string;
    productName: string;
    sku: string;
    quantityOrdered: number;
    quantityReceived: number;
    quantityOutstanding: number;
    unitCost: number;
    taxRate: number;
    taxAmount: number;
    lineSubTotal: number;
    lineTotal: number;
}

export interface PurchaseOrderDto {
    id: string;
    outletId: string;
    supplierId: string;
    poNumber: string;
    sequenceNumber: number;
    orderDate: string;
    expectedDeliveryDate?: string;
    status: PurchaseOrderStatus;
    subTotal: number;
    taxAmount: number;
    total: number;
    notes?: string;
    items: PurchaseOrderItemDto[];
}

export interface CreatePurchaseOrderLine {
    productId: string;
    quantity: number;
    unitCost: number;
}

export interface CreatePurchaseOrderRequest {
    outletId: string;
    supplierId: string;
    expectedDeliveryDate?: string;
    lines: CreatePurchaseOrderLine[];
    notes?: string;
}

export interface CreateGoodsReceiptLine {
    purchaseOrderItemId: string;
    quantityReceived: number;
    unitCost?: number;
    serialNumbers?: string[];
    batchNumber?: string;
    expiryDate?: string;
}

export interface CreateGoodsReceiptRequest {
    purchaseOrderId: string;
    lines: CreateGoodsReceiptLine[];
    notes?: string;
}

export interface GoodsReceiptItemDto {
    id: string;
    goodsReceiptId: string;
    purchaseOrderItemId: string;
    productId: string;
    productName: string;
    sku: string;
    quantityReceived: number;
    unitCost: number;
    lineTotal: number;
    serialNumbers: string[];
    batchNumber?: string;
    expiryDate?: string;
}

export interface GoodsReceiptDto {
    id: string;
    purchaseOrderId: string;
    poNumber: string;
    outletId: string;
    receiptNumber: string;
    sequenceNumber: number;
    receivedOn: string;
    status: 'Draft' | 'Completed' | 'Voided';
    notes?: string;
    items: GoodsReceiptItemDto[];
}

export type PurchaseReturnStatus = 'Draft' | 'Completed' | 'Voided';
export type PurchaseReturnReason = 'Damaged' | 'WrongItem' | 'Excess' | 'Expired' | 'QualityFailure' | 'Other';
export type SupplierCreditMethod = 'CreditNote' | 'CashRefund' | 'BankRefund' | 'Replacement' | 'InvoiceAdjustment';

export interface PurchaseReturnItemDto {
    id: string;
    purchaseReturnId: string;
    goodsReceiptItemId: string;
    purchaseOrderItemId: string;
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    unitCost: number;
    lineTotal: number;
    serialNumber?: string;
    batchNumber?: string;
}

export interface SupplierCreditDto {
    id: string;
    purchaseReturnId: string;
    amount: number;
    method: SupplierCreditMethod;
    reference?: string;
    recordedOn: string;
    recordedByUserId: string;
}

export interface PurchaseReturnDto {
    id: string;
    goodsReceiptId: string;
    originalReceiptNumber: string;
    purchaseOrderId: string;
    originalPONumber: string;
    outletId: string;
    supplierId: string;
    returnNumber: string;
    sequenceNumber: number;
    returnDate: string;
    total: number;
    creditAmount: number;
    balance: number;
    status: PurchaseReturnStatus;
    reason: PurchaseReturnReason;
    notes?: string;
    items: PurchaseReturnItemDto[];
    credits: SupplierCreditDto[];
}

export interface CreatePurchaseReturnLine {
    goodsReceiptItemId: string;
    quantity: number;
    serialNumber?: string;
}

export interface CreatePurchaseReturnCredit {
    amount: number;
    method: SupplierCreditMethod;
    reference?: string;
}

export interface CreatePurchaseReturnRequest {
    goodsReceiptId: string;
    reason: PurchaseReturnReason;
    lines: CreatePurchaseReturnLine[];
    credits: CreatePurchaseReturnCredit[];
    notes?: string;
}
