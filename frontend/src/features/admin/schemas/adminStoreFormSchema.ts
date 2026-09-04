import { z } from "zod";

export const adminStoreFormSchema = z.object({
  locationName: z.string().min(1, "Store name is required").max(100),
  locationCity: z.string().min(1, "City is required").max(100),
});

export type AdminStoreFormValues = z.infer<typeof adminStoreFormSchema>;
