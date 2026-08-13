import {z} from "zod"
export const currentUserResponseSchema = z.object({
    email: z.email(),
})