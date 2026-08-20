import { z } from "zod";
import { CAR_CATEGORIES } from "../domain/CarCategories.js";
import { CAR_BRANDS } from "../domain/CarBrands.js";
import { CAR_STATUSES } from "../domain/CarStatus.js";

export const carQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z
    .enum(["createdAt", "brand", "model", "dailyRate"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  brand: z.enum(CAR_BRANDS).optional(),
  category: z.enum(CAR_CATEGORIES).optional(),
  status: z.enum(CAR_STATUSES).optional(),
  minYear: z.coerce.number().int().min(1900).optional(),
  maxYear: z.coerce
    .number()
    .int()
    .max(new Date().getFullYear() + 1)
    .optional(),
});

export type CarQueryParams = z.infer<typeof carQuerySchema>;
