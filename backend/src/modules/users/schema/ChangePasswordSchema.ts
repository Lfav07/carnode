import {z} from "zod"
export const changePasswordSchema = z.object({
    password: z.string().min(5)
})
