// ── Plans ──────────────────────────────────────────────────────────────────────

export interface PlanDto {
    id: string;
    code: string;
    name: string;
    monthlyFeeBDT: number;
    trialDays: number;
    maxOutlets: number;
    maxUsers: number;
    featureFlagsJson: string;
    isActive: boolean;
}

export interface CreatePlanRequest {
    code: string;
    name: string;
    monthlyFeeBDT: number;
    trialDays: number;
    maxOutlets: number;
    maxUsers: number;
    featureFlagsJson?: string;
}

export interface UpdatePlanRequest {
    id: string;
    name: string;
    monthlyFeeBDT: number;
    maxOutlets: number;
    maxUsers: number;
    featureFlagsJson?: string;
    isActive: boolean;
}

// ── Payments ───────────────────────────────────────────────────────────────────

export type TenantPaymentMethod = 'Bkash' | 'Nagad' | 'BankTransfer' | 'Cash' | 'Cheque' | 'Other';

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
    tenantId?: string;
    amount: number;
    method: TenantPaymentMethod;
    reference?: string;
    paidOn: string;
    periodStart: string;
    periodEnd: string;
    notes?: string;
}

// ── Notifications ──────────────────────────────────────────────────────────────

// ── Invoices ────────────────────────────────────────────────────────────────

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

// ── Notifications ──────────────────────────────────────────────────────────────

export type NotificationSeverity = 'Info' | 'Warning' | 'Urgent';
export type NotificationCategory = 'Subscription' | 'Announcement' | 'Other';
export type NotificationSource = 'System' | 'Admin';
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
    severity: NotificationSeverity;
    audienceKind: AnnouncementAudienceKind;
    audienceTarget?: string;
    audience: NotificationAudience;
    linkUrl?: string;
}

/** Phase 2.56c — read model returned by GET /api/announcements (admin audit trail). */
export interface AnnouncementDto {
    id: string;
    title: string;
    body: string;
    severity: NotificationSeverity;
    audienceKind: AnnouncementAudienceKind;
    audienceTarget?: string;
    audience: NotificationAudience;
    linkUrl?: string;
    deliveredTo: number;
    createdOn: string;
    createdBy: string;
}

export interface CreateAnnouncementResponse {
    deliveredTo: number;
}

// ── My subscription ────────────────────────────────────────────────────────────

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
    /** "none" | "warning" | "urgent" — banner severity hint. */
    severity: string;

    // Phase 2.52 — surfaced on the lockout page when isSystemActive=false.
    technicalAdminEmail?: string;
    suspensionReason?: string;
    suspendedUntil?: string;
}

// ── Admin dashboard ────────────────────────────────────────────────────────────

export interface DashboardTenantRow {
    id: string;
    name: string;
    planCode?: string;
    validUpto: string;
    daysUntilExpiry: number;
    paymentStatus: string;
    isSystemActive: boolean;
    createdOn: string;
    businessType: string;
}

export interface DashboardPaymentRow {
    id: string;
    tenantId: string;
    tenantName?: string;
    amount: number;
    method: string;
    paidOn: string;
}

export interface DashboardCountRow {
    label: string;
    count: number;
}

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
    verticalMix: DashboardCountRow[];
}
