import { z } from "zod";

export const storeSearchSchema = z.object({
  q: z.string().min(1).max(100),
});

export type StoreSearchParams = z.infer<typeof storeSearchSchema>;
