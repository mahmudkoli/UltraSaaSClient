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
    maxStudents: number;
    maxTeachers: number;
    maxUsers: number;
    maxStorageGB: number;
    maxStaff: number;
    maxClassrooms: number;
    maxCourses: number;

    // ============= CONFIGURATION =============
    timeZone?: string;
    currency?: string;
    language?: string;
    academicYearFormat: string;

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
    currentStudentCount: number;
    currentTeacherCount: number;
    currentStaffCount: number;
    currentStorageUsedMB: number;
    lastActivityDate?: string;

    // ============= ADDITIONAL STATISTICS =============
    currentStudents: number; // Alias for currentStudentCount
    currentTeachers: number; // Alias for currentTeacherCount
    currentStaff: number; // Alias for currentStaffCount
    currentStorageUsed: number; // Alias for currentStorageUsedMB
    storageLimit: number;
    activeClassrooms: number;
    activeCourses: number;
    totalEnrollments: number;

    // ============= AUDIT =============
    createdOn: string;
    createdBy: string;
    lastModifiedOn?: string;
    lastModifiedBy?: string;

    // ============= COMPUTED PROPERTIES =============
    isSetupComplete: boolean;
    isOperational: boolean;
    hasReachedStudentLimit: boolean;
    hasReachedTeacherLimit: boolean;
    hasReachedStorageLimit: boolean;
    studentCapacityPercentage: number;
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
    maxStudents?: number;
    maxTeachers?: number;

    // ============= CONFIGURATION =============
    timeZone?: string; // Auto-set based on country if not provided
    currency?: string; // Auto-set based on country if not provided
    language?: string;

    // ============= BRANDING =============
    logoUrl?: string; // Changed from logo
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
    maxStudents?: number;
    maxTeachers?: number;
    timeZone?: string;
    currency?: string;
    language?: string;
    logoUrl?: string; // Changed from logo
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
    currentStudentCount: number;
    currentTeacherCount: number;
    currentStaffCount: number;
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
        students: {
            current: number;
            max: number;
            percentage: number;
        };
        teachers: {
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
    PreSchool = 'PreSchool',
    School = 'School',
    College = 'College',
    University = 'University',
    TrainingCenter = 'TrainingCenter'
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
    totalStudents: number;
    totalTeachers: number;
    totalStaff: number;
    storageUsageGB: number;
}

// ============= ADDITIONAL REQUEST INTERFACES =============

export interface UpdateInstituteCapacityRequest {
    id: string;
    maxStudents?: number;
    maxTeachers?: number;
    maxUsers?: number;
    maxStorageGB?: number;
    maxStaff?: number;
    maxClassrooms?: number;
    maxCourses?: number;
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