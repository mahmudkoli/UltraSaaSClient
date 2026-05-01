/**
 * Mirrors the backend's `PaginationFilter` (BaseFilter + PageNumber/PageSize/OrderBy[]).
 * Every list page that paginates server-side sends one of these to /api/{resource}/search.
 *
 * `orderBy` syntax: `["fieldName"]` for asc, `["fieldName Desc"]` for desc.
 * Backend's `PaginateBy()` clamps PageSize to [1, 1000].
 */
export interface PaginationFilter {
    pageNumber?: number;
    pageSize?: number;
    orderBy?: string[];
    keyword?: string;
}

/**
 * Mirrors the backend's `PaginationResponse<T>`.
 */
export interface PaginationResponse<T> {
    data: T[];
    currentPage: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

/**
 * Convert a Material `MatSort` direction + active column into the backend's
 * `OrderBy[]` array. Returns undefined when no sort is active so the spec
 * falls back to its default ordering.
 */
export function toOrderBy(active?: string, direction?: 'asc' | 'desc' | ''): string[] | undefined {
    if (!active || !direction) return undefined;
    return direction === 'desc' ? [`${active} Desc`] : [active];
}
