import { beforeAll, afterAll, beforeEach, expect, describe, it } from "vitest";
import {
  clearTestDatabase,
  connectTestDatabase,
  disconnectTestDatabase,
} from "./../../test-database.js";
import type { Db } from "mongodb";
import { MongoCarRepository } from "../../../../src/modules/cars/infrastructure/mongodb/repository/MongoCarRepository.js";
import { CarService } from "../../../../src/modules/cars/service/CarService.js";
import { buildCarCreateData, buildCarQueryData } from "./car.test-fixtures.js";
import { CarNotFoundError } from "../../../../src/modules/cars/domain/errors/CarNotFoundError.js";
import { CarConflictError } from "../../../../src/modules/cars/domain/errors/CarConflictError.js";
import { CarInvalidTransitionError } from "../../../../src/modules/cars/domain/errors/CarInvalidTransitionError.js";
import { CarDeletionBlockedError } from "../../../../src/modules/cars/domain/errors/CarDeletionBlockedError.js";

let db!: Db;
let carRepository: MongoCarRepository;
let carService: CarService;

describe("Car service integration tests", () => {
  beforeAll(async () => {
    db = await connectTestDatabase();
    carRepository = new MongoCarRepository(db);
    carService = new CarService(carRepository);
  });

  beforeEach(async () => {
    await clearTestDatabase();
  });

  afterAll(async () => {
    await disconnectTestDatabase();
  });

  describe("getCarById", () => {
    it("should return a CarResponseDto for an existing car", async () => {
      const carData = buildCarCreateData();
      const createdCar = await carRepository.create(carData);

      const result = await carService.getCarById(createdCar.id);

      expect(result).toBeDefined();
      expect(result.id).toBe(createdCar.id);
      expect(result.brand).toBe(carData.brand);
      expect(result.model).toBe(carData.model);
      expect(result.year).toBe(carData.year);
      expect(result.category).toBe(carData.category);
      expect(result.plate).toBe(carData.plate);
      expect(result.status).toBe("AVAILABLE");
      expect(result.dailyRate).toBe(carData.dailyRate);
      expect(typeof result.createdAt).toBe("string");
      expect(typeof result.updatedAt).toBe("string");
    });

    it("should throw CarNotFoundError for a nonexistent car", async () => {
      await expect(
        carService.getCarById("507f1f77bcf86cd799439011"),
      ).rejects.toThrow(CarNotFoundError);
    });
  });

  describe("getUserCarById", () => {
    it("should return a UserCarResponseDto for an existing car", async () => {
      const carData = buildCarCreateData();
      const createdCar = await carRepository.create(carData);

      const result = await carService.getUserCarById(createdCar.id);

      expect(result).toBeDefined();
      expect(result.id).toBe(createdCar.id);
      expect(result.brand).toBe(carData.brand);
      expect(result.model).toBe(carData.model);
      expect(result.year).toBe(carData.year);
      expect(result.category).toBe(carData.category);
      expect(result.availability).toBe("available");
      expect(result.dailyRate).toBe(carData.dailyRate);
      expect(result).not.toHaveProperty("status");
      expect(result).not.toHaveProperty("plate");
      expect(result).not.toHaveProperty("createdAt");
      expect(result).not.toHaveProperty("updatedAt");
    });

    it("should return unavailable for non-AVAILABLE status", async () => {
      const createdCar = await carRepository.create(buildCarCreateData());
      await carRepository.updateStatus(createdCar.id, "RENTED");

      const result = await carService.getUserCarById(createdCar.id);

      expect(result.availability).toBe("unavailable");
    });

    it("should throw CarNotFoundError for a nonexistent car", async () => {
      await expect(
        carService.getUserCarById("507f1f77bcf86cd799439011"),
      ).rejects.toThrow(CarNotFoundError);
    });
  });

  describe("getCars", () => {
    it("should return PaginatedResponse<CarResponseDto> with correct meta", async () => {
      await carRepository.create(
        buildCarCreateData({ brand: "TOYOTA", plate: "LST10T1" }),
      );
      await carRepository.create(
        buildCarCreateData({ brand: "HONDA", plate: "LST20T1" }),
      );

      const query = buildCarQueryData({ page: 1, limit: 10 });
      const result = await carService.getCars(query);

      expect(result.data).toHaveLength(2);
      expect(result.meta.currentPage).toBe(1);
      expect(result.meta.totalCount).toBe(2);
      expect(result.meta.limit).toBe(10);
      expect(result.meta.totalPages).toBe(1);
      expect(result.meta.hasNext).toBe(false);
      expect(result.meta.hasPrev).toBe(false);
      result.data.forEach((car) => {
        expect(car).toHaveProperty("id");
        expect(car).toHaveProperty("brand");
        expect(car).toHaveProperty("status");
        expect(car).toHaveProperty("plate");
        expect(car).toHaveProperty("createdAt");
      });
    });
  });

  describe("userGetCars", () => {
    it("should return PaginatedResponse<UserCarResponseDto>", async () => {
      await carRepository.create(
        buildCarCreateData({ brand: "TOYOTA", plate: "USR10T1" }),
      );
      await carRepository.create(
        buildCarCreateData({ brand: "HONDA", plate: "USR20T1" }),
      );

      const query = buildCarQueryData({ page: 1, limit: 10 });
      const result = await carService.userGetCars(query);

      expect(result.data).toHaveLength(2);
      expect(result.meta.currentPage).toBe(1);
      expect(result.meta.totalCount).toBe(2);
      result.data.forEach((car) => {
        expect(car).toHaveProperty("id");
        expect(car).toHaveProperty("brand");
        expect(car).toHaveProperty("availability");
        expect(car).not.toHaveProperty("status");
        expect(car).not.toHaveProperty("plate");
      });
    });
  });

  describe("registerCar", () => {
    it("should create a car when plate is unique and return CarResponseDto", async () => {
      const carData = buildCarCreateData();

      const result = await carService.registerCar(carData);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.brand).toBe(carData.brand);
      expect(result.plate).toBe(carData.plate);
      expect(result.status).toBe("AVAILABLE");
    });

    it("should throw CarConflictError on duplicate plate", async () => {
      const carData = buildCarCreateData({ plate: "DUP10T1" });
      await carService.registerCar(carData);

      await expect(carService.registerCar(carData)).rejects.toThrow(
        CarConflictError,
      );
    });
  });

  describe("updateCar", () => {
    it("should update fields and return CarResponseDto", async () => {
      const createdCar = await carRepository.create(
        buildCarCreateData({ model: "COROLLA" }),
      );

      const result = await carService.updateCar(createdCar.id, {
        model: "CAMRY",
      });

      expect(result.model).toBe("CAMRY");
      expect(result.brand).toBe(createdCar.brand);
    });

    it("should throw CarConflictError on plate conflict", async () => {
      await carRepository.create(
        buildCarCreateData({ plate: "UPD10T1" }),
      );
      const car2 = await carRepository.create(
        buildCarCreateData({ plate: "UPD10T2" }),
      );

      await expect(
        carService.updateCar(car2.id, { plate: "UPD10T1" }),
      ).rejects.toThrow(CarConflictError);
    });

    it("should throw CarNotFoundError for nonexistent car", async () => {
      await expect(
        carService.updateCar("507f1f77bcf86cd799439011", { model: "TEST" }),
      ).rejects.toThrow(CarNotFoundError);
    });

    it("should allow updating plate to the same value without conflict", async () => {
      const createdCar = await carRepository.create(
        buildCarCreateData({ plate: "SAME0T1" }),
      );

      const result = await carService.updateCar(createdCar.id, {
        plate: "SAME0T1",
      });

      expect(result.plate).toBe("SAME0T1");
    });
  });

  describe("updateCarStatus", () => {
    it("should succeed for valid transition", async () => {
      const createdCar = await carRepository.create(buildCarCreateData());

      const result = await carService.updateCarStatus(
        createdCar.id,
        "RENTED",
      );

      expect(result.status).toBe("RENTED");
    });

    it("should throw CarInvalidTransitionError for invalid transition", async () => {
      const createdCar = await carRepository.create(buildCarCreateData());
      await carRepository.updateStatus(createdCar.id, "RENTED");

      await expect(
        carService.updateCarStatus(createdCar.id, "MAINTENANCE"),
      ).rejects.toThrow(CarInvalidTransitionError);
    });

    it("should throw CarNotFoundError for nonexistent car", async () => {
      await expect(
        carService.updateCarStatus("507f1f77bcf86cd799439011", "RENTED"),
      ).rejects.toThrow(CarNotFoundError);
    });
  });

  describe("deleteCar", () => {
    it("should succeed for valid transition (AVAILABLE -> DELETED)", async () => {
      const createdCar = await carRepository.create(buildCarCreateData());

      await carService.deleteCar(createdCar.id);

      const car = await carRepository.findById(createdCar.id);
      expect(car?.status).toBe("DELETED");
    });

    it("should throw CarDeletionBlockedError when transition is invalid", async () => {
      const createdCar = await carRepository.create(buildCarCreateData());
      await carRepository.updateStatus(createdCar.id, "RENTED");

      await expect(carService.deleteCar(createdCar.id)).rejects.toThrow(
        CarDeletionBlockedError,
      );
    });

    it("should throw CarNotFoundError for nonexistent car", async () => {
      await expect(
        carService.deleteCar("507f1f77bcf86cd799439011"),
      ).rejects.toThrow(CarNotFoundError);
    });
  });
});
