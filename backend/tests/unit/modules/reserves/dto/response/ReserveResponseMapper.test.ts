import { describe, expect, it } from "vitest";
import { ReserveResponseMapper } from "../../../../../../src/modules/reserves/dto/response/ReserveResponseMapper.js";
import type { Reserve } from "../../../../../../src/modules/reserves/domain/Reserve.js";

const DUMMY_RESERVE: Reserve = {
  id: "507f1f77bcf86cd799439011",
  userId: "user-id-123",
  carId: "car-id-456",
  pickup: {
    date: new Date("2025-01-01T10:00:00.000Z"),
    storeId: "store-id-789",
  },
  returnInfo: {
    date: new Date("2025-01-05T10:00:00.000Z"),
    storeId: "store-id-789",
  },
  status: "CONFIRMED",
  pricing: {
    dailyRate: "50.00",
    days: 4,
    subtotal: "200.00",
  },
  createdAt: new Date("2024-12-01T00:00:00.000Z"),
  updatedAt: new Date("2024-12-01T00:00:00.000Z"),
};

describe("ReserveResponseMapper", () => {
  describe("toResponse", () => {
    it("should map Reserve to ReserveResponseDto correctly", () => {
      const result = ReserveResponseMapper.toResponse(DUMMY_RESERVE);

      expect(result).toEqual({
        id: DUMMY_RESERVE.id,
        userId: DUMMY_RESERVE.userId,
        carId: DUMMY_RESERVE.carId,
        pickup: DUMMY_RESERVE.pickup,
        returnInfo: DUMMY_RESERVE.returnInfo,
        status: DUMMY_RESERVE.status,
        pricing: DUMMY_RESERVE.pricing,
        createdAt: DUMMY_RESERVE.createdAt.toISOString(),
        updatedAt: DUMMY_RESERVE.updatedAt.toISOString(),
      });
    });

    it("should convert createdAt and updatedAt to ISO string format", () => {
      const result = ReserveResponseMapper.toResponse(DUMMY_RESERVE);

      expect(typeof result.createdAt).toBe("string");
      expect(typeof result.updatedAt).toBe("string");
      expect(result.createdAt).toBe("2024-12-01T00:00:00.000Z");
      expect(result.updatedAt).toBe("2024-12-01T00:00:00.000Z");
    });

    it("should preserve all fields", () => {
      const result = ReserveResponseMapper.toResponse(DUMMY_RESERVE);

      expect(result.id).toBe(DUMMY_RESERVE.id);
      expect(result.userId).toBe(DUMMY_RESERVE.userId);
      expect(result.carId).toBe(DUMMY_RESERVE.carId);
      expect(result.pickup).toEqual(DUMMY_RESERVE.pickup);
      expect(result.returnInfo).toEqual(DUMMY_RESERVE.returnInfo);
      expect(result.status).toBe(DUMMY_RESERVE.status);
      expect(result.pricing).toEqual(DUMMY_RESERVE.pricing);
    });
  });

  describe("toUserResponse", () => {
    it("should map Reserve to UserReserveResponseDto correctly", () => {
      const result = ReserveResponseMapper.toUserResponse(DUMMY_RESERVE);

      expect(result).toEqual({
        id: DUMMY_RESERVE.id,
        carId: DUMMY_RESERVE.carId,
        pickup: DUMMY_RESERVE.pickup,
        returnInfo: DUMMY_RESERVE.returnInfo,
        status: DUMMY_RESERVE.status,
        pricing: DUMMY_RESERVE.pricing,
        createdAt: DUMMY_RESERVE.createdAt.toISOString(),
        updatedAt: DUMMY_RESERVE.updatedAt.toISOString(),
      });
    });

    it("should omit userId field", () => {
      const result = ReserveResponseMapper.toUserResponse(DUMMY_RESERVE);

      expect(result).not.toHaveProperty("userId");
    });

    it("should convert dates to ISO strings", () => {
      const result = ReserveResponseMapper.toUserResponse(DUMMY_RESERVE);

      expect(typeof result.createdAt).toBe("string");
      expect(typeof result.updatedAt).toBe("string");
      expect(result.createdAt).toBe("2024-12-01T00:00:00.000Z");
      expect(result.updatedAt).toBe("2024-12-01T00:00:00.000Z");
    });

    it("should preserve all other fields", () => {
      const result = ReserveResponseMapper.toUserResponse(DUMMY_RESERVE);

      expect(result.id).toBe(DUMMY_RESERVE.id);
      expect(result.carId).toBe(DUMMY_RESERVE.carId);
      expect(result.pickup).toEqual(DUMMY_RESERVE.pickup);
      expect(result.returnInfo).toEqual(DUMMY_RESERVE.returnInfo);
      expect(result.status).toBe(DUMMY_RESERVE.status);
      expect(result.pricing).toEqual(DUMMY_RESERVE.pricing);
    });
  });
});
