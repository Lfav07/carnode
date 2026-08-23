import type { ReserveStatus } from "../ReserveStatus.js";

export interface ReserveQueryData {
  page: number;
  limit: number;
  sortBy: "createdAt" | "pickup.date" | "returnInfo.date" | "status";
  sortOrder: "asc" | "desc";
  userId?: string | undefined;
  carId?: string | undefined;
  status?: ReserveStatus | undefined;
  pickupDateFrom?: Date | undefined;
  pickupDateTo?: Date | undefined;
  returnDateFrom?: Date | undefined;
  returnDateTo?: Date | undefined;
}
