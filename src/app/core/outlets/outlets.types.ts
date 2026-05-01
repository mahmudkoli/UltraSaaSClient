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

    /** True when the outlet has uploaded a logo. Fetch via /api/outlets/{id}/logo. */
    hasLogo?: boolean;
    logoMimeType?: string;
    primaryColor?: string;
    /** Tax/VAT/GST registration number printed on receipts. */
    taxId?: string;

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
    primaryColor?: string;
    taxId?: string;
    timeZone?: string;
    currency?: string;
    language?: string;
}
