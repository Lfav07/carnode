import type { Pickup } from "./Pickup.js";
import type { ReturnInfo } from "./ReturnInfo.js";

export interface ReserveUpdateData {
  pickup?: Pickup;
  returnInfo?: ReturnInfo;
}
