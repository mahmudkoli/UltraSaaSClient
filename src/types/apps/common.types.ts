import { GridColumns } from "@mui/x-data-grid"
import { PaginatedApiResponse } from "./apiResponse"

export class QueryObject {
  pageNumber: number
  pageSize: number
  orderBy?: string[]
  constructor() {
    this.pageNumber = 1
    this.pageSize = 10
  }
}

export type AdvancedSearch = {
  fields?: string[]
  keyword?: string
}