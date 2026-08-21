import { z } from "zod";

export const createStoreSchema = z.object({
  location: z.string().min(1).max(200),
});

export type CreateStoreRequest = z.infer<typeof createStoreSchema>;
