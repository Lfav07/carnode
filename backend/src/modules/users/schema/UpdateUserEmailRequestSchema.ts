import { z } from "zod";

export const updateUserEmailRequestSchema = z.object({
    email: z.email(),
})
export type UpdateUserEmailRequest = z.infer<typeof updateUserEmailRequestSchema>