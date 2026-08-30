import type { Store } from "../../../../../src/modules/stores/domain/Store.js";

export interface CreateStoreFixtureInput {
  readonly location: string;
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
