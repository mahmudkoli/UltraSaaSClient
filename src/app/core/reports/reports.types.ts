export interface SalesByDay {
    date: string;
    orderCount: number;
    revenue: number;
}

export interface SalesByPaymentMethod {
    method: string;
    count: number;
    total: number;
}

export interface SalesByOutlet {
    outletId: string;
    orderCount: number;
    revenue: number;
}

export interface SalesSummary {
    fromDate: string;
    toDate: string;
    outletId?: string;
    totalSales: number;
    voidedSales: number;
    grossRevenue: number;
    totalDiscount: number;
    totalTax: number;
    netRevenue: number;
    averageBasketValue: number;
    byDay: SalesByDay[];
    byPaymentMethod: SalesByPaymentMethod[];
    byOutlet: SalesByOutlet[];
}

export interface TopProduct {
    productId: string;
    productName: string;
    sku: string;
    quantitySold: number;
    revenue: number;
    lineCount: number;
}

export interface InventoryOnHandRow {
    productId: string;
    productName: string;
    sku: string;
    outletId: string;
    quantity: number;
    costPrice: number;
    sellingPrice: number;
    inventoryValueAtCost: number;
    lastMovementOn?: string;
}

export interface LowStockAlert {
    productId: string;
    productName: string;
    sku: string;
    outletId: string;
    quantity: number;
    reorderLevel: number;
    shortfall: number;
}

export interface ExpiringBatch {
    batchId: string;
    productId: string;
    productName: string;
    outletId: string;
    batchNumber: string;
    expiryDate: string;
    daysToExpiry: number;
    remainingQuantity: number;
    costValueAtRisk: number;
}

export interface PurchaseSummary {
    fromDate: string;
    toDate: string;
    outletId?: string;
    totalPurchaseOrders: number;
    totalReceipts: number;
    totalPurchaseValue: number;
    byOutlet: { outletId: string; orderCount: number; total: number }[];
    bySupplier: { supplierId: string; supplierName: string; orderCount: number; total: number }[];
}

export interface ARAgingInvoice {
    saleId: string;
    invoiceNumber: string;
    saleDate: string;
    daysOutstanding: number;
    total: number;
    paidAmount: number;
    balance: number;
}

export interface ARAgingByCustomer {
    customerId?: string;
    customerName: string;
    customerPhone?: string;
    creditLimit: number;
    bucket0to30: number;
    bucket31to60: number;
    bucket61to90: number;
    bucketOver90: number;
    totalOutstanding: number;
    invoiceCount: number;
    oldestInvoiceDate?: string;
    invoices: ARAgingInvoice[];
}

export interface ARAgingSummary {
    asOf: string;
    outletId?: string;
    bucket0to30: number;
    bucket31to60: number;
    bucket61to90: number;
    bucketOver90: number;
    totalOutstanding: number;
    customerCount: number;
    invoiceCount: number;
    byCustomer: ARAgingByCustomer[];
}
