import { describe, expect, it } from "vitest";
import { pickupSchema } from "../../../../../src/modules/reserves/schema/PickupSchema.js";
import { returnSchema } from "../../../../../src/modules/reserves/schema/ReturnSchema.js";
import { pricingSchema } from "../../../../../src/modules/reserves/schema/pricingSchema.js";
import { reserveCreateSchema } from "../../../../../src/modules/reserves/schema/ReserveCreateSchema.js";
import { userReserveCreateSchema } from "../../../../../src/modules/reserves/schema/userReserveCreateSchema.js";
import { reserveUpdateSchema } from "../../../../../src/modules/reserves/schema/ReserveUpdateSchema.js";
import { reserveQuerySchema } from "../../../../../src/modules/reserves/schema/ReserveQuerySchema.js";
import { reserveIdParamsSchema } from "../../../../../src/modules/reserves/schema/ReserveIdParamsSchema.js";
import { reserveStatusUpdateSchema } from "../../../../../src/modules/reserves/schema/ReserveStatusUpdateSchema.js";

describe("pickupSchema", () => {
  it("should accept valid input", () => {
    const result = pickupSchema.safeParse({
      date: "2025-01-01",
      storeId: "abc123",
    });
    expect(result.success).toBe(true);
  });

  it("should reject missing storeId", () => {
    const result = pickupSchema.safeParse({ date: "2025-01-01" });
    expect(result.success).toBe(false);
  });

  it("should reject empty string storeId", () => {
    const result = pickupSchema.safeParse({ date: "2025-01-01", storeId: "" });
    expect(result.success).toBe(false);
  });
});

describe("returnSchema", () => {
  it("should accept valid input", () => {
    const result = returnSchema.safeParse({
      date: "2025-01-05",
      storeId: "abc123",
    });
    expect(result.success).toBe(true);
  });

  it("should reject missing storeId", () => {
    const result = returnSchema.safeParse({ date: "2025-01-05" });
    expect(result.success).toBe(false);
  });

  it("should reject empty string storeId", () => {
    const result = returnSchema.safeParse({ date: "2025-01-05", storeId: "" });
    expect(result.success).toBe(false);
  });
});

describe("pricingSchema", () => {
  it("should accept valid input", () => {
    const result = pricingSchema.safeParse({
      dailyRate: "50.00",
      days: 3,
      subtotal: "150.00",
    });
    expect(result.success).toBe(true);
  });

  it("should reject non-numeric dailyRate string", () => {
    const result = pricingSchema.safeParse({
      dailyRate: "abc",
      days: 3,
      subtotal: "150.00",
    });
    expect(result.success).toBe(false);
  });

  it("should reject zero days", () => {
    const result = pricingSchema.safeParse({
      dailyRate: "50.00",
      days: 0,
      subtotal: "150.00",
    });
    expect(result.success).toBe(false);
  });

  it("should reject negative days", () => {
    const result = pricingSchema.safeParse({
      dailyRate: "50.00",
      days: -1,
      subtotal: "150.00",
    });
    expect(result.success).toBe(false);
  });

  it("should reject subtotal with more than 2 decimal places", () => {
    const result = pricingSchema.safeParse({
      dailyRate: "50.00",
      days: 3,
      subtotal: "150.000",
    });
    expect(result.success).toBe(false);
  });
});

