import { z } from "zod";

export const carIdParamsSchema = z.object({
  id: z.string().length(24),
});

export type CarIdParams = z.infer<typeof carIdParamsSchema>;
