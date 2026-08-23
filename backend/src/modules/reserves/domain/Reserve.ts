import type { ReserveStatus } from "./ReserveStatus.js";
import type { Pickup } from "./types/Pickup.js";
import type { ReturnInfo } from "./types/ReturnInfo.js";
import type { Pricing } from "./types/Pricing.js";

export interface Reserve {
  id: string;
  userId: string;
  carId: string;
  pickup: Pickup;
  returnInfo: ReturnInfo;
  status: ReserveStatus;
  pricing: Pricing;
  createdAt: Date;
  updatedAt: Date;
}
