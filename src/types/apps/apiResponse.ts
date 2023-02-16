//paginated List response
export interface PaginatedApiResponse<T> {
  currentPage: number
  totalPages: number
  totalCount: number
  pageSize: number
  hasPreviousPage: boolean
  hasNextPage: boolean
  data: T[]
}

//api error Response
export type apiErrorResponse = {
  messages: string[]
  exception: string
  errorId: string
  supportMessage: string
  statusCode: number
}
