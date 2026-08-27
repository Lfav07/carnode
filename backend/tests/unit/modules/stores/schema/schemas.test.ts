import { describe, expect, it } from "vitest";
import { createStoreSchema } from "../../../../../src/modules/stores/schema/CreateStoreSchema.js";
import { storeIdParamsSchema } from "../../../../../src/modules/stores/schema/StoreIdParamsSchema.js";
import { storeQuerySchema } from "../../../../../src/modules/stores/schema/StoreQuerySchema.js";
import { updateLocationSchema } from "../../../../../src/modules/stores/schema/UpdateLocationSchema.js";

describe("createStoreSchema", () => {
  it("should accept valid location", () => {
    const result = createStoreSchema.safeParse({
      location: "São Paulo - SP",
    });
    expect(result.success).toBe(true);
  });

  it("should reject empty location", () => {
    const result = createStoreSchema.safeParse({ location: "" });
    expect(result.success).toBe(false);
  });

  it("should reject location > 200 chars", () => {
    const result = createStoreSchema.safeParse({
      location: "a".repeat(201),
    });
    expect(result.success).toBe(false);
  });
});

describe("storeIdParamsSchema", () => {
  it("should accept valid 24-char id", () => {
    const result = storeIdParamsSchema.safeParse({
      id: "507f1f77bcf86cd799439011",
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid id length", () => {
    const result = storeIdParamsSchema.safeParse({ id: "short" });
    expect(result.success).toBe(false);
  });
});

describe("storeQuerySchema", () => {
  it("should accept optional location", () => {
    const result = storeQuerySchema.safeParse({
      location: "São Paulo - SP",
    });
    expect(result.success).toBe(true);
  });

  it("should accept empty query", () => {
    const result = storeQuerySchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("should reject location > 200 chars", () => {
    const result = storeQuerySchema.safeParse({
      location: "a".repeat(201),
    });
    expect(result.success).toBe(false);
  });
});

describe("updateLocationSchema", () => {
  it("should accept valid location", () => {
    const result = updateLocationSchema.safeParse({
      location: "São Paulo - SP",
    });
    expect(result.success).toBe(true);
  });

  it("should reject empty location", () => {
    const result = updateLocationSchema.safeParse({ location: "" });
    expect(result.success).toBe(false);
  });
});
