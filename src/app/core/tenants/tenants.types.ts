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

    // ============= TECHNICAL CONFIGURATION =============
    isShared: boolean;
    issuer?: string;
    subdomain: string; // Changed from url
    customDomain?: string;

    // ============= BILLING & SUBSCRIPTION =============
    billingPlan: string;
    monthlyFee: number;
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
    billingPlan?: string;

    // ============= VERTICAL =============
    businessType?: BusinessType;
    outletLabel?: string;

    // ============= OPTIONAL TECHNICAL FIELDS =============
    connectionString?: string;
    isShared?: boolean;
    issuer?: string;
    customDomain?: string;

    // ============= BILLING FIELDS =============
    monthlyFee?: number;
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

    // ============= BILLING FIELDS =============
    billingPlan?: string;
    monthlyFee?: number;
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
 * Request to create both tenant and institute together
 * Combines system-level and business-level configuration
 */
export interface CreateTenantWithInstituteRequest {
    // ============= TENANT FIELDS =============
    id: string;
    systemName: string; // Changed from name
    technicalAdminEmail: string; // Changed from adminEmail
    subdomain: string; // Changed from url
    connectionString?: string;
    isShared?: boolean;
    issuer?: string;
    billingPlan?: string;
    billingCurrency?: string;
    dataResidency?: string;
    supportTier?: string;

    // ============= INSTITUTE FIELDS =============
    instituteDisplayName: string; // Changed from instituteName
    instituteCode: string;
    instituteContactEmail: string; // Changed from instituteDescription
    instituteAddressLine?: string; // Changed from instituteAddress
    instituteContactPhone?: string; // Changed from institutePhone
    instituteLogoUrl?: string; // Changed from instituteLogo
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

    // ============= BACKWARD COMPATIBILITY =============
    /** @deprecated Use systemName instead */
    name?: string;
    /** @deprecated Use technicalAdminEmail instead */
    adminEmail?: string;
    /** @deprecated Use subdomain instead */
    url?: string;
    /** @deprecated Use instituteDisplayName instead */
    instituteName?: string;
    /** @deprecated Use instituteContactEmail instead */
    instituteDescription?: string;
    /** @deprecated Use instituteAddressLine instead */
    instituteAddress?: string;
    /** @deprecated Use instituteContactPhone instead */
    institutePhone?: string;
    /** @deprecated Use instituteLogoUrl instead */
    instituteLogo?: string;
}

export interface CreateTenantWithInstituteResponse {
    tenantId: string;
    instituteId: string;
    tenantSystemName: string; // Changed from tenantName
    instituteDisplayName: string; // Changed from instituteName
    status: string;

    // ============= BACKWARD COMPATIBILITY =============
    /** @deprecated Use tenantSystemName instead */
    tenantName?: string;
    /** @deprecated Use instituteDisplayName instead */
    instituteName?: string;
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

/**
 * Billing-specific requests
 */
export interface UpdateBillingRequest {
    tenantId: string;
    billingPlan: string;
    billingEmail?: string;
    billingCurrency?: string;
    monthlyFee?: number;
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

export interface UpdateBillingPlanRequest {
    tenantId: string;
    billingPlan: string;
    monthlyFee?: number;
    billingCurrency?: string;
    billingEmail?: string;
    paymentStatus?: string;
}

export interface UpdateResourceLimitsRequest {
    tenantId: string;
    maxDatabaseGB?: number;
    maxApiCallsPerMonth?: number;
    maxConcurrentUsers?: number;
    maxOutlets?: number;
    maxUsers?: number;
}

export interface ExtendValidityRequest {
    tenantId: string;
    months: number;
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

export interface BulkUpdateBillingPlanRequest {
    tenantIds: string[];
    billingPlan: string;
}