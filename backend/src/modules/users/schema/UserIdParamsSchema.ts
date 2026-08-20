
import { z } from "zod";

export const userIdParamsSchema = z.object({
  id: z.string().regex(/^[0-9a-f]{24}$/i, "Invalid ObjectId"),
});

export type UserIdParams = z.infer<typeof userIdParamsSchema>;