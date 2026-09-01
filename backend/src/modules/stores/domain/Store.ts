import type { StoreLocation } from "./StoreLocation.js";

export interface Store {
  readonly id: string;
  readonly location: StoreLocation;
}
