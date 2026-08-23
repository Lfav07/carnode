export type ReserveStatus = "PENDING" | "CONFIRMED" | "ACTIVE" | "COMPLETED" | "CANCELLED";
export const RESERVE_STATUSES = ["PENDING", "CONFIRMED", "ACTIVE", "COMPLETED", "CANCELLED"] as const;
