import type { Store } from "./Store.js";
import type { CreateStoreInput } from "../dto/request/CreateStoreInput.js";
import type { StoreLocation } from "./StoreLocation.js";

export interface StoreRepository {
  findById(id: string): Promise<Store | null>;
  findByLocation(location: StoreLocation): Promise<Store[]>;
  searchByName(term: string): Promise<Store[]>;
  findAll(): Promise<Store[]>;
  create(input: CreateStoreInput): Promise<Store>;
  updateLocation(id: string, location: StoreLocation): Promise<Store>;
  delete(id: string): Promise<void>;
}
