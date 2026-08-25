export type ReserveStatus = "PENDING" | "CONFIRMED" | "ACTIVE" | "COMPLETED" | "CANCELLED";
export const RESERVE_STATUSES = ["PENDING", "CONFIRMED", "ACTIVE", "COMPLETED", "CANCELLED"] as const;

export const VALID_STATUS_TRANSITIONS: Record<ReserveStatus, readonly ReserveStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["ACTIVE", "CANCELLED"],
  ACTIVE: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};
