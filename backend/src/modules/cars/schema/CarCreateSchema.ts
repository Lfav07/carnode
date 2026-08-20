import { z } from "zod";

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

export const CAR_CATEGORIES = [
  "ECONOMY",
  "COMPACT",
  "SUV",
  "LUXURY",
  "PICKUP",
  "VAN",
] as const;

export const CAR_STATUSES = [
  "AVAILABLE",
  "RENTED",
  "MAINTENANCE",
  "DELETED",
] as const;

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
  dailyRate: z.number().positive().multipleOf(0.01),
});

export type CarCreateRequest = z.infer<typeof carCreateSchema>;
