import type { StoreLocation } from "../../domain/StoreLocation.js";

export interface StoreResponseDto {
  readonly id: string;
  readonly location: StoreLocation;
}
