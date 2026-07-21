/**
 * Institute DTO for BUSINESS level data (public info, operational settings)
 * NO technical/system data here - that goes in TenantDto
 * Represents business/public aspects of institute
 */
export interface InstituteDto {
    // ============= INSTITUTE IDENTITY =============
    id: string;
    code: string;
    displayName: string; // Changed from name
    type: string;
    tenantId: string;

    // ============= CONTACT INFORMATION =============
    contactEmail: string; // Changed from description
    contactPhone?: string; // Changed from phone
    website?: string;

    // ============= LOCATION =============
    addressLine?: string; // Changed from address
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;

    // ============= CAPACITY LIMITS =============
    maxEmployees: number;
    maxUsers: number;
    maxStorageGB: number;

    // ============= CONFIGURATION =============
    timeZone?: string;
    currency?: string;
    language?: string;
    fiscalYearFormat: string;

    // ============= BRANDING =============
    logoUrl?: string; // Changed from logo
    bannerUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
    favicon?: string;
    customCss?: string;
    brandName?: string;
    brandTagline?: string;

    // ============= STATUS =============
    status: string;
    setupInitiatedOn: string;
    setupCompletedOn?: string;
    setupCompletedBy?: string;

    // ============= STATISTICS =============
    currentEmployeeCount: number;
    currentStorageUsedMB: number;
    lastActivityDate?: string;

    // ============= ADDITIONAL STATISTICS =============
    currentEmployees: number; // Alias for currentEmployeeCount
    currentStorageUsed: number; // Alias for currentStorageUsedMB
    storageLimit: number;

    // ============= AUDIT =============
    createdOn: string;
    createdBy: string;
    lastModifiedOn?: string;
    lastModifiedBy?: string;

    // ============= COMPUTED PROPERTIES =============
    isSetupComplete: boolean;
    isOperational: boolean;
    hasReachedEmployeeLimit: boolean;
    hasReachedStorageLimit: boolean;
    employeeCapacityPercentage: number;
    storageUsagePercentage: number;

    // ============= BACKWARD COMPATIBILITY =============
    /** @deprecated Use displayName instead */
    name?: string;
    /** @deprecated Use contactEmail instead */
    description?: string;
    /** @deprecated Use addressLine instead */
    address?: string;
    /** @deprecated Use contactPhone instead */
    phone?: string;
    /** @deprecated Use logoUrl instead */
    logo?: string;
    /** @deprecated Use status comparison with InstituteStatus.Active instead */
    isActive?: boolean;
}

/**
 * Request to create a new institute with business-level configuration
 * Contains only institute-specific fields - system data is managed at tenant level
 */
/**
 * A file selected in the browser, encoded for the backend IFileStorageService
 * (matches the .NET FileUploadRequest: Name, Extension, base64 Data).
 */
export interface FileUploadRequest {
    name: string;
    extension: string; // includes the leading dot, e.g. ".png"
    data: string;      // base64 (no data: prefix)
}

export interface CreateInstituteRequest {
    // ============= REQUIRED FIELDS =============
    code: string;
    displayName: string; // Changed from name
    tenantId: string;
    type: string;
    contactEmail: string; // Changed from description
    country?: string;

    // ============= CONTACT INFORMATION =============
    contactPhone?: string; // Changed from phone
    website?: string;

    // ============= LOCATION =============
    addressLine?: string; // Changed from address
    city?: string;
    state?: string;
    postalCode?: string;

    // ============= CAPACITY LIMITS =============
    maxEmployees?: number;

    // ============= CONFIGURATION =============
    timeZone?: string; // Auto-set based on country if not provided
    currency?: string; // Auto-set based on country if not provided
    language?: string;

    // ============= BRANDING =============
    logoUrl?: string; // Changed from logo
    /** A newly selected logo image; uploaded server-side and used as the logo. */
    logoUpload?: FileUploadRequest;
    bannerUrl?: string;
    primaryColor?: string;

