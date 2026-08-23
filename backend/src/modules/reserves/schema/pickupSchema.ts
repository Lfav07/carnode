import { z } from "zod";

export const pickupSchema = z.object({
  date: z.coerce.date(),
  storeId: z.string().min(1),
});

export type PickupRequest = z.infer<typeof pickupSchema>;
