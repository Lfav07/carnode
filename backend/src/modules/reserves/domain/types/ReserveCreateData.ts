import type { Pickup } from "./Pickup.js";
import type { ReturnInfo } from "./ReturnInfo.js";

export interface ReserveCreateData {
  userId: string;
  carId: string;
  pickup: Pickup;
  returnInfo: ReturnInfo;
}
