import type { Store } from "../../domain/Store.js";
import type { StoreResponseDto } from "./StoreResponseDto.js";

export class StoreResponseMapper {
  static toResponse(store: Store): StoreResponseDto {
    return {
      id: store.id,
      location: store.location,
    };
  }
}
