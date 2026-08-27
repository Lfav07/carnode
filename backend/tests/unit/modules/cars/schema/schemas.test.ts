import { describe, expect, it } from "vitest";
import { carCreateSchema } from "../../../../../src/modules/cars/schema/CarCreateSchema.js";
import { carUpdateSchema } from "../../../../../src/modules/cars/schema/CarUpdateSchema.js";
import { carQuerySchema } from "../../../../../src/modules/cars/schema/CarQuerySchema.js";
import { carStatusUpdateSchema } from "../../../../../src/modules/cars/schema/CarStatusUpdateSchema.js";
import { carIdParamsSchema } from "../../../../../src/modules/cars/schema/CarIdParamsSchema.js";
import { carPlateParamsSchema } from "../../../../../src/modules/cars/schema/CarPlateParamsSchema.js";

const validCreateInput = {
  brand: "TOYOTA",
  model: "Corolla",
  year: 2023,
  category: "ECONOMY",
  plate: "ABC1234",
  dailyRate: "150.00",
};

describe("carCreateSchema", () => {
  it("should accept valid input", () => {
    const result = carCreateSchema.safeParse(validCreateInput);
    expect(result.success).toBe(true);
  });

  it("should reject missing required field", () => {
    const { brand, ...input } = validCreateInput;
    const result = carCreateSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("should reject invalid brand", () => {
    const result = carCreateSchema.safeParse({
      ...validCreateInput,
      brand: "INVALID",
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid category", () => {
    const result = carCreateSchema.safeParse({
      ...validCreateInput,
      category: "INVALID",
    });
    expect(result.success).toBe(false);
  });

  it("should reject plate too short", () => {
    const result = carCreateSchema.safeParse({
      ...validCreateInput,
      plate: "ABC",
    });
    expect(result.success).toBe(false);
  });

  it("should reject plate with lowercase", () => {
    const result = carCreateSchema.safeParse({
      ...validCreateInput,
      plate: "abc1234",
    });
    expect(result.success).toBe(false);
  });

  it("should reject negative dailyRate", () => {
    const result = carCreateSchema.safeParse({
      ...validCreateInput,
      dailyRate: "-10",
    });
    expect(result.success).toBe(false);
  });

  it("should reject zero dailyRate", () => {
    const result = carCreateSchema.safeParse({
      ...validCreateInput,
      dailyRate: "0",
    });
    expect(result.success).toBe(false);
  });

  it("should accept decimal dailyRate", () => {
    const result = carCreateSchema.safeParse({
      ...validCreateInput,
      dailyRate: "10.50",
    });
    expect(result.success).toBe(true);
  });
});

describe("carUpdateSchema", () => {
  it("should accept valid partial input", () => {
    const result = carUpdateSchema.safeParse({ brand: "TOYOTA" });
    expect(result.success).toBe(true);
  });

  it("should reject empty object", () => {
    const result = carUpdateSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("should accept multiple fields", () => {
    const result = carUpdateSchema.safeParse({
      brand: "HONDA",
      model: "Civic",
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid brand", () => {
    const result = carUpdateSchema.safeParse({ brand: "INVALID" });
    expect(result.success).toBe(false);
  });
});

describe("carQuerySchema", () => {
  it("should apply defaults", () => {
    const result = carQuerySchema.safeParse({});
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

  it("should accept valid filters", () => {
    const result = carQuerySchema.safeParse({
      brand: "TOYOTA",
      status: "AVAILABLE",
    });
    expect(result.success).toBe(true);
  });

  it("should reject year with minYear", () => {
    const result = carQuerySchema.safeParse({
      year: 2020,
      minYear: 2019,
    });
    expect(result.success).toBe(false);
  });

  it("should reject year with maxYear", () => {
    const result = carQuerySchema.safeParse({
      year: 2020,
      maxYear: 2021,
    });
    expect(result.success).toBe(false);
  });

  it("should reject limit > 100", () => {
    const result = carQuerySchema.safeParse({ limit: 200 });
    expect(result.success).toBe(false);
  });
});

describe("carStatusUpdateSchema", () => {
  it("should accept valid status", () => {
    const result = carStatusUpdateSchema.safeParse({ status: "AVAILABLE" });
    expect(result.success).toBe(true);
  });

  it("should reject DELETED", () => {
    const result = carStatusUpdateSchema.safeParse({ status: "DELETED" });
    expect(result.success).toBe(false);
  });

  it("should reject invalid status", () => {
    const result = carStatusUpdateSchema.safeParse({ status: "INVALID" });
    expect(result.success).toBe(false);
  });
});

describe("carIdParamsSchema", () => {
  it("should accept valid ObjectId", () => {
    const result = carIdParamsSchema.safeParse({
      id: "507f1f77bcf86cd799439011",
    });
    expect(result.success).toBe(true);
  });

  it("should reject short id", () => {
    const result = carIdParamsSchema.safeParse({ id: "abc" });
    expect(result.success).toBe(false);
  });
});

describe("carPlateParamsSchema", () => {
  it("should accept valid plate", () => {
    const result = carPlateParamsSchema.safeParse({ plate: "ABC1234" });
    expect(result.success).toBe(true);
  });

  it("should reject invalid plate", () => {
    const result = carPlateParamsSchema.safeParse({ plate: "abc" });
    expect(result.success).toBe(false);
  });
});
