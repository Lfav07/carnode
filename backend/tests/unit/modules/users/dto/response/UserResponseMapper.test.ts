import { describe, expect, it } from "vitest";
import { UserResponseMapper } from "../../../../../../src/modules/users/dto/response/UserResponseMapper.js";
import type { User } from "../../../../../../src/modules/users/domain/User.js";

const DUMMY_USER: User = {
  id: "507f1f77bcf86cd799439011",
  email: "test@example.com",
  keycloakId: "kc-uuid-1234",
  createdAt: new Date("2025-01-01T00:00:00.000Z"),
  updatedAt: new Date("2025-06-01T00:00:00.000Z"),
};

describe("UserResponseMapper", () => {
  describe("toResponse", () => {
    it("should map User to UserResponseDto", () => {
      const result = UserResponseMapper.toResponse(DUMMY_USER);

      expect(result).toEqual({
        id: DUMMY_USER.id,
        email: DUMMY_USER.email,
        keycloakId: DUMMY_USER.keycloakId,
        createdAt: DUMMY_USER.createdAt,
        updatedAt: DUMMY_USER.updatedAt,
      });
    });
  });

  describe("toCurrentUserResponse", () => {
    it("should map User to CurrentUserResponseDto with email only", () => {
      const result = UserResponseMapper.toCurrentUserResponse(DUMMY_USER);

      expect(result).toEqual({ email: DUMMY_USER.email });
    });
  });
});
