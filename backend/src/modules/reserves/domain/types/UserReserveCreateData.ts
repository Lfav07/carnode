import type { Pickup } from "./Pickup.js";
import type { ReturnInfo } from "./ReturnInfo.js";

export interface UserReserveCreateData {
  carId: string;
  pickup: Pickup;
  returnInfo: ReturnInfo;
}
