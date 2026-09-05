import { z } from "zod";

export const availableCarsQuerySchema = z.object({
  pickupDate: z.string().min(1),
  returnDate: z.string().min(1),
});

export type AvailableCarsQueryParams = z.infer<typeof availableCarsQuerySchema>;
