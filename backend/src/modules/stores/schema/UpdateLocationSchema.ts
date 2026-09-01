import { z } from "zod";

const storeLocationSchema = z.object({
  name: z.string().min(1).max(100),
  city: z.string().min(1).max(100),
});

export const updateLocationSchema = z.object({
  location: storeLocationSchema,
});

export type UpdateLocationRequest = z.infer<typeof updateLocationSchema>;
