import type { Reserve } from "./Reserve.js";
import type { PaginatedResult } from "../../shared/pagination/PaginatedResult.js";
import type { ReserveCreateData } from "./types/ReserveCreateData.js";
import type { ReserveUpdateData } from "./types/ReserveUpdateData.js";
import type { ReserveStatus } from "./ReserveStatus.js";
import type { ReserveQueryData } from "./types/ReserveQueryData.js";

export interface ReserveRepository {
  findById(id: string): Promise<Reserve | null>;
  findByUserId(userId: string): Promise<Reserve[]>;
  findPaginated(input: ReserveQueryData): Promise<PaginatedResult<Reserve>>;
  create(input: ReserveCreateData): Promise<Reserve>;
  update(id: string, input: ReserveUpdateData): Promise<Reserve>;
  updateStatus(id: string, status: ReserveStatus): Promise<Reserve>;

  existsOverlappingReservation(
    carId: string,
    pickupDate: Date,
    returnDate: Date,
  ): Promise<boolean>;
}
