import type { Pickup } from "./Pickup.js";
import type { ReturnInfo } from "./ReturnInfo.js";
import type { Pricing } from "./Pricing.js";

export interface ReserveCreateData {
  userId: string;
  carId: string;
  pickup: Pickup;
  returnInfo: ReturnInfo;
  pricing?: Pricing;
}
