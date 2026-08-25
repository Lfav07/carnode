import { z } from "zod";

export const reserveIdParamsSchema = z.object({
  id: z.string().min(1),
});

export type ReserveIdParams = z.infer<typeof reserveIdParamsSchema>;