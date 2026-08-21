import type { User } from "../../domain/User.js";
import type { CreateUserInput } from "../../dto/request/CreateUserInput.js";
import type { UserDocument } from "./UserDocument.js";

export class UserDocumentMapper {
  static toDomain(doc: UserDocument): User {
    if (!doc._id) {
      throw new Error("Cannot map UserDocument to User: missing _id");
    }
    return {
      id: doc._id.toHexString(),
      email: doc.email,
      keycloakId: doc.keycloak_id,
      createdAt: doc.created_at,
      updatedAt: doc.updated_at,
    };
  }

  static toDocument(user: User): UserDocument {
    return {
      email: user.email,
      keycloak_id: user.keycloakId,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    };
  }

  static toDocumentFromInput(input: CreateUserInput): UserDocument {
    const now = new Date();
    return {
      keycloak_id: input.keycloakId,
      email: input.email,
      created_at: now,
      updated_at: now,
    };
  }
}
