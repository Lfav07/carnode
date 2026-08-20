import { z } from "zod";
import { CAR_BRANDS, CAR_CATEGORIES, CAR_STATUSES } from "./CarCreateSchema.js";

export const carUpdateSchema = z.object({
  brand: z.enum(CAR_BRANDS).optional(),
  model: z.string().min(1).max(100).optional(),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
  category: z.enum(CAR_CATEGORIES).optional(),
  plate: z.string().min(7).max(8).regex(/^[A-Z0-9]+$/).optional(),
  dailyRate: z.number().positive().multipleOf(0.01).optional(),
  status: z.enum(CAR_STATUSES).optional(),
});

export type CarUpdateRequest = z.infer<typeof carUpdateSchema>;
