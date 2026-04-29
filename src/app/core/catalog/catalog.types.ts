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
