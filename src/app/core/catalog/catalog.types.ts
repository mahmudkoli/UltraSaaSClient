/** Mirrors UltraSaaS.Domain.Catalog.ProductOfferType. */
export type ProductOfferType = 'None' | 'Flat' | 'Percentage';

export interface CategoryDto {
    id: string;
    name: string;
    description?: string;
    parentCategoryId?: string;
    displayOrder: number;
    isActive: boolean;
}

export interface BrandDto {
    id: string;
    name: string;
    description?: string;
    isActive: boolean;
}

export interface UnitDto {
    id: string;
    code: string;
    name: string;
    isWeight: boolean;
    decimalPlaces: number;
    isActive: boolean;
}

export interface ProductDto {
    id: string;
    sku: string;
    barcode?: string;
    name: string;
    description?: string;
    categoryId?: string;
    brandId?: string;
    unitId?: string;
    costPrice: number;
    sellingPrice: number;
    taxRate: number;
    reorderLevel: number;
    imageUrl?: string;
    isActive: boolean;
    // Intrinsic offer (Phase 2.41). Resolution chain (price wins): outlet > offer > base.
    offerType?: ProductOfferType;
    offerValue?: number;
    offerStartDate?: string;
    offerEndDate?: string;
    /** Computed server-side: only set when isOfferActive is true (configured + within date range). */
    offerPrice?: number;
    /** True when the offer is configured AND falls in [start, end]. */
    isOfferActive?: boolean;

    /** True when an Electronics extension row exists with RequiresSerial=true. */
    requiresSerial?: boolean;
    /** True when the Electronics extension also demands an IMEI (phones / tablets). */
    isImeiRequired?: boolean;
    /** True when a Pharmacy extension row exists with RequiresBatch=true. */
    requiresBatch?: boolean;
    requiresPrescription?: boolean;
    /** Outlet-resolved selling price when the search was scoped to an outlet (override > base, or base if no override). Undefined when no outlet was supplied. */
    outletSellingPrice?: number;
    /** True when outletSellingPrice is an outlet-specific override vs. just the base mirrored through. */
    isOutletPriceOverride?: boolean;
}

export interface CreateProductRequest {
    name: string;
    sku: string;
    description?: string;
    categoryId?: string;
    brandId?: string;
    unitId?: string;
    costPrice: number;
    sellingPrice: number;
    taxRate: number;
    reorderLevel: number;
    barcode?: string;
    imageUrl?: string;
    isActive: boolean;
    /** Intrinsic offer attached to the SKU. None means no offer. */
    offerType?: ProductOfferType;
    offerValue?: number;
    offerStartDate?: string;
    offerEndDate?: string;
}

export type UpdateProductRequest = Partial<CreateProductRequest> & {
    id: string;
    /** True to clear OfferStartDate + OfferEndDate (make the offer always-on). */
    clearOfferDates?: boolean;
};

export interface ProductOutletPriceDto {
    id: string;
    productId: string;
    outletId: string;
    sellingPrice: number;
    isActive: boolean;
}

export interface ResolvedPriceDto {
    productId: string;
    outletId: string;
    sellingPrice: number;
    isOverride: boolean;
}

export interface SetProductOutletPriceRequest {
    productId: string;
    outletId: string;
    sellingPrice: number;
    isActive: boolean;
}
