import { describe, expect, it } from "vitest";
import { createUserSchema } from "../../../../../src/modules/users/schema/CreateUserRequestSchema.js";
import { updateUserEmailRequestSchema } from "../../../../../src/modules/users/schema/UpdateUserEmailRequestSchema.js";
import { changePasswordSchema } from "../../../../../src/modules/users/schema/ChangePasswordSchema.js";
import { searchSchema } from "../../../../../src/modules/users/schema/SearchUserParamsSchema.js";
import { userIdParamsSchema } from "../../../../../src/modules/users/schema/UserIdParamsSchema.js";
import { paginationSchema } from "../../../../../src/modules/users/schema/PaginationSchema.js";

describe("createUserSchema", () => {
  it("should parse valid input", () => {
    const result = createUserSchema.safeParse({
      email: "test@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid email", () => {
    const result = createUserSchema.safeParse({
      email: "bad",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("should reject short password", () => {
    const result = createUserSchema.safeParse({
      email: "test@example.com",
      password: "ab",
    });
    expect(result.success).toBe(false);
  });
});

describe("updateUserEmailRequestSchema", () => {
  it("should parse valid input", () => {
    const result = updateUserEmailRequestSchema.safeParse({
      email: "test@example.com",
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid email", () => {
    const result = updateUserEmailRequestSchema.safeParse({ email: "bad" });
    expect(result.success).toBe(false);
  });
});

describe("changePasswordSchema", () => {
  it("should parse valid input", () => {
    const result = changePasswordSchema.safeParse({ password: "12345" });
    expect(result.success).toBe(true);
  });

  it("should reject short password", () => {
    const result = changePasswordSchema.safeParse({ password: "ab" });
    expect(result.success).toBe(false);
  });
});

describe("searchSchema", () => {
  it("should parse email only", () => {
    const result = searchSchema.safeParse({ email: "test@example.com" });
    expect(result.success).toBe(true);
  });

  it("should parse keycloakId only", () => {
    const result = searchSchema.safeParse({ keycloakId: "kc-123" });
    expect(result.success).toBe(true);
  });

  it("should reject both email and keycloakId", () => {
    const result = searchSchema.safeParse({
      email: "test@example.com",
      keycloakId: "kc-123",
    });
    expect(result.success).toBe(false);
  });

  it("should reject neither email nor keycloakId", () => {
    const result = searchSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("userIdParamsSchema", () => {
  it("should parse valid ObjectId", () => {
    const result = userIdParamsSchema.safeParse({
      id: "507f1f77bcf86cd799439011",
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid ObjectId", () => {
    const result = userIdParamsSchema.safeParse({ id: "not-valid" });
    expect(result.success).toBe(false);
  });
});

describe("paginationSchema", () => {
  it("should apply defaults", () => {
    const result = paginationSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        page: 1,
        limit: 20,
        sortBy: "createdAt",
        sortOrder: "desc",
      });
    }
  });

  it("should parse custom values", () => {
    const result = paginationSchema.safeParse({ page: "2", limit: "50" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(50);
    }
  });

  it("should reject limit over max", () => {
    const result = paginationSchema.safeParse({ limit: "200" });
    expect(result.success).toBe(false);
  });
});
