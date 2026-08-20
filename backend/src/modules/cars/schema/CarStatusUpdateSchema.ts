import { z } from "zod";
import { OPERATIONAL_CAR_STATUSES } from "../domain/CarStatus.js";

export const carStatusUpdateSchema = z.object({
  status: z.enum(OPERATIONAL_CAR_STATUSES),
});

export type CarStatusUpdateRequest = z.infer<typeof carStatusUpdateSchema>;
