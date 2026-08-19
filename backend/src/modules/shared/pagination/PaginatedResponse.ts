import type { PaginationMeta } from "./PaginationMeta.js";

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
