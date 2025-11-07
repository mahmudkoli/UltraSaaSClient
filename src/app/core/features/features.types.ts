export interface FeatureDto {
    id: string;
    name: string;
    code: string;
    description: string;
    isActive: boolean;
    displayOrder: number;
    category?: string;
    createdOn: string;
    createdBy?: string;
    lastModifiedOn?: string;
    lastModifiedBy?: string;
}

export interface CreateFeatureRequest {
    name: string;
    code: string;
    description: string;
    displayOrder?: number;
    category?: string;
}

export interface AssignFeatureToTenantRequest {
    tenantId: string;
    featureId: string;
    isEnabled: boolean;
}

export interface TenantFeatureDto {
    tenantId: string;
    featureId: string;
    featureName: string;
    featureCode: string;
    featureDescription: string;
    isEnabled: boolean;
    enabledOn?: string;
    disabledOn?: string;
    enabledBy?: string;
    disabledBy?: string;
    createdOn: string;
    createdBy?: string;
    lastModifiedOn?: string;
    lastModifiedBy?: string;
}

export interface FeatureWithStatusDto {
    id: string;
    name: string;
    code: string;
    description: string;
    category?: string;
    displayOrder: number;
    isActive: boolean; // Feature is active in the system
    isEnabled: boolean; // Feature is enabled for the tenant
    enabledOn?: string;
    enabledBy?: string;
}

export interface TenantFeatureManagementDto {
    tenantId: string;
    tenantName: string;
    features: FeatureWithStatusDto[];
}

export interface UpdateTenantFeaturesRequest {
    tenantId: string;
    enabledFeatureIds: string[];
} 