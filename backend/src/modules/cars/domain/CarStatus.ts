export type CarStatus = "AVAILABLE" | "RENTED" | "MAINTENANCE" | "DELETED";

export const CAR_STATUSES = [
  "AVAILABLE",
  "RENTED",
  "MAINTENANCE",
  "DELETED",
] as const;

export const OPERATIONAL_CAR_STATUSES = [
  "AVAILABLE",
  "RENTED",
  "MAINTENANCE",
] as const;

export const VALID_STATUS_TRANSITIONS: Record<CarStatus, readonly CarStatus[]> =
  {
    AVAILABLE: ["RENTED", "MAINTENANCE", "DELETED"],
    RENTED: ["AVAILABLE"],
    MAINTENANCE: ["AVAILABLE", "DELETED"],
    DELETED: [],
  };
