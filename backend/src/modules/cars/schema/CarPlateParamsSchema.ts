import { z } from "zod";

export const carPlateParamsSchema = z.object({
  plate: z
    .string()
    .min(7)
    .max(8)
    .regex(/^[A-Z0-9]+$/),
});

export type CarPlateParams = z.infer<typeof carPlateParamsSchema>;
