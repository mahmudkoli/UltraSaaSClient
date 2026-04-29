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
