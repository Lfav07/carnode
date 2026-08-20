export type CarStatus = "AVAILABLE" | "RENTED" | "MAINTENANCE" | "DELETED";

export const VALID_STATUS_TRANSITIONS: Record<CarStatus, readonly CarStatus[]> =
  {
    AVAILABLE: ["RENTED", "MAINTENANCE"],
    RENTED: ["AVAILABLE"],
    MAINTENANCE: ["AVAILABLE"],
    DELETED: [],
  };
