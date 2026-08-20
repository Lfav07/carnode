export interface CarQueryInput {
  page: number;
  limit: number;
  sortBy: "createdAt" | "brand" | "model" | "dailyRate";
  sortOrder: "asc" | "desc";
  brand?: string;
  category?: string;
  status?: string;
  minYear?: number;
  maxYear?: number;
  model?: string;
  year?: number;
  dailyRate?: string;
}
