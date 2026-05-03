/**
 * Receipt / invoice paper format. Drives template selection at print time:
 *  - Thermal80mm and Thermal58mm share the existing 80mm thermal HTML
 *    (CSS width tweak for 58mm printers).
 *  - A4 uses a separate full-page invoice template with billing block,
 *    line-tax breakdown, totals and payment terms.
 */
export type PaperFormat = 'Thermal80mm' | 'Thermal58mm' | 'A4';

export const PAPER_FORMAT_LABELS: Record<PaperFormat, string> = {
    Thermal80mm: '80mm Thermal (POS roll)',
    Thermal58mm: '58mm Thermal (mobile printer)',
    A4: 'A4 Invoice (laser/desktop)',
};

export interface BrandingProfileDto {
    id: string;
    name: string;
    paperFormat: PaperFormat;
    /** True when bytes are stored. Fetch via /api/brandingprofiles/{id}/logo. */
    hasLogo: boolean;
    logoMimeType?: string;
    primaryColor?: string;
    taxId?: string;
    headerText?: string;
    footerText?: string;
    isActive: boolean;
    createdOn: string;
}

export interface CreateBrandingProfileRequest {
    name: string;
    paperFormat?: PaperFormat;
    primaryColor?: string;
    taxId?: string;
    headerText?: string;
    footerText?: string;
}

export interface UpdateBrandingProfileRequest {
    id: string;
    name?: string;
    paperFormat?: PaperFormat;
    primaryColor?: string;
    taxId?: string;
    headerText?: string;
    footerText?: string;
    isActive?: boolean;
}
