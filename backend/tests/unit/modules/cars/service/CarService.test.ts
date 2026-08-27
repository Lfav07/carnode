import { beforeEach, describe, expect, it, vi, type Mocked } from "vitest";
import { CarService } from "../../../../../src/modules/cars/service/CarService.js";
import type { CarRepository } from "../../../../../src/modules/cars/domain/CarRepository.js";
import type { Car } from "../../../../../src/modules/cars/domain/Car.js";
import { CarNotFoundError } from "../../../../../src/modules/cars/domain/errors/CarNotFoundError.js";
import { CarConflictError } from "../../../../../src/modules/cars/domain/errors/CarConflictError.js";
import { CarInvalidTransitionError } from "../../../../../src/modules/cars/domain/errors/CarInvalidTransitionError.js";
import { CarDeletionBlockedError } from "../../../../../src/modules/cars/domain/errors/CarDeletionBlockedError.js";

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

const repository: Mocked<CarRepository> = {
  findById: vi.fn(),
  findByPlate: vi.fn(),
  findPaginated: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  updateStatus: vi.fn(),
};

const QUERY_PARAMS = {
  page: 1,
  limit: 10,
  sortBy: "createdAt" as const,
  sortOrder: "desc" as const,
};

describe("CarService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const service = new CarService(repository);

  describe("getCarById", () => {
    it("should return mapped car when found", async () => {
      repository.findById.mockResolvedValue(DUMMY_CAR);

      const result = await service.getCarById(DUMMY_CAR.id);

      expect(result).toEqual({
        id: DUMMY_CAR.id,
        brand: DUMMY_CAR.brand,
        model: DUMMY_CAR.model,
        year: DUMMY_CAR.year,
        category: DUMMY_CAR.category,
        plate: DUMMY_CAR.plate,
        status: DUMMY_CAR.status,
        dailyRate: DUMMY_CAR.dailyRate,
        createdAt: DUMMY_CAR.createdAt.toISOString(),
        updatedAt: DUMMY_CAR.updatedAt.toISOString(),
      });
      expect(repository.findById).toHaveBeenCalledWith(DUMMY_CAR.id);
    });

    it("should throw CarNotFoundError when not found", async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.getCarById("nonexistent")).rejects.toThrow(
        CarNotFoundError,
      );
      expect(repository.findById).toHaveBeenCalledWith("nonexistent");
    });
  });

  describe("getUserCarById", () => {
    it("should return user-mapped car when found", async () => {
      repository.findById.mockResolvedValue(DUMMY_CAR);

      const result = await service.getUserCarById(DUMMY_CAR.id);

      expect(result).toEqual({
        id: DUMMY_CAR.id,
        brand: DUMMY_CAR.brand,
        model: DUMMY_CAR.model,
        year: DUMMY_CAR.year,
        category: DUMMY_CAR.category,
        availability: "available",
        dailyRate: DUMMY_CAR.dailyRate,
      });
      expect(repository.findById).toHaveBeenCalledWith(DUMMY_CAR.id);
    });

    it("should throw CarNotFoundError when not found", async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.getUserCarById("nonexistent")).rejects.toThrow(
        CarNotFoundError,
      );
    });
  });

  describe("getCars", () => {
    it("should return paginated result", async () => {
      repository.findPaginated.mockResolvedValue({
        data: [DUMMY_CAR],
        totalCount: 1,
      });

      const result = await service.getCars(QUERY_PARAMS);

      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toEqual({
        id: DUMMY_CAR.id,
        brand: DUMMY_CAR.brand,
        model: DUMMY_CAR.model,
        year: DUMMY_CAR.year,
        category: DUMMY_CAR.category,
        plate: DUMMY_CAR.plate,
        status: DUMMY_CAR.status,
        dailyRate: DUMMY_CAR.dailyRate,
        createdAt: DUMMY_CAR.createdAt.toISOString(),
        updatedAt: DUMMY_CAR.updatedAt.toISOString(),
      });
      expect(result.meta).toEqual({
        currentPage: 1,
        totalPages: 1,
        totalCount: 1,
        limit: 10,
        hasNext: false,
        hasPrev: false,
      });
    });

    it("should return empty result", async () => {
      repository.findPaginated.mockResolvedValue({
        data: [],
        totalCount: 0,
      });

      const result = await service.getCars(QUERY_PARAMS);

      expect(result.data).toEqual([]);
      expect(result.meta).toEqual({
        currentPage: 1,
        totalPages: 0,
        totalCount: 0,
        limit: 10,
        hasNext: false,
        hasPrev: false,
      });
    });
  });

  describe("userGetCars", () => {
    it("should return user-mapped paginated result", async () => {
      repository.findPaginated.mockResolvedValue({
        data: [DUMMY_CAR],
        totalCount: 1,
      });

      const result = await service.userGetCars(QUERY_PARAMS);

      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toEqual({
        id: DUMMY_CAR.id,
        brand: DUMMY_CAR.brand,
        model: DUMMY_CAR.model,
        year: DUMMY_CAR.year,
        category: DUMMY_CAR.category,
        availability: "available",
        dailyRate: DUMMY_CAR.dailyRate,
      });
    });
  });

  describe("registerCar", () => {
    it("should create car when plate is unique", async () => {
      repository.findByPlate.mockResolvedValue(null);
      repository.create.mockResolvedValue(DUMMY_CAR);

      const result = await service.registerCar({
        brand: "TOYOTA",
        model: "Corolla",
        year: 2023,
        category: "ECONOMY",
        plate: "ABC1234",
        dailyRate: "150.00",
      });

      expect(result).toEqual({
        id: DUMMY_CAR.id,
        brand: DUMMY_CAR.brand,
        model: DUMMY_CAR.model,
        year: DUMMY_CAR.year,
        category: DUMMY_CAR.category,
        plate: DUMMY_CAR.plate,
        status: DUMMY_CAR.status,
        dailyRate: DUMMY_CAR.dailyRate,
        createdAt: DUMMY_CAR.createdAt.toISOString(),
        updatedAt: DUMMY_CAR.updatedAt.toISOString(),
      });
      expect(repository.findByPlate).toHaveBeenCalledWith("ABC1234");
      expect(repository.create).toHaveBeenCalled();
    });

    it("should throw CarConflictError when plate exists", async () => {
      repository.findByPlate.mockResolvedValue(DUMMY_CAR);

      await expect(
        service.registerCar({
          brand: "TOYOTA",
          model: "Corolla",
          year: 2023,
          category: "ECONOMY",
          plate: "ABC1234",
          dailyRate: "150.00",
        }),
      ).rejects.toThrow(CarConflictError);
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe("updateCar", () => {
    it("should update car when plate unchanged", async () => {
      repository.findById.mockResolvedValue(DUMMY_CAR);
      const updatedCar = { ...DUMMY_CAR, model: "Camry" };
      repository.update.mockResolvedValue(updatedCar);

      const result = await service.updateCar(DUMMY_CAR.id, {
        model: "Camry",
      });

      expect(result.model).toBe("Camry");
      expect(repository.update).toHaveBeenCalledWith(DUMMY_CAR.id, {
        model: "Camry",
      });
    });

    it("should throw CarConflictError when new plate conflicts", async () => {
      repository.findById.mockResolvedValue(DUMMY_CAR);
      repository.findByPlate.mockResolvedValue(DUMMY_CAR);

      await expect(
        service.updateCar(DUMMY_CAR.id, { plate: "XYZ5678" }),
      ).rejects.toThrow(CarConflictError);
    });

    it("should throw CarNotFoundError when car not found", async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.updateCar("nonexistent", { model: "Camry" }),
      ).rejects.toThrow(CarNotFoundError);
    });
  });

  describe("updateCarStatus", () => {
    it("should update status on valid transition", async () => {
      repository.findById.mockResolvedValue(DUMMY_CAR);
      const rentedCar = { ...DUMMY_CAR, status: "RENTED" as const };
      repository.updateStatus.mockResolvedValue(rentedCar);

      const result = await service.updateCarStatus(DUMMY_CAR.id, "RENTED");

      expect(result.status).toBe("RENTED");
      expect(repository.updateStatus).toHaveBeenCalledWith(
        DUMMY_CAR.id,
        "RENTED",
      );
    });

    it("should throw CarInvalidTransitionError on invalid transition", async () => {
      repository.findById.mockResolvedValue(DUMMY_CAR);

      await expect(
        service.updateCarStatus(DUMMY_CAR.id, "AVAILABLE"),
      ).rejects.toThrow(CarInvalidTransitionError);
    });

    it("should throw CarNotFoundError when car not found", async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.updateCarStatus("nonexistent", "RENTED"),
      ).rejects.toThrow(CarNotFoundError);
    });
  });

  describe("deleteCar", () => {
    it("should delete car with valid transition", async () => {
      repository.findById.mockResolvedValue(DUMMY_CAR);
      const deletedCar = { ...DUMMY_CAR, status: "DELETED" as const };
      repository.updateStatus.mockResolvedValue(deletedCar);

      await service.deleteCar(DUMMY_CAR.id);

      expect(repository.updateStatus).toHaveBeenCalledWith(
        DUMMY_CAR.id,
        "DELETED",
      );
    });

    it("should throw CarDeletionBlockedError when transition invalid", async () => {
      const rentedCar = { ...DUMMY_CAR, status: "RENTED" as const };
      repository.findById.mockResolvedValue(rentedCar);

      await expect(service.deleteCar(DUMMY_CAR.id)).rejects.toThrow(
        CarDeletionBlockedError,
      );
    });

    it("should throw CarNotFoundError when car not found", async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.deleteCar("nonexistent")).rejects.toThrow(
        CarNotFoundError,
      );
    });
  });
});
