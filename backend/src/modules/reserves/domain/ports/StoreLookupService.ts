import type { StoreResponseDto } from "../../../stores/dto/response/StoreResponseDto.js";

export interface StoreLookupService {
  getStoreById(storeId: string): Promise<StoreResponseDto>;
}
