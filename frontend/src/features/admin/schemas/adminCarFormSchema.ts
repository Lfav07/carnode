import { z } from "zod";
import { CAR_BRANDS, CAR_CATEGORIES } from "@/features/cars/schemas/carsSchema";

export const adminCarFormSchema = z.object({
  brand: z.enum(CAR_BRANDS, { required_error: "Brand is required" }),
  model: z.string().min(1, "Model is required").max(100),
  year: z.coerce
    .number()
    .int()
    .min(1900, "Year must be 1900 or later")
    .max(new Date().getFullYear() + 1, "Year cannot be in the far future"),
  category: z.enum(CAR_CATEGORIES, { required_error: "Category is required" }),
  plate: z
    .string()
    .min(7, "Plate must be 7-8 characters")
    .max(8)
    .regex(/^[A-Z0-9]+$/, "Plate must be alphanumeric"),
  dailyRate: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Invalid rate format"),
});

export type AdminCarFormValues = z.infer<typeof adminCarFormSchema>;
