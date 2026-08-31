import { z } from "zod";
import { RESERVE_STATUSES } from "../domain/ReserveStatus.js";

export const reserveQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z
    .enum(["createdAt", "pickup.date", "returnInfo.date", "status"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  userId: z.string().min(1).optional(),
  carId: z.string().min(1).optional(),
  status: z.enum(RESERVE_STATUSES).optional(),
  pickupDateFrom: z.coerce.date().optional(),
  pickupDateTo: z.coerce.date().optional(),
  returnDateFrom: z.coerce.date().optional(),
  returnDateTo: z.coerce.date().optional(),
});

export type ReserveQueryParams = z.infer<typeof reserveQuerySchema>;
