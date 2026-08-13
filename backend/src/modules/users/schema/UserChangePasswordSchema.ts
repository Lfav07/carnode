import z from "zod";

export const userChangePassworsSchema = z.object({
    currentPassword: z.string().min(5),
    newPassword: z.string().min(5)
})