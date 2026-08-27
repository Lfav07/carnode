import { describe, expect, it } from "vitest";
import { Decimal128, ObjectId } from "mongodb";
import { ReserveDocumentMapper } from "../../../../../../src/modules/reserves/infrastructure/mongodb/ReserveDocumentMapper.js";
import type { ReserveDocument } from "../../../../../../src/modules/reserves/infrastructure/mongodb/ReserveDocument.js";
import type { ReserveCreateData } from "../../../../../../src/modules/reserves/domain/types/ReserveCreateData.js";
import type { ReserveUpdateData } from "../../../../../../src/modules/reserves/domain/types/ReserveUpdateData.js";
import type { Pickup } from "../../../../../../src/modules/reserves/domain/types/Pickup.js";
import type { ReturnInfo } from "../../../../../../src/modules/reserves/domain/types/ReturnInfo.js";

const VALID_OBJECT_ID = new ObjectId("507f1f77bcf86cd799439011");
const USER_OBJECT_ID = new ObjectId("507f1f77bcf86cd799439012");
const CAR_OBJECT_ID = new ObjectId("507f1f77bcf86cd799439013");
const STORE_OBJECT_ID = new ObjectId("507f1f77bcf86cd799439014");

function createValidDocument(): ReserveDocument {
  return {
    _id: VALID_OBJECT_ID,
    user_id: USER_OBJECT_ID,
    car_id: CAR_OBJECT_ID,
    pickup_info: {
      date: new Date("2025-01-01T10:00:00.000Z"),
      store_id: STORE_OBJECT_ID,
    },
    return_info: {
      date: new Date("2025-01-05T10:00:00.000Z"),
      store_id: STORE_OBJECT_ID,
    },
    status: "CONFIRMED",
    pricing: {
      daily_rate: Decimal128.fromString("50.00"),
      days: 4,
      subtotal: Decimal128.fromString("200.00"),
    },
    created_at: new Date("2024-12-01T00:00:00.000Z"),
    updated_at: new Date("2024-12-01T00:00:00.000Z"),
  };
}

