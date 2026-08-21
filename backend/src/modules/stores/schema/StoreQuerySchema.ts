import { z } from "zod";

export const storeQuerySchema = z.object({
  location: z.string().min(1).max(200).optional(),
});

export type StoreQueryParams = z.infer<typeof storeQuerySchema>;
