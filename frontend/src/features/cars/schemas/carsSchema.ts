import z from "zod";

export const CAR_CATEGORIES = [
  "ECONOMY",
  "COMPACT",
  "SUV",
  "LUXURY",
  "PICKUP",
  "VAN",
] as const;

export const CAR_BRANDS = [
  "TOYOTA",
  "HONDA",
  "HYUNDAI",
  "CHEVROLET",
  "VOLKSWAGEN",
  "FORD",
  "NISSAN",
  "RENAULT",
  "FIAT",
  "JEEP",
  "PEUGEOT",
  "CITROEN",
  "MITSUBISHI",
  "SUBARU",
  "KIA",
  "SUZUKI",
  "MAZDA",
  "BMW",
  "MERCEDES_BENZ",
  "AUDI",
  "VOLVO",
  "LEXUS",
  "LAND_ROVER",
  "PORSCHE",
  "TESLA",
] as const;

export const CAR_STATUSES = [
  "AVAILABLE",
  "RENTED",
  "MAINTENANCE",
  "DELETED",
] as const;

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

  model: z.string().trim().min(1).max(100).optional(),

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
    .regex(/^\d+(\.\d{1,2})?$/)
    .optional(),

  plate: z
    .string()
    .trim()
    .toUpperCase()
    .min(7)
    .max(8)
    .regex(/^[A-Z0-9]+$/)
    .optional(),
});
export type CarQueryParams = z.infer<typeof carQuerySchema>;
