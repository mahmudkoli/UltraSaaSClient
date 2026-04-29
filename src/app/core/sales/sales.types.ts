export interface CustomerDto {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    taxId?: string;
    customerType: 'Retail' | 'Wholesale' | 'Corporate';
    loyaltyPoints: number;
    creditLimit: number;
    currentBalance: number;
    isActive: boolean;
}

export type PaymentMethod = 'Cash' | 'Card' | 'MobileBanking' | 'BankTransfer' | 'Voucher' | 'Credit';

export interface CreateSaleLine {
    productId: string;
    quantity: number;
    unitPrice: number;
    discountAmount: number;
    serialNumber?: string;
    batchNumber?: string;
    weightKg?: number;
}

export interface CreateSalePayment {
    amount: number;
    method: PaymentMethod;
    reference?: string;
}

export interface CreateSaleRequest {
    outletId: string;
    customerId?: string;
    customerName?: string;
    customerPhone?: string;
    lines: CreateSaleLine[];
    payments: CreateSalePayment[];
    notes?: string;
}

export interface SaleItemDto {
    id: string;
    saleId: string;
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    discountAmount: number;
    taxRate: number;
    taxAmount: number;
    lineSubTotal: number;
    lineTotal: number;
    serialNumber?: string;
    batchNumber?: string;
    weightKg?: number;
}

export interface PaymentDto {
    id: string;
    saleId: string;
    amount: number;
    method: PaymentMethod;
    reference?: string;
    paidOn: string;
    receivedByUserId: string;
}

export interface SaleDto {
    id: string;
    outletId: string;
    invoiceNumber: string;
    sequenceNumber: number;
    customerId?: string;
    customerName?: string;
    customerPhone?: string;
    saleDate: string;
    subTotal: number;
    discountAmount: number;
    taxAmount: number;
    total: number;
    paidAmount: number;
    balance: number;
    status: 'Draft' | 'Finalized' | 'Voided';
    cashierUserId: string;
    notes?: string;
    items: SaleItemDto[];
    payments: PaymentDto[];
}

export type ReturnedItemCondition = 'Resellable' | 'Damaged';
export type SaleReturnReason = 'DefectiveProduct' | 'WrongItem' | 'BuyersRemorse' | 'ExpiredOrDamaged' | 'Other';

export interface CreateSaleReturnLine {
    saleItemId: string;
    quantity: number;
    condition: ReturnedItemCondition;
}

export interface CreateSaleReturnRefund {
    amount: number;
    method: PaymentMethod;
    reference?: string;
}

export interface CreateSaleReturnRequest {
    saleId: string;
    reason: SaleReturnReason;
    lines: CreateSaleReturnLine[];
    refunds: CreateSaleReturnRefund[];
    notes?: string;
}

export interface SaleReturnDto {
    id: string;
    saleId: string;
    originalInvoiceNumber: string;
    outletId: string;
    returnNumber: string;
    sequenceNumber: number;
    customerId?: string;
    customerName?: string;
    returnDate: string;
    subTotal: number;
    discountAmount: number;
    taxAmount: number;
    total: number;
    refundAmount: number;
    balance: number;
    status: 'Draft' | 'Completed' | 'Voided';
    reason: SaleReturnReason;
    notes?: string;
    items: SaleReturnItemDto[];
    refunds: RefundDto[];
}

export interface SaleReturnItemDto {
    id: string;
    saleReturnId: string;
    saleItemId: string;
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    condition: ReturnedItemCondition;
    serialNumber?: string;
}

export interface RefundDto {
    id: string;
    saleReturnId: string;
    amount: number;
    method: PaymentMethod;
    reference?: string;
    refundedOn: string;
}

export interface WarrantyDto {
    id: string;
    saleId: string;
    productName: string;
    serialNumber: string;
    customerName?: string;
    warrantyStart: string;
    warrantyEnd: string;
    status: 'Active' | 'Expired' | 'Claimed' | 'Void';
    isActive: boolean;
    daysRemaining: number;
}
