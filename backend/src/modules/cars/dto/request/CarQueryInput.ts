import type { CarStatus } from "../../domain/CarStatus.js";

export interface CarQueryInput {
  page: number;
  limit: number;
  sortBy: "createdAt" | "brand" | "model" | "dailyRate";
  sortOrder: "asc" | "desc";
  brand?: string | undefined;
  category?: string | undefined;
  status?: CarStatus | undefined;
  minYear?: number | undefined;
  maxYear?: number | undefined;
  model?: string | undefined;
  year?: number | undefined;
  dailyRate?: string | undefined;
  plate?: string | undefined;
}
