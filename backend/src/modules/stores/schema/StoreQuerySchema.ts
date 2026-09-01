import { z } from "zod";

export const storeQuerySchema = z.object({
  "location.city": z.string().min(1).max(100).optional(),
  "location.name": z.string().min(1).max(100).optional(),
});

export type StoreQueryParams = z.infer<typeof storeQuerySchema>;
