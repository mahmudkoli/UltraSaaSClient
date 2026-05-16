export type BusinessType = 'Generic' | 'Electronics' | 'Pharmacy' | 'Supermarket';

/**
 * Tenant DTO for SYSTEM level data (authentication, billing, technical config)
 * NO institute-specific business data here - that goes in InstituteDto
 * Represents technical/system aspects of tenant
 */
export interface TenantDto {
    // ============= TENANT IDENTITY =============
    id: string;
    systemName: string; // Changed from name
    connectionString?: string;

    // ============= VERTICAL =============
    businessType: BusinessType;
    outletLabel: string;

    // ============= POS =============
    /** POS sale-screen layout name. Frontend registry maps this to a component; null/unknown → default. */
    posLayout?: string;

    // ============= TECHNICAL CONFIGURATION =============
    isShared: boolean;
    issuer?: string;
    subdomain: string; // Changed from url
    customDomain?: string;

    // ============= BILLING & SUBSCRIPTION =============
    /** FK to SubscriptionPlan.id. Plan name / fee / limits resolve via PlansService. */
    planId?: string;
    billingCurrency: string;
    validUpto: string;
    paymentStatus: string;
    lastPaymentDate?: string;
    lastBillingDate?: string;
    nextBillingDate?: string;

    // ============= SYSTEM STATUS =============
    isSystemActive: boolean; // Changed from isActive
    suspensionReason?: string;
    suspendedUntil?: string;

    // ============= TECHNICAL CONTACTS =============
    technicalAdminEmail: string; // Changed from adminEmail
    billingEmail: string;
    emergencyContact?: string;

    // ============= SYSTEM LIMITS =============
    maxDatabaseGB: number;
    maxApiCallsPerMonth: number;
    maxConcurrentUsers: number;
    maxOutlets: number;
    maxUsers: number;
    maxInstitutes: number;
    currentMonthApiCalls: number;
    currentDatabaseMB: number;
    currentUsers: number;

    // ============= COMPLIANCE & SECURITY =============
    dataResidency: string;
    requiresGDPR: boolean;
    dataRetentionDays: number;
    /** Days to keep Trail audit-log rows for this tenant before the daily purge job deletes them. Default 365; 0 = keep forever. */
    auditRetentionDays: number;
    /** Tenant default for "show price on barcode label". Print Labels dialog seeds its toggle from this. */
    showPriceOnLabel: boolean;
    /** Tenant default for "use outlet-resolved price on barcode label" (vs. catalog base). */
    useOutletPriceOnLabel: boolean;
    requires2FA: boolean;
    ipWhitelist?: string;

    // ============= SUPPORT =============
    supportTier: string;
    accountManagerEmail?: string;

    // ============= FEATURE FLAGS =============
    enableAdvancedReporting: boolean;
    enableCustomBranding: boolean;
    enableApiAccess: boolean;
    enableBackupRestore: boolean;
    enableMultipleDatabases: boolean;

    // ============= AUDIT =============
    createdOn: string;
    createdBy: string;
    lastModifiedOn?: string;
    lastModifiedBy?: string;
    lastLoginDate?: string;

    // ============= COMPUTED PROPERTIES =============
    isInTrial: boolean;
    isPaymentOverdue: boolean;
    hasCustomDomain: boolean;
    isApproachingLimit: boolean;
    hasExceededApiLimit: boolean;
    daysUntilExpiry: number;
    isExpiringSoon: boolean;
    hasExpired: boolean;

    // ============= THEME =============
    themeConfig?: string;

    // ============= BACKWARD COMPATIBILITY =============
    /** @deprecated Use systemName instead */
    name?: string;
    /** @deprecated Use technicalAdminEmail instead */
    adminEmail?: string;
    /** @deprecated Use isSystemActive instead */
    isActive?: boolean;
    /** @deprecated Use subdomain instead */
    url?: string;
}

/**
 * Request to create a new tenant with system-level configuration
 * Contains only technical/system fields - institute data goes in separate request
 */
export interface CreateTenantRequest {
    // ============= REQUIRED FIELDS =============
    id: string;
    systemName: string; // Changed from name
    technicalAdminEmail: string; // Changed from adminEmail
    subdomain: string; // Changed from url
    /** Optional FK to SubscriptionPlan.id. Null → backend uses Starter. */
    planId?: string;

    // ============= VERTICAL =============
    businessType?: BusinessType;
    outletLabel?: string;

    // ============= POS =============
    /** Layout name; null/unknown → default. */
    posLayout?: string;

    // ============= OPTIONAL TECHNICAL FIELDS =============
    connectionString?: string;
    isShared?: boolean;
    issuer?: string;
    customDomain?: string;

    // ============= BILLING FIELDS =============
    billingCurrency?: string;
    billingEmail?: string;
    paymentStatus?: string;

    // ============= COMPLIANCE FIELDS =============
    dataResidency?: string;
    requiresGDPR?: boolean;
    dataRetentionDays?: number;
    requires2FA?: boolean;
    ipWhitelist?: string;

    // ============= SUPPORT FIELDS =============
    supportTier?: string;
    accountManagerEmail?: string;
    emergencyContact?: string;

    // ============= SYSTEM SETTINGS =============
    maxDatabaseGB?: number;
    maxApiCallsPerMonth?: number;
    maxConcurrentUsers?: number;
    maxOutlets?: number;
    maxUsers?: number;
    maxInstitutes?: number;
    /** Days to keep Trail audit-log rows. 1–3650; 0 = keep forever. Default 365. */
    auditRetentionDays?: number;

    // ============= LABEL PREFERENCES (Phase 2.40) =============
    /** Tenant default for "show price on barcode label". */
    showPriceOnLabel?: boolean;
    /** Tenant default for "use outlet-resolved price on barcode label". */
    useOutletPriceOnLabel?: boolean;

