import type { ReserveStatus } from "../../domain/ReserveStatus.js";
import type { Pickup } from "../../domain/types/Pickup.js";
import type { ReturnInfo } from "../../domain/types/ReturnInfo.js";
import type { Pricing } from "../../domain/types/Pricing.js";

export interface UserReserveResponseDto {
  id: string;
  carId: string;
  pickup: Pickup;
  returnInfo: ReturnInfo;
  status: ReserveStatus;
  pricing: Pricing;
  createdAt: string;
  updatedAt: string;
}
