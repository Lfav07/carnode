import { z } from "zod";

export const returnSchema = z.object({
  date: z.coerce.date(),
  storeId: z.string().min(1),
});

export type ReturnRequest = z.infer<typeof returnSchema>;
