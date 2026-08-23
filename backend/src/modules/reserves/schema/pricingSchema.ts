import { z } from "zod";

export const pricingSchema = z.object({
  dailyRate: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "must be a decimal with up to 2 decimal places")
    .refine((value) => Number(value) > 0, { message: "must be positive" }),
  days: z.number().int().positive(),
  subtotal: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "must be a decimal with up to 2 decimal places")
    .refine((value) => Number(value) > 0, { message: "must be positive" }),
});

export type PricingRequest = z.infer<typeof pricingSchema>;
