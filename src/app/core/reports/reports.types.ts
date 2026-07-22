export interface CountItemDto {
    label: string;
    count: number;
}

export interface HeadcountReportDto {
    total: number;
    active: number;
    inactive: number;
    byStatus: CountItemDto[];
    byDesignation: CountItemDto[];
    byDepartment: CountItemDto[];
}
