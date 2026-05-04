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
    /** True when an Electronics extension row exists with RequiresSerial=true. */
    requiresSerial?: boolean;
    /** True when the Electronics extension also demands an IMEI (phones / tablets). */
    isImeiRequired?: boolean;
    /** True when a Pharmacy extension row exists with RequiresBatch=true. */
    requiresBatch?: boolean;
    requiresPrescription?: boolean;
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
}

export type UpdateProductRequest = Partial<CreateProductRequest> & { id: string };

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
