import { describe, expect, it } from "vitest";
import { ObjectId } from "mongodb";
import { UserDocumentMapper } from "../../../../../../src/modules/users/infrastructure/mongodb/UserDocumentMapper.js";

describe("UserDocumentMapper", () => {
  describe("toDomain", () => {
    it("should map UserDocument to User", () => {
      const id = new ObjectId();
      const doc = {
        _id: id,
        email: "test@example.com",
        keycloak_id: "kc-uuid-1234",
        created_at: new Date("2024-01-01"),
        updated_at: new Date("2024-06-01"),
      };

      const result = UserDocumentMapper.toDomain(doc);

      expect(result).toEqual({
        id: id.toHexString(),
        email: "test@example.com",
        keycloakId: "kc-uuid-1234",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-06-01"),
      });
    });

    it("should throw when _id is missing", () => {
      const doc = {
        email: "test@example.com",
        keycloak_id: "kc-uuid-1234",
        created_at: new Date("2024-01-01"),
        updated_at: new Date("2024-06-01"),
      };

      expect(() => UserDocumentMapper.toDomain(doc)).toThrow(
        "Cannot map UserDocument to User: missing _id",
      );
    });
  });

  describe("toDocument", () => {
    it("should map User to UserDocument", () => {
      const user = {
        id: "507f1f77bcf86cd799439011",
        email: "test@example.com",
        keycloakId: "kc-uuid-1234",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-06-01"),
      };

      const result = UserDocumentMapper.toDocument(user);

      expect(result).toEqual({
        email: "test@example.com",
        keycloak_id: "kc-uuid-1234",
        created_at: new Date("2024-01-01"),
        updated_at: new Date("2024-06-01"),
      });
    });
  });

  describe("toDocumentFromInput", () => {
    it("should map CreateUserData to UserDocument", () => {
      const input = {
        keycloakId: "kc-uuid-1234",
        email: "test@example.com",
      };

      const result = UserDocumentMapper.toDocumentFromInput(input);

      expect(result.keycloak_id).toBe("kc-uuid-1234");
      expect(result.email).toBe("test@example.com");
      expect(result.created_at).toBeInstanceOf(Date);
      expect(result.updated_at).toBeInstanceOf(Date);
    });
  });
});
