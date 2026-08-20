import { z } from "zod";
import { CAR_BRANDS } from "../domain/CarBrands.js";
import { CAR_CATEGORIES } from "../domain/CarCategories.js";
import { CAR_STATUSES } from "../domain/CarStatus.js";

export const carSearchQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    brand: z.enum(CAR_BRANDS).optional(),
    model: z.string().min(1).max(100).optional(),
    year: z.coerce
      .number()
      .int()
      .min(1900)
      .max(new Date().getFullYear() + 1)
      .optional(),
    category: z.enum(CAR_CATEGORIES).optional(),
    status: z.enum(CAR_STATUSES).optional(),
    daily_rate: z.coerce
      .string()
      .regex(
        /^\d+(\.\d{1,2})?$/,
        "must be a decimal with up to 2 decimal places",
      )
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.brand === undefined &&
      data.model === undefined &&
      data.year === undefined &&
      data.category === undefined &&
      data.status === undefined &&
      data.daily_rate === undefined
    ) {
      ctx.addIssue({
        code: "custom",
        message: "At least one filter parameter must be provided",
      });
    }
  });

export type CarSearchQueryParams = z.infer<typeof carSearchQuerySchema>;
