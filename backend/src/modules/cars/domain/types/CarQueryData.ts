import type { CarStatus } from "../CarStatus.js";

export interface CarQueryData {
  page: number;
  limit: number;
  sortBy: "createdAt" | "brand" | "model" | "dailyRate";
  sortOrder: "asc" | "desc";
  id?: string | undefined;
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
