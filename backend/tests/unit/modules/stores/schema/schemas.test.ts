import { describe, expect, it } from "vitest";
import { createStoreSchema } from "../../../../../src/modules/stores/schema/CreateStoreSchema.js";
import { storeIdParamsSchema } from "../../../../../src/modules/stores/schema/StoreIdParamsSchema.js";
import { storeQuerySchema } from "../../../../../src/modules/stores/schema/StoreQuerySchema.js";
import { updateLocationSchema } from "../../../../../src/modules/stores/schema/UpdateLocationSchema.js";

describe("createStoreSchema", () => {
  it("should accept valid location object", () => {
    const result = createStoreSchema.safeParse({
      location: { name: "Store A", city: "São Paulo" },
    });
    expect(result.success).toBe(true);
  });

  it("should reject empty location name", () => {
    const result = createStoreSchema.safeParse({
      location: { name: "", city: "São Paulo" },
    });
    expect(result.success).toBe(false);
  });

  it("should reject empty location city", () => {
    const result = createStoreSchema.safeParse({
      location: { name: "Store A", city: "" },
    });
    expect(result.success).toBe(false);
  });

  it("should reject location name > 100 chars", () => {
    const result = createStoreSchema.safeParse({
      location: { name: "a".repeat(101), city: "São Paulo" },
    });
    expect(result.success).toBe(false);
  });

  it("should reject location city > 100 chars", () => {
    const result = createStoreSchema.safeParse({
      location: { name: "Store A", city: "a".repeat(101) },
    });
    expect(result.success).toBe(false);
  });

  it("should reject missing location", () => {
    const result = createStoreSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("should reject string location", () => {
    const result = createStoreSchema.safeParse({ location: "São Paulo" });
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
  it("should accept optional location.city", () => {
    const result = storeQuerySchema.safeParse({
      "location.city": "São Paulo",
    });
    expect(result.success).toBe(true);
  });

  it("should accept optional location.name", () => {
    const result = storeQuerySchema.safeParse({
      "location.name": "Store A",
    });
    expect(result.success).toBe(true);
  });

  it("should accept both location.city and location.name", () => {
    const result = storeQuerySchema.safeParse({
      "location.city": "São Paulo",
      "location.name": "Store A",
    });
    expect(result.success).toBe(true);
  });

  it("should accept empty query", () => {
    const result = storeQuerySchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("should reject location.city > 100 chars", () => {
    const result = storeQuerySchema.safeParse({
      "location.city": "a".repeat(101),
    });
    expect(result.success).toBe(false);
  });

  it("should reject location.name > 100 chars", () => {
    const result = storeQuerySchema.safeParse({
      "location.name": "a".repeat(101),
    });
    expect(result.success).toBe(false);
  });
});

describe("updateLocationSchema", () => {
  it("should accept valid location object", () => {
    const result = updateLocationSchema.safeParse({
      location: { name: "Store A", city: "São Paulo" },
    });
    expect(result.success).toBe(true);
  });

  it("should reject empty location name", () => {
    const result = updateLocationSchema.safeParse({
      location: { name: "", city: "São Paulo" },
    });
    expect(result.success).toBe(false);
  });

  it("should reject empty location city", () => {
    const result = updateLocationSchema.safeParse({
      location: { name: "Store A", city: "" },
    });
    expect(result.success).toBe(false);
  });

  it("should reject missing location", () => {
    const result = updateLocationSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("should reject string location", () => {
    const result = updateLocationSchema.safeParse({ location: "São Paulo" });
    expect(result.success).toBe(false);
  });
});
