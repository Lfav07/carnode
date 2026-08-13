import {z} from "zod"
export const UpdateUserEmailRequestSchema = z.object({
    email: z.email(),
})
