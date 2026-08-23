import { z } from "zod";
import { pickupSchema } from "./PickupSchema.js";
import { returnSchema } from "./ReturnSchema.js";

export const userReserveCreateSchema = z.object({
  carId: z.string().min(1),
  pickup: pickupSchema,
  returnInfo: returnSchema,
});

export type UserReserveCreateRequest = z.infer<typeof userReserveCreateSchema>;
