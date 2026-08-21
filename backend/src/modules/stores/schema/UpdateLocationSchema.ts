import { z } from "zod";

export const updateLocationSchema = z.object({
  location: z.string().min(1).max(200),
});

export type UpdateLocationRequest = z.infer<typeof updateLocationSchema>;
