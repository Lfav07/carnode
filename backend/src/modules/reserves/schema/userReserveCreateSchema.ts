import { z } from "zod";
import { pickupSchema } from "./pickupSchema.js";
import { returnSchema } from "./returnSchema.js";

export const userReserveCreateSchema = z.object({
  carId: z.string().min(1),
  pickup: pickupSchema,
  returnInfo: returnSchema,
});

export type UserReserveCreateRequest = z.infer<typeof userReserveCreateSchema>;
