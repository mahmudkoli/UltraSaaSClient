export interface TopProductTodayDto {
    productId: string;
    productName: string;
    sku: string;
    quantitySold: number;
}

export interface OpenShiftSummaryDto {
    shiftId: string;
    outletId: string;
    openedAt: string;
    openingFloat: number;
}

export interface RecentSaleDto {
    id: string;
    invoiceNumber: string;
    customerName?: string;
    total: number;
    saleDate: string;
}

export interface OutletSnapshotDto {
    outletId: string;
    outletName: string;
    todayRevenue: number;
    todaySaleCount: number;
}

export interface DashboardActionItemDto {
    kind: string;
    label: string;
    linkUrl: string;
    count?: number;
}

export interface MyDashboardDto {
    todayRevenue: number;
    todayRevenueDeltaPct?: number | null;
    todaySaleCount: number;
    topProductToday?: TopProductTodayDto;
    lowStockCount: number;
    openShift?: OpenShiftSummaryDto;
    recentSales: RecentSaleDto[];
    outlets: OutletSnapshotDto[];
    actionItems: DashboardActionItemDto[];
}
