import { z } from "zod";
import { CAR_BRANDS } from "../domain/CarBrands.js";
import { CAR_CATEGORIES } from "../domain/CarCategories.js";

export const carUpdateSchema = z
  .object({
    brand: z.enum(CAR_BRANDS).optional(),
    model: z.string().min(1).max(100).optional(),
    year: z
      .number()
      .int()
      .min(1900)
      .max(new Date().getFullYear() + 1)
      .optional(),
    category: z.enum(CAR_CATEGORIES).optional(),
    plate: z
      .string()
      .min(7)
      .max(8)
      .regex(/^[A-Z0-9]+$/)
      .optional(),
    dailyRate: z
      .string()
      .regex(
        /^\d+(\.\d{1,2})?$/,
        "must be a decimal with up to 2 decimal places",
      )
      .refine((value) => Number(value) > 0, { message: "must be positive" })
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (Object.keys(data).length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "At least one field must be provided",
      });
    }
  });

export type CarUpdateRequest = z.infer<typeof carUpdateSchema>;
