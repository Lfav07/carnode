import { z } from "zod";

export const adminUpdateEmailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export type AdminUpdateEmailValues = z.infer<typeof adminUpdateEmailSchema>;

export const adminChangePasswordSchema = z.object({
  password: z.string().min(5, "Password must be at least 5 characters"),
});

export type AdminChangePasswordValues = z.infer<typeof adminChangePasswordSchema>;
