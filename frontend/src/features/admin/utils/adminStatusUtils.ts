export type CarStatusVariant = "available" | "rented" | "maintenance" | "deleted" | "default";
export type ReserveStatusVariant = "pending" | "confirmed" | "active" | "completed" | "cancelled";

const CAR_STATUS_MAP: Record<string, CarStatusVariant> = {
  AVAILABLE: "available",
  RENTED: "rented",
  MAINTENANCE: "maintenance",
  DELETED: "deleted",
};

const RESERVE_STATUS_MAP: Record<string, ReserveStatusVariant> = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  ACTIVE: "active",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

export function getCarStatusVariant(status: string): CarStatusVariant {
  return CAR_STATUS_MAP[status] ?? "default";
}

export function getReserveStatusVariant(status: string): ReserveStatusVariant {
  return RESERVE_STATUS_MAP[status] ?? "pending";
}
