import { beforeAll, afterAll, beforeEach, expect, describe, it } from "vitest";
import {
  clearTestDatabase,
  connectTestDatabase,
  disconnectTestDatabase,
} from "./../../test-database.js";
import type { Db } from "mongodb";
import { MongoCarRepository } from "../../../../src/modules/cars/infrastructure/mongodb/repository/MongoCarRepository.js";
import {
  buildCarCreateData,
  buildCarQueryData,
} from "./car.test-fixtures.js";
import { CarNotFoundError } from "../../../../src/modules/cars/domain/errors/CarNotFoundError.js";
import { CarConflictError } from "../../../../src/modules/cars/domain/errors/CarConflictError.js";

let db!: Db;
let carRepository: MongoCarRepository;

describe("Car repository integration tests", () => {
  beforeAll(async () => {
    db = await connectTestDatabase();
    carRepository = new MongoCarRepository(db);
    await carRepository.ensureReady();
  });

  beforeEach(async () => {
    await clearTestDatabase();
  });

  afterAll(async () => {
    await disconnectTestDatabase();
  });

  describe("create", () => {
    it("should persist a car and return it with generated id, status=AVAILABLE, and timestamps", async () => {
      const carData = buildCarCreateData();

      const createdCar = await carRepository.create(carData);

      expect(createdCar).toBeDefined();
      expect(createdCar.id).toBeDefined();
      expect(createdCar.id.length).toBe(24);
      expect(createdCar.brand).toBe(carData.brand);
      expect(createdCar.model).toBe(carData.model);
      expect(createdCar.year).toBe(carData.year);
      expect(createdCar.category).toBe(carData.category);
      expect(createdCar.plate).toBe(carData.plate);
      expect(createdCar.status).toBe("AVAILABLE");
      expect(createdCar.dailyRate).toBe(carData.dailyRate);
      expect(createdCar.createdAt).toBeInstanceOf(Date);
      expect(createdCar.updatedAt).toBeInstanceOf(Date);
    });

    it("should throw CarConflictError when creating a car with duplicate plate", async () => {
      const carData = buildCarCreateData({ plate: "DUPL0T1" });

      await carRepository.create(carData);

      await expect(carRepository.create(carData)).rejects.toThrow(
        CarConflictError,
      );
    });
  });

  describe("findById", () => {
    it("should return a car for a valid id", async () => {
      const carData = buildCarCreateData();
      const createdCar = await carRepository.create(carData);

      const foundCar = await carRepository.findById(createdCar.id);

      expect(foundCar).toBeDefined();
      expect(foundCar?.id).toBe(createdCar.id);
      expect(foundCar?.plate).toBe(carData.plate);
    });

    it("should return null for a nonexistent id", async () => {
      const foundCar = await carRepository.findById(
        "507f1f77bcf86cd799439011",
      );

      expect(foundCar).toBeNull();
    });
  });

  describe("findByPlate", () => {
    it("should return a car for an existing plate", async () => {
      const carData = buildCarCreateData({ plate: "FIND0T1" });
      await carRepository.create(carData);

      const foundCar = await carRepository.findByPlate("FIND0T1");

      expect(foundCar).toBeDefined();
      expect(foundCar?.plate).toBe("FIND0T1");
    });

    it("should return null for a nonexistent plate", async () => {
      const foundCar = await carRepository.findByPlate("NOEX0T1");

      expect(foundCar).toBeNull();
    });
  });

  describe("findPaginated", () => {
    it("should return paginated results with filters", async () => {
      await carRepository.create(
        buildCarCreateData({
          brand: "TOYOTA",
          category: "COMPACT",
          plate: "FLT10T1",
        }),
      );
      await carRepository.create(
        buildCarCreateData({
          brand: "HONDA",
          category: "SUV",
          plate: "FLT20T1",
        }),
      );
      await carRepository.create(
        buildCarCreateData({
          brand: "TOYOTA",
          category: "SUV",
          plate: "FLT30T1",
        }),
      );

      const query = buildCarQueryData({ brand: "TOYOTA" });
      const result = await carRepository.findPaginated(query);

      expect(result.data).toHaveLength(2);
      expect(result.totalCount).toBe(2);
      result.data.forEach((car) => {
        expect(car.brand).toBe("TOYOTA");
      });
    });

    it("should filter by category", async () => {
      await carRepository.create(
        buildCarCreateData({ category: "SUV", plate: "CAT10T1" }),
      );
      await carRepository.create(
        buildCarCreateData({ category: "COMPACT", plate: "CAT20T1" }),
      );

      const query = buildCarQueryData({ category: "SUV" });
      const result = await carRepository.findPaginated(query);

      expect(result.data).toHaveLength(1);
      expect(result.data[0]!.category).toBe("SUV");
    });

    it("should filter by status", async () => {
      const car1 = await carRepository.create(
        buildCarCreateData({ plate: "STS10T1" }),
      );
      await carRepository.create(
        buildCarCreateData({ plate: "STS20T1" }),
      );
      await carRepository.updateStatus(car1.id, "RENTED");

      const query = buildCarQueryData({ status: "RENTED" });
      const result = await carRepository.findPaginated(query);

      expect(result.data).toHaveLength(1);
      expect(result.data[0]!.status).toBe("RENTED");
    });

    it("should filter by year range", async () => {
      await carRepository.create(
        buildCarCreateData({ year: 2020, plate: "YR10T1" }),
      );
      await carRepository.create(
        buildCarCreateData({ year: 2022, plate: "YR20T1" }),
      );
      await carRepository.create(
        buildCarCreateData({ year: 2024, plate: "YR30T1" }),
      );

      const query = buildCarQueryData({ minYear: 2021, maxYear: 2023 });
      const result = await carRepository.findPaginated(query);

      expect(result.data).toHaveLength(1);
      expect(result.data[0]!.year).toBe(2022);
    });

    it("should filter by model", async () => {
      await carRepository.create(
        buildCarCreateData({ model: "COROLLA", plate: "MDL10T1" }),
      );
      await carRepository.create(
        buildCarCreateData({ model: "CIVIC", plate: "MDL20T1" }),
      );

      const query = buildCarQueryData({ model: "COROLLA" });
      const result = await carRepository.findPaginated(query);

      expect(result.data).toHaveLength(1);
      expect(result.data[0]!.model).toBe("COROLLA");
    });

    it("should respect sortBy and sortOrder", async () => {
      await carRepository.create(
        buildCarCreateData({ brand: "BMW", plate: "SRT10T1" }),
      );
      await carRepository.create(
        buildCarCreateData({ brand: "AUDI", plate: "SRT20T1" }),
      );
      await carRepository.create(
        buildCarCreateData({ brand: "TESLA", plate: "SRT30T1" }),
      );

      const queryAsc = buildCarQueryData({
        sortBy: "brand",
        sortOrder: "asc",
      });
      const resultAsc = await carRepository.findPaginated(queryAsc);

      expect(resultAsc.data[0]!.brand).toBe("AUDI");
      expect(resultAsc.data[1]!.brand).toBe("BMW");
      expect(resultAsc.data[2]!.brand).toBe("TESLA");

      const queryDesc = buildCarQueryData({
        sortBy: "brand",
        sortOrder: "desc",
      });
      const resultDesc = await carRepository.findPaginated(queryDesc);

      expect(resultDesc.data[0]!.brand).toBe("TESLA");
      expect(resultDesc.data[1]!.brand).toBe("BMW");
      expect(resultDesc.data[2]!.brand).toBe("AUDI");
    });

    it("should calculate correct skip/limit for pagination", async () => {
      for (let i = 0; i < 5; i++) {
        await carRepository.create(
          buildCarCreateData({ plate: `PAG${i}0T1` }),
        );
      }

      const page1 = buildCarQueryData({ page: 1, limit: 2 });
      const result1 = await carRepository.findPaginated(page1);

      expect(result1.data).toHaveLength(2);
      expect(result1.totalCount).toBe(5);

      const page2 = buildCarQueryData({ page: 2, limit: 2 });
      const result2 = await carRepository.findPaginated(page2);

      expect(result2.data).toHaveLength(2);
      expect(result2.totalCount).toBe(5);

      const page3 = buildCarQueryData({ page: 3, limit: 2 });
      const result3 = await carRepository.findPaginated(page3);

      expect(result3.data).toHaveLength(1);
      expect(result3.totalCount).toBe(5);

      const ids = [
        ...result1.data.map((c) => c.id),
        ...result2.data.map((c) => c.id),
        ...result3.data.map((c) => c.id),
      ];
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(5);
    });
  });

  describe("update", () => {
    it("should apply partial updates and update updatedAt", async () => {
      const createdCar = await carRepository.create(
        buildCarCreateData({ brand: "TOYOTA", model: "COROLLA" }),
      );
      const originalUpdatedAt = createdCar.updatedAt;

      await new Promise((resolve) => setTimeout(resolve, 10));

      const updatedCar = await carRepository.update(createdCar.id, {
        model: "CAMRY",
      });

      expect(updatedCar.brand).toBe("TOYOTA");
      expect(updatedCar.model).toBe("CAMRY");
      expect(updatedCar.updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime(),
      );
    });

    it("should update brand", async () => {
      const createdCar = await carRepository.create(
        buildCarCreateData({ brand: "TOYOTA" }),
      );

      const updatedCar = await carRepository.update(createdCar.id, {
        brand: "HONDA",
      });

      expect(updatedCar.brand).toBe("HONDA");
    });

    it("should update year", async () => {
      const createdCar = await carRepository.create(
        buildCarCreateData({ year: 2023 }),
      );

      const updatedCar = await carRepository.update(createdCar.id, {
        year: 2025,
      });

      expect(updatedCar.year).toBe(2025);
    });

    it("should update category", async () => {
      const createdCar = await carRepository.create(
        buildCarCreateData({ category: "SEDAN" }),
      );

      const updatedCar = await carRepository.update(createdCar.id, {
        category: "SUV",
      });

      expect(updatedCar.category).toBe("SUV");
    });

    it("should update dailyRate", async () => {
      const createdCar = await carRepository.create(
        buildCarCreateData({ dailyRate: "100.00" }),
      );

      const updatedCar = await carRepository.update(createdCar.id, {
        dailyRate: "200.00",
      });

      expect(updatedCar.dailyRate).toBe("200.00");
    });

    it("should throw CarNotFoundError when updating a nonexistent car", async () => {
      await expect(
        carRepository.update("507f1f77bcf86cd799439011", { model: "TEST" }),
      ).rejects.toThrow(CarNotFoundError);
    });

    it("should throw CarConflictError when updating plate to an existing one", async () => {
      await carRepository.create(
        buildCarCreateData({ plate: "CONC0T1" }),
      );
      const car2 = await carRepository.create(
        buildCarCreateData({ plate: "CONC0T2" }),
      );

      await expect(
        carRepository.update(car2.id, { plate: "CONC0T1" }),
      ).rejects.toThrow(CarConflictError);
    });
  });

  describe("updateStatus", () => {
    it("should set status and update updatedAt", async () => {
      const createdCar = await carRepository.create(buildCarCreateData());
      const originalUpdatedAt = createdCar.updatedAt;

      await new Promise((resolve) => setTimeout(resolve, 10));

      const updatedCar = await carRepository.updateStatus(
        createdCar.id,
        "RENTED",
      );

      expect(updatedCar.status).toBe("RENTED");
      expect(updatedCar.updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime(),
      );
    });

    it("should throw CarNotFoundError when updating status of a nonexistent car", async () => {
      await expect(
        carRepository.updateStatus("507f1f77bcf86cd799439011", "RENTED"),
      ).rejects.toThrow(CarNotFoundError);
    });
  });
});
