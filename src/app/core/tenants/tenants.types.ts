/**
 * Tenant DTO mirrored from develop-v1 backend after Phases v1-C1 / v1-C2.2 /
 * v1-C7 cleanup. NO institute-specific business data here — that's in
 * InstituteDto. Plan / fees / quotas / compliance flags / resource counters
 * were dropped from FSHTenantInfo; lifecycle state added.
 */
export interface TenantDto {
    // Identity
    id: string;
    systemName: string;
    connectionString?: string;
    isShared: boolean;
    subdomain: string;

    // Billing & subscription
    planId?: string;
    /** Phase v1-O — ISO 4217 (see /api/currencies). Set at create-time, immutable. */
    currencyCode: string;
    validUpto: string;
    paymentStatus: string;
    lastPaymentDate?: string;
    nextBillingDate?: string;

    // System status
    isSystemActive: boolean;
    suspensionReason?: string;
    suspendedUntil?: string;

    // Lifecycle (Phase v1-C7)
    cancelledOn?: string;
    cancelReason?: string;
    archivedOn?: string;
    /** Derived state — Trial / Active / GracePeriod / Suspended / Cancelled / Archived. */
    lifecycleState: string;

    // Contacts
    technicalAdminEmail: string;
    billingEmail: string;

    // Audit retention
    auditRetentionDays: number;

    // Theme
    themeConfig?: string;

    // Audit metadata
    createdOn: string;
    createdBy: string;
    lastModifiedOn?: string;
    lastModifiedBy?: string;
    lastLoginDate?: string;

    // Computed
    isInTrial: boolean;
    isPaymentOverdue: boolean;
    daysUntilExpiry: number;
    isExpiringSoon: boolean;
    hasExpired: boolean;
}

/**
 * Request to create a new tenant. Phase v1-C2.2 dropped BillingPlan /
 * BillingCurrency / Issuer / CustomDomain / DataResidency / RequiresGDPR /
 * DataRetentionDays / Requires2FA / IpWhitelist / SupportTier /
 * AccountManagerEmail / EmergencyContact / Max* + back-compat aliases.
 */
export interface CreateTenantRequest {
    id: string;
    systemName: string;
    technicalAdminEmail: string;
    subdomain: string;

    connectionString?: string;
    isShared?: boolean;

    /** Phase v1-C1 — SubscriptionPlan FK. */
    planId?: string;
    billingEmail?: string;

    /**
     * Phase v1-O — ISO 4217 code (e.g. "BDT", "USD"). Defaults to platform
     * primary on the backend if omitted. Immutable once the tenant exists.
     */
    currencyCode?: string;
}

/** Phase v1-C2.2 — same cleanup as CreateTenantRequest. */
export interface UpdateTenantRequest {
    id: string;
    systemName?: string;
    technicalAdminEmail?: string;
    subdomain?: string;
    connectionString?: string;

    /** Phase v1-C1 — change plan via PUT. */
    planId?: string;
    billingEmail?: string;

    isShared?: boolean;
}

export interface CreateTenantWithInstituteRequest {
    // Tenant fields
    id: string;
    systemName: string;
    technicalAdminEmail: string;
    subdomain: string;
    connectionString?: string;
    isShared?: boolean;
    planId?: string;

    // Institute fields
    instituteDisplayName: string;
    instituteCode: string;
    instituteContactEmail: string;
    instituteAddressLine?: string;
    instituteContactPhone?: string;
    instituteLogoUrl?: string;
    instituteType: string;
    instituteCountry?: string;
    instituteCity?: string;
    instituteState?: string;
    institutePostalCode?: string;
    instituteWebsite?: string;
    maxStudents?: number;
    maxTeachers?: number;
    timeZone?: string;
    currency?: string;
    language?: string;
    instituteBannerUrl?: string;
    institutePrimaryColor?: string;
}

export interface CreateTenantWithInstituteResponse {
    tenantId: string;
    instituteId: string;
    tenantName: string;
    instituteName: string;
    status: string;
}

export interface TenantWithPermissionsDto extends TenantDto {
    permissions?: string[];
    /** The permissions endpoint returns the admin contact as `adminEmail`
     * (mapped from FSHTenantInfo.TechnicalAdminEmail), distinct from the
     * inherited `technicalAdminEmail` which that endpoint does not send. */
    adminEmail?: string;
}

export interface UpdateTenantPermissionsRequest {
    tenantId: string;
    permissions: string[];
}

export interface PermissionDto {
    name: string;
    description: string;
    action: string;
    resource: string;
    category: string;
    riskLevel: 'low' | 'medium' | 'high';
}

// Field names MUST match the backend SuspendTenantRequest (Id/Reason/SuspendUntil) —
// the endpoint validates `Id` NotEmpty, so sending `tenantId` 400s.
export interface SuspendTenantRequest {
    id: string;
    reason: string;
    suspendUntil?: string;
}

export interface ArchiveTenantRequest {
    tenantId: string;
    reason: string;
    archiveDate?: string;
}

/** Phase v1-C7 — terminal cancellation (RecordPayment does NOT auto-reactivate). */
export interface CancelTenantRequest {
    tenantId: string;
    reason: string;
}

export interface PaginationResponse<T> {
    data: T[];
    currentPage: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}