    // ============= FEATURE FLAGS =============
    enableAdvancedReporting?: boolean;
    enableCustomBranding?: boolean;
    enableApiAccess?: boolean;
    enableBackupRestore?: boolean;
    enableMultipleDatabases?: boolean;

    // ============= BACKWARD COMPATIBILITY =============
    /** @deprecated Use systemName instead */
    name?: string;
    /** @deprecated Use technicalAdminEmail instead */
    adminEmail?: string;
    /** @deprecated Use subdomain instead */
    url?: string;
    validUpto?: string;
    isActive?: boolean;
}

/**
 * Request to update tenant system-level configuration
 * Contains only technical/system fields that can be updated
 */
export interface UpdateTenantRequest {
    id: string;

    // ============= UPDATEABLE SYSTEM FIELDS =============
    systemName?: string; // Changed from name
    technicalAdminEmail?: string; // Changed from adminEmail
    subdomain?: string; // Changed from url
    connectionString?: string;
    customDomain?: string;
    issuer?: string;

    // ============= POS =============
    /** Layout name; null/unknown → default. */
    posLayout?: string;

    // ============= BILLING FIELDS =============
    /** FK to SubscriptionPlan.id. On change the backend cascades MaxOutlets/MaxUsers
     * and replaces the tenant's TenantFeature set from the plan's FeatureFlagsJson.
     * If current outlets/users exceed the new plan's limits, the API returns 409
     * with `{ field, currentlyUsed, newLimit, planName }`; retry with `force: true`
     * (also propagated as the `?force=true` query string) to accept and proceed. */
    planId?: string;
    /** Bypass the plan-change quota pre-flight. Propagated as `?force=true`. */
    force?: boolean;
    billingCurrency?: string;
    billingEmail?: string;
    paymentStatus?: string;

    // ============= COMPLIANCE FIELDS =============
    dataResidency?: string;
    requiresGDPR?: boolean;
    dataRetentionDays?: number;
    requires2FA?: boolean;
    ipWhitelist?: string;

    // ============= SUPPORT FIELDS =============
    supportTier?: string;
    accountManagerEmail?: string;
    emergencyContact?: string;

    // ============= SYSTEM SETTINGS (Admin Only) =============
    isShared?: boolean;
    maxDatabaseGB?: number;
    maxApiCallsPerMonth?: number;
    maxConcurrentUsers?: number;
    maxOutlets?: number;
    maxUsers?: number;
    maxInstitutes?: number;
    /** Days to keep Trail audit-log rows. 1–3650; 0 = keep forever. */
    auditRetentionDays?: number;

    // ============= LABEL PREFERENCES (Phase 2.40) =============
    /** Tenant default for "show price on barcode label". Print dialog toggle seeds from this. */
    showPriceOnLabel?: boolean;
    /** Tenant default for "use outlet-resolved price on barcode label" (only meaningful with showPriceOnLabel + an outlet). */
    useOutletPriceOnLabel?: boolean;

    // ============= FEATURE FLAGS =============
    enableAdvancedReporting?: boolean;
    enableCustomBranding?: boolean;
    enableApiAccess?: boolean;
    enableBackupRestore?: boolean;
    enableMultipleDatabases?: boolean;

    // ============= VERTICAL (Phase 2.38c) =============
    /** Pivots the vertical. Backend persists alongside other fields; the frontend
     * form gates this behind the orphan-data confirmation dialog. */
    businessType?: BusinessType;
    /** Outlet display label (default "Outlet"; Pharmacy / Branch / Store / etc.). */
    outletLabel?: string;

    // ============= BACKWARD COMPATIBILITY =============
    /** @deprecated Use systemName instead */
    name?: string;
    /** @deprecated Use technicalAdminEmail instead */
    adminEmail?: string;
    /** @deprecated Use subdomain instead */
    url?: string;
    validUpto?: string;
    isActive?: boolean;
}

export interface UpgradeSubscriptionRequest {
    tenantId: string;
    billingPlan: string;
    extendedExpiryDate?: string;
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

/**
 * Resource usage and monitoring
 */
export interface TenantUsageDto {
    tenantId: string;
    currentDatabaseMB: number;
    maxDatabaseGB: number;
    currentMonthApiCalls: number;
    maxApiCallsPerMonth: number;
    currentConcurrentUsers: number;
    maxConcurrentUsers: number;
    currentOutlets: number;
    maxOutlets: number;
    currentUsers: number;
    maxUsers: number;
    usagePercentages: {
        database: number;
        apiCalls: number;
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

// ============= REQUEST INTERFACES =============

export interface UpdateResourceLimitsRequest {
    tenantId: string;
    maxDatabaseGB?: number;
    maxApiCallsPerMonth?: number;
    maxConcurrentUsers?: number;
    maxOutlets?: number;
    maxUsers?: number;
    /** Days to keep Trail audit-log rows. 1–3650; 0 = keep forever. */
    auditRetentionDays?: number;

    // ============= LABEL PREFERENCES (Phase 2.40) =============
    /** Tenant default for "show price on barcode label". Print dialog toggle seeds from this. */
    showPriceOnLabel?: boolean;
    /** Tenant default for "use outlet-resolved price on barcode label" (only meaningful with showPriceOnLabel + an outlet). */
    useOutletPriceOnLabel?: boolean;
}

export interface UpdateResourceUsageRequest {
    tenantId: string;
    databaseMB: number;
    apiCalls: number;
}

export interface BulkSuspendTenantsRequest {
    tenantIds: string[];
    reason: string;
}

export interface BulkActivateTenantsRequest {
    tenantIds: string[];
}