import type { PaginationMeta } from "./PaginationMeta.js";

export class PaginationMetaMapper {
  static create(input: {
    currentPage: number;
    totalCount: number;
    limit: number;
  }): PaginationMeta {
    const totalPages = Math.ceil(input.totalCount / input.limit);
    return {
      currentPage: input.currentPage,
      totalPages,
      totalCount: input.totalCount,
      limit: input.limit,
      hasNext: input.currentPage < totalPages,
      hasPrev: input.currentPage > 1,
    };
  }
}
