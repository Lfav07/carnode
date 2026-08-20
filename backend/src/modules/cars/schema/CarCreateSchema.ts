import { z } from "zod";
import { CAR_BRANDS } from "../domain/CarBrands.js";
import { CAR_CATEGORIES } from "../domain/CarCategories.js";

export const carCreateSchema = z.object({
  brand: z.enum(CAR_BRANDS),
  model: z.string().min(1).max(100),
  year: z
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear() + 1),
  category: z.enum(CAR_CATEGORIES),
  plate: z
    .string()
    .min(7)
    .max(8)
    .regex(/^[A-Z0-9]+$/),
  dailyRate: z
    .string()
    .regex(
      /^\d+(\.\d{1,2})?$/,
      "must be a decimal with up to 2 decimal places",
    )
    .refine((value) => Number(value) > 0, { message: "must be positive" }),
});

export type CarCreateRequest = z.infer<typeof carCreateSchema>;
