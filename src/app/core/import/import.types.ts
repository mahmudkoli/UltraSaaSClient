/** Mirrors `ProductImportSummaryDto` on the backend. */
export interface ProductImportSummary {
    total: number;
    created: number;
    updated: number;
    skipped: number;
    failed: number;
    createdLookups: {
        categories: string[];
        brands: string[];
        units: string[];
    };
    errors: ProductImportError[];
    warnings: string[];
}

export interface ProductImportError {
    row: number;
    sku?: string;
    message: string;
}

export type ProductImportMode = 'AutoCreate' | 'Strict' | 'Update';

/** Mirrors `InitialStockImportSummaryDto` on the backend. */
export interface InitialStockImportSummary {
    total: number;
    created: number;
    skipped: number;
    failed: number;
    errors: InitialStockImportError[];
    warnings: string[];
}

export interface InitialStockImportError {
    row: number;
    outletCode?: string;
    sku?: string;
    message: string;
}
