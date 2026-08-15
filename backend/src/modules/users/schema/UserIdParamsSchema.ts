
import { z } from "zod";

export const userIdParamsSchema = z.object({
  id: z.string().min(1),
});

export type UserIdParams = z.infer<typeof userIdParamsSchema>;