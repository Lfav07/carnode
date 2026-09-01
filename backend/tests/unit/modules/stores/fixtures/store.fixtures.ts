import type { Store } from "../../../../../src/modules/stores/domain/Store.js";
import type { StoreResponseDto } from "../../../../../src/modules/stores/dto/response/StoreResponseDto.js";
import type { StoreDocument } from "../../../../../src/modules/stores/infrastructure/mongodb/StoreDocument.js";

export const DUMMY_STORE: Store = {
  id: "507f1f77bcf86cd799439011",
  location: { name: "Store A", city: "São Paulo" },
};

export const DUMMY_STORE_RESPONSE: StoreResponseDto = {
  id: "507f1f77bcf86cd799439011",
  location: { name: "Store A", city: "São Paulo" },
};

export const DUMMY_STORE_DOCUMENT: StoreDocument = {
  _id: {
    toHexString: () => "507f1f77bcf86cd799439011",
  } as unknown as import("mongodb").ObjectId,
  location: { name: "Store A", city: "São Paulo" },
};

export const DUMMY_STORES: Store[] = [
  DUMMY_STORE,
  {
    id: "507f1f77bcf86cd799439012",
    location: { name: "Store B", city: "Rio de Janeiro" },
  },
];
