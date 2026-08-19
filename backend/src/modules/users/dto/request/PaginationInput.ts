export interface PaginationInput {
  page: number;
  limit: number;
  sortBy: "createdAt" | "email";
  sortOrder: "asc" | "desc";
}
