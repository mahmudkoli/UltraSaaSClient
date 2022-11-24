export type AdvancedSearch = {
    fields?: string[];
    keyword?: string;
}

export class QueryObject  {
    advancedSearch?: AdvancedSearch;
    keyword?: string;
    pageNumber: number;
    pageSize: number;
    orderBy?: string[];
    constructor() {
        this.pageNumber = 1;
        this.pageSize = 10;
    }
}