describe("ReserveDocumentMapper", () => {
  describe("toDomain", () => {
    it("should map ReserveDocument with valid _id to Reserve domain", () => {
      const doc = createValidDocument();
      const result = ReserveDocumentMapper.toDomain(doc);

      expect(result.id).toBe(VALID_OBJECT_ID.toHexString());
      expect(result.userId).toBe(USER_OBJECT_ID.toHexString());
      expect(result.carId).toBe(CAR_OBJECT_ID.toHexString());
      expect(result.status).toBe("CONFIRMED");
      expect(result.createdAt).toBe(doc.created_at);
      expect(result.updatedAt).toBe(doc.updated_at);
    });

    it("should throw error when _id is missing", () => {
      const doc = createValidDocument();
      delete doc._id;

      expect(() => ReserveDocumentMapper.toDomain(doc as ReserveDocument)).toThrow(
        "Cannot map ReserveDocument to Reserve: missing _id",
      );
    });

    it("should convert ObjectId fields to strings", () => {
      const doc = createValidDocument();
      const result = ReserveDocumentMapper.toDomain(doc);

      expect(result.id).toBe(VALID_OBJECT_ID.toHexString());
      expect(result.userId).toBe(USER_OBJECT_ID.toHexString());
      expect(result.carId).toBe(CAR_OBJECT_ID.toHexString());
      expect(result.pickup.storeId).toBe(STORE_OBJECT_ID.toHexString());
      expect(result.returnInfo.storeId).toBe(STORE_OBJECT_ID.toHexString());
    });

    it("should convert Decimal128 to string for dailyRate and subtotal", () => {
      const doc = createValidDocument();
      const result = ReserveDocumentMapper.toDomain(doc);

      expect(result.pricing.dailyRate).toBe("50.00");
      expect(result.pricing.subtotal).toBe("200.00");
      expect(result.pricing.days).toBe(4);
    });

    it("should preserve status, days, and date fields", () => {
      const doc = createValidDocument();
      const result = ReserveDocumentMapper.toDomain(doc);

      expect(result.status).toBe("CONFIRMED");
      expect(result.pricing.days).toBe(4);
      expect(result.pickup.date).toBe(doc.pickup_info.date);
      expect(result.returnInfo.date).toBe(doc.return_info.date);
    });
  });

  describe("toDocumentPickup", () => {
    it("should convert Pickup to ReservePickupDocument", () => {
      const pickup: Pickup = {
        date: new Date("2025-01-01T10:00:00.000Z"),
        storeId: STORE_OBJECT_ID.toHexString(),
      };

      const result = ReserveDocumentMapper.toDocumentPickup(pickup);

      expect(result.date).toBe(pickup.date);
      expect(result.store_id).toBeInstanceOf(ObjectId);
      expect(result.store_id.toHexString()).toBe(STORE_OBJECT_ID.toHexString());
    });

    it("should create ObjectId from storeId string", () => {
      const storeIdStr = STORE_OBJECT_ID.toHexString();
      const pickup: Pickup = {
        date: new Date("2025-01-01T10:00:00.000Z"),
        storeId: storeIdStr,
      };

      const result = ReserveDocumentMapper.toDocumentPickup(pickup);

      expect(result.store_id).toBeInstanceOf(ObjectId);
      expect(result.store_id.toHexString()).toBe(storeIdStr);
    });
  });

  describe("toDocumentReturnInfo", () => {
    it("should convert ReturnInfo to ReserveReturnInfoDocument", () => {
      const returnInfo: ReturnInfo = {
        date: new Date("2025-01-05T10:00:00.000Z"),
        storeId: STORE_OBJECT_ID.toHexString(),
      };

      const result = ReserveDocumentMapper.toDocumentReturnInfo(returnInfo);

      expect(result.date).toBe(returnInfo.date);
      expect(result.store_id).toBeInstanceOf(ObjectId);
      expect(result.store_id.toHexString()).toBe(STORE_OBJECT_ID.toHexString());
    });

    it("should create ObjectId from storeId string", () => {
      const storeIdStr = STORE_OBJECT_ID.toHexString();
      const returnInfo: ReturnInfo = {
        date: new Date("2025-01-05T10:00:00.000Z"),
        storeId: storeIdStr,
      };

      const result = ReserveDocumentMapper.toDocumentReturnInfo(returnInfo);

      expect(result.store_id).toBeInstanceOf(ObjectId);
      expect(result.store_id.toHexString()).toBe(storeIdStr);
    });
  });

  describe("toDocumentFromInput", () => {
    it("should convert ReserveCreateData to ReserveDocument", () => {
      const input: ReserveCreateData = {
        userId: USER_OBJECT_ID.toHexString(),
        carId: CAR_OBJECT_ID.toHexString(),
        pickup: {
          date: new Date("2025-01-01T10:00:00.000Z"),
          storeId: STORE_OBJECT_ID.toHexString(),
        },
        returnInfo: {
          date: new Date("2025-01-05T10:00:00.000Z"),
          storeId: STORE_OBJECT_ID.toHexString(),
        },
        pricing: {
          dailyRate: "50.00",
          days: 4,
          subtotal: "200.00",
        },
      };

      const result = ReserveDocumentMapper.toDocumentFromInput(input);

      expect(result.user_id).toBeInstanceOf(ObjectId);
      expect(result.user_id.toHexString()).toBe(input.userId);
      expect(result.car_id).toBeInstanceOf(ObjectId);
      expect(result.car_id.toHexString()).toBe(input.carId);
    });

    it("should set status to PENDING as default", () => {
      const input: ReserveCreateData = {
        userId: USER_OBJECT_ID.toHexString(),
        carId: CAR_OBJECT_ID.toHexString(),
        pickup: {
          date: new Date("2025-01-01T10:00:00.000Z"),
          storeId: STORE_OBJECT_ID.toHexString(),
        },
        returnInfo: {
          date: new Date("2025-01-05T10:00:00.000Z"),
          storeId: STORE_OBJECT_ID.toHexString(),
        },
        pricing: {
          dailyRate: "50.00",
          days: 4,
          subtotal: "200.00",
        },
      };

      const result = ReserveDocumentMapper.toDocumentFromInput(input);

      expect(result.status).toBe("PENDING");
    });

    it("should set created_at and updated_at to current time", () => {
      const before = Date.now();
      const input: ReserveCreateData = {
        userId: USER_OBJECT_ID.toHexString(),
        carId: CAR_OBJECT_ID.toHexString(),
        pickup: {
          date: new Date("2025-01-01T10:00:00.000Z"),
          storeId: STORE_OBJECT_ID.toHexString(),
        },
        returnInfo: {
          date: new Date("2025-01-05T10:00:00.000Z"),
          storeId: STORE_OBJECT_ID.toHexString(),
        },
        pricing: {
          dailyRate: "50.00",
          days: 4,
          subtotal: "200.00",
        },
      };

      const result = ReserveDocumentMapper.toDocumentFromInput(input);
      const after = Date.now();

      expect(result.created_at.getTime()).toBeGreaterThanOrEqual(before);
      expect(result.created_at.getTime()).toBeLessThanOrEqual(after);
      expect(result.updated_at.getTime()).toBeGreaterThanOrEqual(before);
      expect(result.updated_at.getTime()).toBeLessThanOrEqual(after);
    });

    it("should convert pricing fields to Decimal128", () => {
      const input: ReserveCreateData = {
        userId: USER_OBJECT_ID.toHexString(),
        carId: CAR_OBJECT_ID.toHexString(),
        pickup: {
          date: new Date("2025-01-01T10:00:00.000Z"),
          storeId: STORE_OBJECT_ID.toHexString(),
        },
        returnInfo: {
          date: new Date("2025-01-05T10:00:00.000Z"),
          storeId: STORE_OBJECT_ID.toHexString(),
        },
        pricing: {
          dailyRate: "50.00",
          days: 4,
          subtotal: "200.00",
        },
      };

      const result = ReserveDocumentMapper.toDocumentFromInput(input);

      expect(result.pricing.daily_rate).toBeInstanceOf(Decimal128);
      expect(result.pricing.subtotal).toBeInstanceOf(Decimal128);
      expect(result.pricing.days).toBe(4);
    });
  });

  describe("toDocumentUpdate", () => {
    it("should return only provided fields", () => {
      const updateData: ReserveUpdateData = {
        pickup: {
          date: new Date("2025-02-01T10:00:00.000Z"),
          storeId: STORE_OBJECT_ID.toHexString(),
        },
      };

      const result = ReserveDocumentMapper.toDocumentUpdate(updateData);

      expect(result.pickup_info).toBeDefined();
      expect(result.return_info).toBeUndefined();
      expect(result.pricing).toBeUndefined();
    });

    it("should omit undefined fields", () => {
      const updateData: ReserveUpdateData = {};

      const result = ReserveDocumentMapper.toDocumentUpdate(updateData);

      expect(result.pickup_info).toBeUndefined();
      expect(result.return_info).toBeUndefined();
      expect(result.pricing).toBeUndefined();
    });

    it("should convert pricing to Decimal128 when provided", () => {
      const updateData: ReserveUpdateData = {
        pricing: {
          dailyRate: "75.00",
          days: 5,
          subtotal: "375.00",
        },
      };

      const result = ReserveDocumentMapper.toDocumentUpdate(updateData);

      expect(result.pricing).toBeDefined();
      expect(result.pricing!.daily_rate).toBeInstanceOf(Decimal128);
      expect(result.pricing!.subtotal).toBeInstanceOf(Decimal128);
      expect(result.pricing!.days).toBe(5);
    });
  });
});
