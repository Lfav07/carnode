import z from "zod";

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(20),

  sortBy: z.enum(["createdAt", "email"]).default("createdAt"),

  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type PaginationQueryParams = z.infer<typeof paginationSchema>;

export const searchSchema = z.union([
  z.object({
    email: z.email(),
    keycloakId: z.never().optional(),
  }),
  z.object({
    keycloakId: z.string().min(1),
    email: z.never().optional(),
  }),
]);

export type SearchParams = z.infer<typeof searchSchema>;
