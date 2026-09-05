import { z } from "zod";
import { CAR_BRANDS } from "../domain/CarBrands.js";
import { CAR_CATEGORIES } from "../domain/CarCategories.js";
import { CAR_STATUSES } from "../domain/CarStatus.js";

export const carQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z
    .enum(["createdAt", "brand", "model", "dailyRate"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  id: z.string().min(24).max(24).optional(),
  brand: z.enum(CAR_BRANDS).optional(),
  category: z.enum(CAR_CATEGORIES).optional(),
  status: z.enum(CAR_STATUSES).optional(),
  model: z.string().min(1).max(100).optional(),
  year: z.coerce
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear() + 1)
    .optional(),
  minYear: z.coerce.number().int().min(1900).optional(),
  maxYear: z.coerce
    .number()
    .int()
    .max(new Date().getFullYear() + 1)
    .optional(),
  dailyRate: z
    .string()
    .regex(
      /^\d+(\.\d{1,2})?$/,
      "must be a decimal with up to 2 decimal places",
    )
    .optional(),
  plate: z.string().min(7).max(8).regex(/^[A-Z0-9]+$/).optional(),
}).refine(
  (data) =>
    !(data.year !== undefined && (data.minYear !== undefined || data.maxYear !== undefined)),
  {
    message: "Cannot use 'year' together with 'minYear' or 'maxYear'",
  },
);

export type CarQueryParams = z.infer<typeof carQuerySchema>;