    // ============= BACKWARD COMPATIBILITY =============
    /** @deprecated Use displayName instead */
    name?: string;
    /** @deprecated Use contactEmail instead */
    description?: string;
    /** @deprecated Use addressLine instead */
    address?: string;
    /** @deprecated Use contactPhone instead */
    phone?: string;
    /** @deprecated Use logoUrl instead */
    logo?: string;
}

/**
 * Request to update institute business-level configuration
 */
export interface UpdateInstituteRequest {
    id: string;

    // ============= UPDATEABLE FIELDS =============
    displayName?: string; // Changed from name
    contactEmail?: string; // Changed from description
    contactPhone?: string; // Changed from phone
    website?: string;
    addressLine?: string; // Changed from address
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    type?: string;
    maxEmployees?: number;
    timeZone?: string;
    currency?: string;
    language?: string;
    logoUrl?: string; // Changed from logo
    /** A newly selected logo image; uploaded server-side and replaces the logo URL. */
    logoUpload?: FileUploadRequest;
    bannerUrl?: string;
    primaryColor?: string;

    // ============= BACKWARD COMPATIBILITY =============
    /** @deprecated Use displayName instead */
    name?: string;
    /** @deprecated Use contactEmail instead */
    description?: string;
    /** @deprecated Use addressLine instead */
    address?: string;
    /** @deprecated Use contactPhone instead */
    phone?: string;
    /** @deprecated Use logoUrl instead */
    logo?: string;
    code?: string;
}

/**
 * Institute status management requests
 */
export interface CompleteInstituteSetupRequest {
    id: string;
    completedBy: string;
}

export interface SuspendInstituteRequest {
    id: string;
    reason: string;
}

export interface ReactivateInstituteRequest {
    id: string;
}

export interface ArchiveInstituteRequest {
    id: string;
    reason: string;
}

/**
 * Institute branding management
 */
export interface UpdateInstituteBrandingRequest {
    id: string;
    logoUrl?: string;
    bannerUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
    favicon?: string;
    customCss?: string;
    brandName?: string;
    brandTagline?: string;
}

/**
 * Institute statistics management
 */
export interface UpdateInstituteStatisticsRequest {
    id: string;
    currentEmployeeCount: number;
    currentStorageUsedMB: number;
}

export interface InstituteSearchParams {
    SearchString?: string;
    Type?: string;
    Status?: string;
    Country?: string;
    SetupStatus?: string;
    TenantId?: string;
}

/**
 * Institute usage and capacity information
 */
export interface InstituteUsageDto {
    instituteId: string;
    displayName: string;
    capacityUsage: {
        employees: {
            current: number;
            max: number;
            percentage: number;
        };
        storage: {
            currentMB: number;
            maxGB: number;
            percentage: number;
        };
    };
    isApproachingLimits: boolean;
    hasExceededLimits: boolean;
}

/**
 * Institute types and enums
 */
export enum InstituteType {
    Startup = 'Startup',
    Company = 'Company',
    Enterprise = 'Enterprise',
    NonProfit = 'NonProfit',
    Government = 'Government'
}

export enum InstituteStatus {
    Setup = 'Setup',
    Active = 'Active',
    Suspended = 'Suspended',
    Archived = 'Archived'
}

/**
 * Institute dashboard summary
 */
export interface InstituteDashboardSummary {
    totalInstitutes: number;
    activeInstitutes: number;
    pendingSetup: number;
    suspended: number;
    byType: Record<InstituteType, number>;
    byCountry: Record<string, number>;
    totalEmployees: number;
    storageUsageGB: number;
}

// ============= ADDITIONAL REQUEST INTERFACES =============

export interface UpdateInstituteCapacityRequest {
    id: string;
    maxEmployees?: number;
    maxUsers?: number;
    maxStorageGB?: number;
    storageLimit?: number;
}

export interface BulkActivateInstitutesRequest {
    instituteIds: string[];
}

export interface BulkSuspendInstitutesRequest {
    instituteIds: string[];
    reason: string;
}

export interface BulkUpdateInstituteTypeRequest {
    instituteIds: string[];
    instituteType: InstituteType;
}

// Re-export PaginationResponse from tenants (for consistency)
export interface PaginationResponse<T> {
    data: T[];
    currentPage: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}