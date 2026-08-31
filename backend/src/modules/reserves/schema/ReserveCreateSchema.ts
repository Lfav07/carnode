import { z } from "zod";
import { pickupSchema } from "./PickupSchema.js";
import { returnSchema } from "./ReturnSchema.js";

export const reserveCreateSchema = z.object({
  userId: z.string().min(1),
  carId: z.string().min(1),
  pickup: pickupSchema,
  returnInfo: returnSchema,
});

export type ReserveCreateRequest = z.infer<typeof reserveCreateSchema>;
