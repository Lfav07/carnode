import type { StoreLookupService } from "../../../../src/modules/reserves/domain/ports/StoreLookupService.js";
import type { StoreResponseDto } from "../../../../src/modules/stores/dto/response/StoreResponseDto.js";

export interface MockStoreLookupServiceState {
  stores: Map<string, StoreResponseDto>;
}

export interface MockStoreLookupServiceFactory {
  create(
    initialStores?: StoreResponseDto[],
  ): StoreLookupService & MockStoreLookupServiceState;
}

export const createMockStoreLookupServiceFactory =
  (): MockStoreLookupServiceFactory => ({
    create(initialStores = []) {
      const stores = new Map<string, StoreResponseDto>();

      for (const store of initialStores) {
        stores.set(store.id, store);
      }

      return {
        stores,

        async getStoreById(storeId: string): Promise<StoreResponseDto> {
          const store = stores.get(storeId);
          if (!store) {
            throw new Error(`Store '${storeId}' not found`);
          }
          return store;
        },
      };
    },
  });
