export interface PaginationInput {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
}
