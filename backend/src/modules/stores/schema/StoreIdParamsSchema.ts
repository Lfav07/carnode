import { z } from "zod";

export const storeIdParamsSchema = z.object({
  id: z.string().length(24),
});

export type StoreIdParams = z.infer<typeof storeIdParamsSchema>;
