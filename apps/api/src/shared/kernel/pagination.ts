export type PaginationQuery = {
  limit: number;
  offset: number;
};

export type SearchablePaginationQuery = PaginationQuery & {
  search?: string;
};

export type PaginatedResult<T> = {
  data: T[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasNext: boolean;
  };
};