describe("reserveCreateSchema", () => {
  const validPayload = {
    userId: "user123",
    carId: "car456",
    pickup: { date: "2025-01-01", storeId: "store1" },
    returnInfo: { date: "2025-01-05", storeId: "store1" },
  };

  it("should accept valid input", () => {
    const result = reserveCreateSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("should reject missing userId", () => {
    const { userId: _, ...rest } = validPayload;
    const result = reserveCreateSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("should reject missing carId", () => {
    const { carId: _, ...rest } = validPayload;
    const result = reserveCreateSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("should reject missing pickup", () => {
    const { pickup: _, ...rest } = validPayload;
    const result = reserveCreateSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("should reject missing returnInfo", () => {
    const { returnInfo: _, ...rest } = validPayload;
    const result = reserveCreateSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });
});

describe("userReserveCreateSchema", () => {
  const validPayload = {
    carId: "car456",
    pickup: { date: "2025-01-01", storeId: "store1" },
    returnInfo: { date: "2025-01-05", storeId: "store1" },
  };

  it("should accept valid input", () => {
    const result = userReserveCreateSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("should reject missing carId", () => {
    const { carId: _, ...rest } = validPayload;
    const result = userReserveCreateSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("should reject missing pickup", () => {
    const { pickup: _, ...rest } = validPayload;
    const result = userReserveCreateSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("should reject missing returnInfo", () => {
    const { returnInfo: _, ...rest } = validPayload;
    const result = userReserveCreateSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });
});

describe("reserveUpdateSchema", () => {
  const pickup = { date: "2025-01-01", storeId: "store1" };
  const returnInfo = { date: "2025-01-05", storeId: "store1" };

  it("should accept pickup only", () => {
    const result = reserveUpdateSchema.safeParse({ pickup });
    expect(result.success).toBe(true);
  });

  it("should accept returnInfo only", () => {
    const result = reserveUpdateSchema.safeParse({ returnInfo });
    expect(result.success).toBe(true);
  });

  it("should accept both pickup and returnInfo", () => {
    const result = reserveUpdateSchema.safeParse({ pickup, returnInfo });
    expect(result.success).toBe(true);
  });

  it("should reject empty object", () => {
    const result = reserveUpdateSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("reserveQuerySchema", () => {
  it("should apply defaults", () => {
    const result = reserveQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
      expect(result.data.sortBy).toBe("createdAt");
      expect(result.data.sortOrder).toBe("desc");
    }
  });

  it("should parse custom values", () => {
    const result = reserveQuerySchema.safeParse({
      page: "2",
      limit: "50",
      sortBy: "status",
      sortOrder: "asc",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(50);
      expect(result.data.sortBy).toBe("status");
      expect(result.data.sortOrder).toBe("asc");
    }
  });

  it("should reject limit over 100", () => {
    const result = reserveQuerySchema.safeParse({ limit: "200" });
    expect(result.success).toBe(false);
  });

  it("should parse optional filters", () => {
    const result = reserveQuerySchema.safeParse({
      userId: "user1",
      carId: "car1",
      status: "PENDING",
      pickupDateFrom: "2025-01-01",
      pickupDateTo: "2025-01-31",
      returnDateFrom: "2025-02-01",
      returnDateTo: "2025-02-28",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.userId).toBe("user1");
      expect(result.data.carId).toBe("car1");
      expect(result.data.status).toBe("PENDING");
      expect(result.data.pickupDateFrom).toBeInstanceOf(Date);
      expect(result.data.pickupDateTo).toBeInstanceOf(Date);
      expect(result.data.returnDateFrom).toBeInstanceOf(Date);
      expect(result.data.returnDateTo).toBeInstanceOf(Date);
    }
  });
});

describe("reserveIdParamsSchema", () => {
  it("should accept valid string id", () => {
    const result = reserveIdParamsSchema.safeParse({ id: "abc123" });
    expect(result.success).toBe(true);
  });

  it("should reject missing id", () => {
    const result = reserveIdParamsSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("should reject empty string id", () => {
    const result = reserveIdParamsSchema.safeParse({ id: "" });
    expect(result.success).toBe(false);
  });
});

describe("reserveStatusUpdateSchema", () => {
  it("should accept PENDING status", () => {
    const result = reserveStatusUpdateSchema.safeParse({ status: "PENDING" });
    expect(result.success).toBe(true);
  });

  it("should accept CONFIRMED status", () => {
    const result = reserveStatusUpdateSchema.safeParse({ status: "CONFIRMED" });
    expect(result.success).toBe(true);
  });

  it("should accept ACTIVE status", () => {
    const result = reserveStatusUpdateSchema.safeParse({ status: "ACTIVE" });
    expect(result.success).toBe(true);
  });

  it("should accept COMPLETED status", () => {
    const result = reserveStatusUpdateSchema.safeParse({ status: "COMPLETED" });
    expect(result.success).toBe(true);
  });

  it("should accept CANCELLED status", () => {
    const result = reserveStatusUpdateSchema.safeParse({ status: "CANCELLED" });
    expect(result.success).toBe(true);
  });

  it("should reject invalid status string", () => {
    const result = reserveStatusUpdateSchema.safeParse({ status: "INVALID" });
    expect(result.success).toBe(false);
  });
});
