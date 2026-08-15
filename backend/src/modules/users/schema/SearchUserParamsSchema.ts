import z from "zod";

const searchByEmailSchema = z.object({
  email: z.email(),
  keycloakId: z.never().optional(),
});

const searchByKeycloakIdSchema = z.object({
  keycloakId: z.string().min(1),
  email: z.never().optional(),
});

export const searchSchema = z.xor([
  searchByEmailSchema,
  searchByKeycloakIdSchema,
]);
export type SearchParams = z.infer<typeof searchSchema>;