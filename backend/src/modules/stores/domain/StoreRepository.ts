import type { Store } from "./Store.js";
import type { CreateStoreInput } from "../dto/request/CreateStoreInput.js";

export interface StoreRepository {
  findById(id: string): Promise<Store | null>;
  findByLocation(location: string): Promise<Store[]>;
  findAll(): Promise<Store[]>;
  create(input: CreateStoreInput): Promise<Store>;
  updateLocation(id: string, location: string): Promise<Store>;
  delete(id: string): Promise<void>;
}
