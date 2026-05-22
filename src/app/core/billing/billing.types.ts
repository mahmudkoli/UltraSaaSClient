/**
 * Phase v1-C0 / v1-C5 / v1-C6 / v1-C7 frontend types — mirror the backend
 * DTOs under UltraSaaS.Application.Billing.*. Single file so all 5 surfaces
 * (plans, payments, notifications, subscription, dashboard, invoices) share
 * a common import.
 */

// ============= PLANS =============

export interface PlanDto {
    id: string;
    code: string;
    name: string;
    /**
     * Phase v1-O — per-currency monthly fees keyed by ISO 4217 code (see
     * /api/currencies). A plan may publish a subset of supported currencies;
     * a missing key means the plan isn't offered in that currency.
     */
    prices: Record<string, number>;
    trialDays: number;
    maxInstitutes: number;
    maxUsers: number;
    /** JSON array of feature codes, e.g. ["CUSTOM_BRAND"]. */
    featureFlagsJson: string;
    isActive: boolean;
}

export interface CreatePlanRequest {
    code: string;
    name: string;
    /** At least one currency required. Keys must be one of /api/currencies. */
    prices: Record<string, number>;
    trialDays: number;
    maxInstitutes: number;
    maxUsers: number;
    featureFlagsJson?: string;
}

export interface UpdatePlanRequest {
    id: string;
    name: string;
    prices: Record<string, number>;
    maxInstitutes: number;
    maxUsers: number;
    featureFlagsJson?: string;
    isActive: boolean;
}

// ============= PAYMENTS =============

export type TenantPaymentMethod =
    | 'Bkash'
    | 'Nagad'
    | 'BankTransfer'
    | 'Cash'
    | 'Cheque'
    | 'Other';

export interface TenantPaymentDto {
    id: string;
    tenantId: string;
    amount: number;
    method: TenantPaymentMethod;
    reference?: string;
    paidOn: string;
    periodStart: string;
    periodEnd: string;
    notes?: string;
    recordedByUserId: string;
    createdOn: string;
}

export interface RecordPaymentRequest {
    tenantId: string;
    amount: number;
    method: TenantPaymentMethod;
    reference?: string;
    paidOn: string;
    periodStart: string;
    periodEnd: string;
    notes?: string;
}

// ============= NOTIFICATIONS =============

export type NotificationSeverity = 'Info' | 'Warning' | 'Urgent';
export type NotificationSource = 'System' | 'Admin';
export type NotificationCategory = 'Subscription' | 'Announcement' | 'Other';
export type NotificationAudience = 'AdminOnly' | 'AllUsers';

export interface TenantNotificationDto {
    id: string;
    tenantId: string;
    title: string;
    body: string;
    severity: NotificationSeverity;
    source: NotificationSource;
    category: NotificationCategory;
    audience: NotificationAudience;
    linkUrl?: string;
    readOn?: string;
    createdOn: string;
}

export type AnnouncementAudienceKind = 'All' | 'Plan' | 'Tenant';

export interface CreateAnnouncementRequest {
    title: string;
    body: string;
    severity?: NotificationSeverity;
    audienceKind?: AnnouncementAudienceKind;
    /** Plan code when AudienceKind=Plan, tenant id when AudienceKind=Tenant. */
    audienceTarget?: string;
    audience?: NotificationAudience;
    linkUrl?: string;
}

export interface CreateAnnouncementResponse {
    deliveredTo: number;
}

// ============= SUBSCRIPTION =============

export interface MySubscriptionDto {
    tenantId: string;
    tenantName: string;
    plan?: PlanDto;
    validUpto: string;
    daysUntilExpiry: number;
    paymentStatus: string;
    lastPaymentDate?: string;
    nextBillingDate?: string;
    isSystemActive: boolean;
    /** "none" | "warning" | "urgent" — drives expiry-banner colour. */
    severity: string;

    // Lockout-page context (Phase v1-C4 fields exposed by backend in C0.2).
    technicalAdminEmail?: string;
    suspensionReason?: string;
    suspendedUntil?: string;
}

// ============= DASHBOARD =============

export interface AdminDashboardDto {
    mrr: number;
    activeTenants: number;
    newTenantsThisMonth: number;
    expiringThisWeek: number;
    overdueOrSuspended: number;
    collectedThisMonth: number;
    collectedLastMonth: number;
    actionQueue: DashboardTenantRow[];
    recentPayments: DashboardPaymentRow[];
    recentSignups: DashboardTenantRow[];
    planMix: DashboardCountRow[];
}

export interface DashboardTenantRow {
    id: string;
    name: string;
    planCode?: string;
    /** Phase v1-O — ISO 4217 code, used by the record-payment dialog to label
     * its amount input in the target tenant's currency. */
    currencyCode: string;
    validUpto: string;
    daysUntilExpiry: number;
    paymentStatus: string;
    isSystemActive: boolean;
    createdOn: string;
}

export interface DashboardPaymentRow {
    id: string;
    tenantId: string;
    tenantName?: string;
    amount: number;
    currencyCode: string;
    method: string;
    paidOn: string;
}

export interface DashboardCountRow {
    label: string;
    count: number;
}

// ============= INVOICES =============

export interface TenantInvoiceDto {
    id: string;
    serialNumber: string;
    tenantId: string;
    tenantName: string;
    paymentId?: string;
    issuedOn: string;
    periodStart: string;
    periodEnd: string;
    lineDescription: string;
    subtotal: number;
    vatPercent: number;
    vatAmount: number;
    total: number;
    issuerName: string;
    issuerBin?: string;
    issuerTin?: string;
    issuerAddress?: string;
}
