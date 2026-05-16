export type BusinessType = 'Generic' | 'Electronics' | 'Pharmacy' | 'Supermarket';

/**
 * Tenant DTO mirrored from the backend. Pre-launch cleanup (Phase 2.51)
 * dropped every field that had no enforcement: GDPR / 2FA / IP whitelist,
 * support tier, account manager, custom domain, Azure AD issuer, the legacy
 * resource-usage counters, and the billing currency (locked BDT). Quotas +
 * monthly fee are plan-derived and resolved via PlansService.
 */
export interface TenantDto {
    // Identity
    id: string;
    systemName: string;
    connectionString?: string;
    isShared: boolean;
    subdomain: string;

    // Vertical
    businessType: BusinessType;
    outletLabel: string;
    posLayout?: string;

    // Billing / subscription
    planId?: string;
    validUpto: string;
    paymentStatus: string;
    lastPaymentDate?: string;
    nextBillingDate?: string;

    // System status
    isSystemActive: boolean;
    suspensionReason?: string;
    suspendedUntil?: string;

    // Contacts
    technicalAdminEmail: string;
    billingEmail: string;

    // Limits (plan-derived; read-only)
    maxOutlets: number;
    maxUsers: number;

    // Audit retention (Hangfire purge job reads this)
    auditRetentionDays: number;

    // Label printing defaults
    showPriceOnLabel: boolean;
    useOutletPriceOnLabel: boolean;

    // Theme
    themeConfig?: string;

    // Audit
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

export interface CreateTenantRequest {
    id: string;
    systemName: string;
    technicalAdminEmail: string;
    subdomain: string;

    /** Optional FK to SubscriptionPlan.id. Null → backend uses Starter. */
    planId?: string;

    // Vertical
    businessType?: BusinessType;
    outletLabel?: string;

    // POS layout
    posLayout?: string;

    // Optional technical fields
    connectionString?: string;
    isShared?: boolean;

    // Optional billing
    billingEmail?: string;
}

export interface UpdateTenantRequest {
    id: string;

    // Identity
    systemName?: string;
    technicalAdminEmail?: string;
    subdomain?: string;
    connectionString?: string;

    // Plan-change cascade (Phase 2.50)
    planId?: string;
    /** Bypass the plan-change quota pre-flight. Propagated as `?force=true`. */
    force?: boolean;

    billingEmail?: string;

    // Audit retention
    auditRetentionDays?: number;

    // Vertical
    businessType?: BusinessType;
    outletLabel?: string;

    // System settings
    isShared?: boolean;

    // POS layout
    posLayout?: string;

    // Label preferences
    showPriceOnLabel?: boolean;
    useOutletPriceOnLabel?: boolean;
}

export interface TenantWithPermissionsDto extends TenantDto {
    permissions?: string[];
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

export interface SuspendTenantRequest {
    tenantId: string;
    reason: string;
    suspendedUntil?: string;
}

export interface ArchiveTenantRequest {
    tenantId: string;
    reason: string;
    archiveDate?: string;
}

/** Per-tenant usage — only the two enforced quotas. */
export interface TenantUsageDto {
    tenantId: string;
    systemName: string;
    currentOutlets: number;
    maxOutlets: number;
    currentUsers: number;
    maxUsers: number;
    usagePercentages: {
        users: number;
        outlets: number;
    };
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

export interface BulkSuspendTenantsRequest {
    tenantIds: string[];
    reason: string;
}

export interface BulkActivateTenantsRequest {
    tenantIds: string[];
}
