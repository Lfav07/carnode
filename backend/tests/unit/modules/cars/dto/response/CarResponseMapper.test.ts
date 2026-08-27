import { describe, expect, it } from "vitest";
import { CarResponseMapper } from "../../../../../../src/modules/cars/dto/response/CarResponseMapper.js";
import type { Car } from "../../../../../../src/modules/cars/domain/Car.js";

const DUMMY_CAR: Car = {
  id: "507f1f77bcf86cd799439011",
  brand: "TOYOTA",
  model: "Corolla",
  year: 2023,
  category: "ECONOMY",
  plate: "ABC1234",
  status: "AVAILABLE",
  dailyRate: "150.00",
  createdAt: new Date("2025-01-01T00:00:00.000Z"),
  updatedAt: new Date("2025-06-01T00:00:00.000Z"),
};

describe("CarResponseMapper", () => {
  describe("toResponse", () => {
    it("should map all fields correctly with dates as ISO strings", () => {
      const result = CarResponseMapper.toResponse(DUMMY_CAR);

      expect(result).toEqual({
        id: DUMMY_CAR.id,
        brand: DUMMY_CAR.brand,
        model: DUMMY_CAR.model,
        year: DUMMY_CAR.year,
        category: DUMMY_CAR.category,
        plate: DUMMY_CAR.plate,
        status: DUMMY_CAR.status,
        dailyRate: DUMMY_CAR.dailyRate,
        createdAt: "2025-01-01T00:00:00.000Z",
        updatedAt: "2025-06-01T00:00:00.000Z",
      });
    });

    it("should preserve status field", () => {
      const result = CarResponseMapper.toResponse(DUMMY_CAR);
      expect(result.status).toBe("AVAILABLE");
    });
  });

  describe("toUserResponse", () => {
    it("should map subset of fields excluding status, plate, createdAt, updatedAt", () => {
      const result = CarResponseMapper.toUserResponse(DUMMY_CAR);

      expect(result).toEqual({
        id: DUMMY_CAR.id,
        brand: DUMMY_CAR.brand,
        model: DUMMY_CAR.model,
        year: DUMMY_CAR.year,
        category: DUMMY_CAR.category,
        availability: "available",
        dailyRate: DUMMY_CAR.dailyRate,
      });
    });

    it("should map AVAILABLE status to 'available'", () => {
      const result = CarResponseMapper.toUserResponse(DUMMY_CAR);
      expect(result.availability).toBe("available");
    });

    it("should map non-AVAILABLE status to 'unavailable'", () => {
      const rentedCar = { ...DUMMY_CAR, status: "RENTED" as const };
      const maintenanceCar = { ...DUMMY_CAR, status: "MAINTENANCE" as const };
      const deletedCar = { ...DUMMY_CAR, status: "DELETED" as const };

      expect(CarResponseMapper.toUserResponse(rentedCar).availability).toBe(
        "unavailable",
      );
      expect(
        CarResponseMapper.toUserResponse(maintenanceCar).availability,
      ).toBe("unavailable");
      expect(CarResponseMapper.toUserResponse(deletedCar).availability).toBe(
        "unavailable",
      );
    });
  });
});
