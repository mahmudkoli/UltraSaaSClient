export type OutletType = 'Retail' | 'Warehouse' | 'HQ';
export type OutletStatus = 'Active' | 'Suspended' | 'Archived';

export interface OutletDto {
    id: string;
    code: string;
    name: string;
    tenantId: string;
    type: OutletType;
    status: OutletStatus;

    contactEmail?: string;
    contactPhone?: string;

    addressLine?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;

    timeZone: string;
    currency: string;
    language: string;

    logoUrl?: string;
    primaryColor?: string;

    lastActivityDate?: string;

    createdOn: string;
    createdBy: string;
    lastModifiedOn?: string;
    lastModifiedBy?: string;

    isOperational: boolean;
}

export interface CreateOutletRequest {
    code: string;
    name: string;
    tenantId: string;
    type: OutletType;
    contactEmail?: string;
    contactPhone?: string;
    addressLine?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
}

export interface UpdateOutletRequest {
    id: string;
    name?: string;
    type?: OutletType;
    contactEmail?: string;
    contactPhone?: string;
    addressLine?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    logoUrl?: string;
    primaryColor?: string;
    timeZone?: string;
    currency?: string;
    language?: string;
}
