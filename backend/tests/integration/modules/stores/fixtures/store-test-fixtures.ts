import type { Store } from "../../../../../src/modules/stores/domain/Store.js";
import type { StoreLocation } from "../../../../../src/modules/stores/domain/StoreLocation.js";

export interface CreateStoreFixtureInput {
  readonly location: StoreLocation;
}

export interface StoreFixture extends Store {}

export interface AuthenticatedUserFixture {
  readonly sub: string;
  readonly roles: readonly string[];
}

export const TEST_ROLES = {
  ADMIN: "admin",
  USER: "user",
} as const;
