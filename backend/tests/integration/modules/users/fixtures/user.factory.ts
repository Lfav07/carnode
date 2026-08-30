import { ObjectId } from "mongodb";
import type { User } from "../../../../../src/modules/users/domain/User.js";
import type { CreateUserData } from "../../../../../src/modules/users/domain/types/CreateUserData.js";
import type { UserDocument } from "../../../../../src/modules/users/infrastructure/mongodb/UserDocument.js";

export interface UserFactoryOverrides {
  readonly id?: string;
  readonly email?: string;
  readonly keycloakId?: string;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

export interface CreateUserDataFactoryOverrides {
  readonly email?: string;
  readonly keycloakId?: string;
}

let emailCounter = 0;
let keycloakCounter = 0;

export function randomEmail(): string {
  emailCounter += 1;
  return `testuser${emailCounter}-${Date.now()}@example.com`;
}

export function randomKeycloakId(): string {
  keycloakCounter += 1;
  return `kc-${keycloakCounter}-${crypto.randomUUID()}`;
}

export function buildUser(overrides?: UserFactoryOverrides): User {
  return {
    id: overrides?.id ?? new ObjectId().toHexString(),
    email: overrides?.email ?? randomEmail(),
    keycloakId: overrides?.keycloakId ?? randomKeycloakId(),
    createdAt: overrides?.createdAt ?? new Date(),
    updatedAt: overrides?.updatedAt ?? new Date(),
  };
}

export function buildCreateUserData(
  overrides?: CreateUserDataFactoryOverrides,
): CreateUserData {
  return {
    email: overrides?.email ?? randomEmail(),
    keycloakId: overrides?.keycloakId ?? randomKeycloakId(),
  };
}

export function buildUserDocument(
  overrides?: UserFactoryOverrides & { _id?: ObjectId },
): UserDocument {
  const now = new Date();
  return {
    _id: overrides?._id ?? new ObjectId(),
    email: overrides?.email ?? randomEmail(),
    keycloak_id: overrides?.keycloakId ?? randomKeycloakId(),
    created_at: overrides?.createdAt ?? now,
    updated_at: overrides?.updatedAt ?? now,
  };
}
