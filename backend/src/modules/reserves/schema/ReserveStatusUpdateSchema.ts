import { z } from "zod";
import { RESERVE_STATUSES } from "../domain/ReserveStatus.js";

export const reserveStatusUpdateSchema = z.object({
  status: z.enum(RESERVE_STATUSES),
});

export type ReserveStatusUpdateRequest = z.infer<typeof reserveStatusUpdateSchema>;