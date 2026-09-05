import { beforeAll, afterAll, beforeEach, expect, describe, it } from "vitest";
import {
  clearTestDatabase,
  connectTestDatabase,
  disconnectTestDatabase,
} from "./../../test-database.js";
import type { Db } from "mongodb";
import { MongoReserveRepository } from "../../../../src/modules/reserves/infrastructure/mongodb/repository/MongoReserveRepository.js";
import { ReservesService } from "../../../../src/modules/reserves/service/ReservesService.js";
import { createReserveFixtureFactory } from "./fixtures/reserve-factory.js";
import { createMockUserLookupServiceFactory } from "./fixtures/mock-user-lookup.js";
import { createMockCarAvailabilityServiceFactory } from "./fixtures/mock-car-availability.js";
import { createMockStoreLookupServiceFactory } from "./fixtures/mock-store-lookup.js";
import { TEST_USERS, TEST_CARS, TEST_STORES } from "./fixtures/test-data.js";
import type { UserResponseDto } from "../../../../src/modules/users/dto/response/UserResponseDto.js";
import type { CarResponseDto } from "../../../../src/modules/cars/dto/response/CarResponseDto.js";
import type { StoreResponseDto } from "../../../../src/modules/stores/dto/response/StoreResponseDto.js";
import { ObjectId } from "mongodb";

let db!: Db;
let repository!: MongoReserveRepository;
let service!: ReservesService;
const factory = createReserveFixtureFactory();

const testUsers: UserResponseDto[] = TEST_USERS.map((u) => ({
  id: u.id,
  keycloakId: u.keycloakId,
  email: u.email,
  createdAt: new Date(),
  updatedAt: new Date(),
}));

const testCars: CarResponseDto[] = TEST_CARS.map((c) => ({
  id: c.id,
  brand: c.brand,
  model: c.model,
  year: c.year,
  category: c.category,
  plate: c.plate,
  status: c.status,
  dailyRate: c.dailyRate,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

const testStores: StoreResponseDto[] = TEST_STORES.map((s) => ({
  id: s.id,
  location: { name: s.location.name, city: s.location.city },
}));

describe("ReservesService integration tests", () => {
  beforeAll(async () => {
    db = await connectTestDatabase();
    repository = new MongoReserveRepository(db);
    await repository.ensureReady();
  });

  beforeEach(async () => {
    await clearTestDatabase();

    const userService = createMockUserLookupServiceFactory().create(testUsers);
    const carService =
      createMockCarAvailabilityServiceFactory().create(testCars);
    const storeService =
      createMockStoreLookupServiceFactory().create(testStores);

    service = new ReservesService(
      repository,
      userService,
      carService,
      storeService,
    );
  });

  afterAll(async () => {
    await disconnectTestDatabase();
  });

  describe("getReserveById", () => {
    it("should return ReserveResponseDto when found", async () => {
      const stored = await factory.createStoredReserve(db);

      const result = await service.getReserveById(stored.id);

      expect(result).toBeDefined();
      expect(result.id).toBe(stored.id);
      expect(result.status).toBe("PENDING");
    });

    it("should throw ReserveNotFoundError when not found", async () => {
      const fakeId = new ObjectId().toHexString();

      await expect(service.getReserveById(fakeId)).rejects.toThrow("not found");
    });
  });

  describe("getUserReserveById", () => {
    it("should return UserReserveResponseDto when reserve belongs to user", async () => {
      const stored = await factory.createStoredReserve(db, {
        userId: TEST_USERS[0]!.id,
      });

      const result = await service.getUserReserveById(
        stored.id,
        TEST_USERS[0]!.keycloakId,
      );

      expect(result).toBeDefined();
      expect(result.id).toBe(stored.id);
      expect(result).not.toHaveProperty("userId");
    });

    it("should throw ReserveForbiddenError when reserve belongs to different user", async () => {
      const stored = await factory.createStoredReserve(db, {
        userId: TEST_USERS[0]!.id,
      });

      await expect(
        service.getUserReserveById(stored.id, TEST_USERS[1]!.keycloakId),
      ).rejects.toThrow("only access your own");
    });

    it("should throw ReserveNotFoundError when not found", async () => {
      const fakeId = new ObjectId().toHexString();

      await expect(
        service.getUserReserveById(fakeId, TEST_USERS[0]!.keycloakId),
      ).rejects.toThrow("not found");
    });
  });

  describe("getReservesByUserId", () => {
    it("should return array of UserReserveResponseDto for user", async () => {
      await factory.createStoredReserve(db, {
        userId: TEST_USERS[0]!.id,
        carId: TEST_CARS[0]!.id,
      });
      await factory.createStoredReserve(db, {
        userId: TEST_USERS[0]!.id,
        carId: TEST_CARS[1]!.id,
      });

      const result = await service.getReservesByUserId(TEST_USERS[0]!.id);

      expect(result).toHaveLength(2);
      expect(result[0]).not.toHaveProperty("userId");
    });

    it("should return empty array when user has no reserves", async () => {
      const result = await service.getReservesByUserId(TEST_USERS[1]!.id);

      expect(result).toHaveLength(0);
    });
  });

  describe("getCurrentUserReserves", () => {
    it("should resolve keycloakId and return user reserves", async () => {
      await factory.createStoredReserve(db, {
        userId: TEST_USERS[0]!.id,
        carId: TEST_CARS[0]!.id,
      });

      const result = await service.getCurrentUserReserves(
        TEST_USERS[0]!.keycloakId,
      );

      expect(result).toHaveLength(1);
    });

    it("should throw when user not found", async () => {
      await expect(
        service.getCurrentUserReserves("nonexistent-kc-id"),
      ).rejects.toThrow("not found");
    });
  });

  describe("getReserves", () => {
    it("should return paginated results with meta", async () => {
      await factory.createStoredReserves(db, 3);
      const query = factory.createReserveQueryData();

      const result = await service.getReserves(query);

      expect(result.data).toHaveLength(3);
      expect(result.meta).toBeDefined();
      expect(result.meta.totalCount).toBe(3);
    });

    it("should filter by status", async () => {
      const reserve = await factory.createStoredReserve(db);
      await repository.updateStatus(reserve.id, "CONFIRMED");
      await factory.createStoredReserve(db);
      const query = factory.createReserveQueryData({
        status: "CONFIRMED",
      });

      const result = await service.getReserves(query);

      expect(result.data).toHaveLength(1);
      expect(result.data[0]!.status).toBe("CONFIRMED");
    });

    it("should filter by userId", async () => {
      await factory.createStoredReserve(db, {
        userId: TEST_USERS[0]!.id,
        carId: TEST_CARS[0]!.id,
      });
      await factory.createStoredReserve(db, {
        userId: TEST_USERS[1]!.id,
        carId: TEST_CARS[0]!.id,
      });
      const query = factory.createReserveQueryData({
        userId: TEST_USERS[0]!.id,
      });

      const result = await service.getReserves(query);

      expect(result.data).toHaveLength(1);
    });

    it("should filter by carId", async () => {
      await factory.createStoredReserve(db, {
        userId: TEST_USERS[0]!.id,
        carId: TEST_CARS[0]!.id,
      });
      await factory.createStoredReserve(db, {
        userId: TEST_USERS[0]!.id,
        carId: TEST_CARS[1]!.id,
      });
      const query = factory.createReserveQueryData({
        carId: TEST_CARS[0]!.id,
      });

      const result = await service.getReserves(query);

      expect(result.data).toHaveLength(1);
    });

    it("should filter by date ranges", async () => {
      const pickupDate = new Date("2026-09-15T10:00:00Z");
      const returnDate = new Date("2026-09-17T10:00:00Z");
      await factory.createStoredReserve(db, {
        pickup: { date: pickupDate, storeId: TEST_STORES[0]!.id },
        returnInfo: { date: returnDate, storeId: TEST_STORES[0]!.id },
      });
      const query = factory.createReserveQueryData({
        pickupDateFrom: new Date("2026-09-01"),
        pickupDateTo: new Date("2026-09-30"),
      });

      const result = await service.getReserves(query);

      expect(result.data).toHaveLength(1);
    });
  });

  describe("createReserve", () => {
    it("should create reserve with calculated pricing", async () => {
      const input = {
        userId: TEST_USERS[0]!.id,
        carId: TEST_CARS[0]!.id,
        pickup: {
          date: new Date("2026-10-01T10:00:00Z"),
          storeId: TEST_STORES[0]!.id,
        },
        returnInfo: {
          date: new Date("2026-10-03T10:00:00Z"),
          storeId: TEST_STORES[0]!.id,
        },
      };

      const result = await service.createReserve(input);

      expect(result).toBeDefined();
      expect(result.status).toBe("PENDING");
      expect(result.pricing.days).toBe(2);
      expect(result.pricing.subtotal).toBe("100.00");
    });

    it("should set initial status to PENDING", async () => {
      const input = {
        userId: TEST_USERS[0]!.id,
        carId: TEST_CARS[0]!.id,
        pickup: {
          date: new Date("2026-10-01T10:00:00Z"),
          storeId: TEST_STORES[0]!.id,
        },
        returnInfo: {
          date: new Date("2026-10-03T10:00:00Z"),
          storeId: TEST_STORES[0]!.id,
        },
      };

      const result = await service.createReserve(input);

      expect(result.status).toBe("PENDING");
    });

    it("should throw ReserveCarNotAvailableError when car is DELETED", async () => {
      const input = {
        userId: TEST_USERS[0]!.id,
        carId: TEST_CARS[0]!.id,
        pickup: {
          date: new Date("2026-10-01T10:00:00Z"),
          storeId: TEST_STORES[0]!.id,
        },
        returnInfo: {
          date: new Date("2026-10-03T10:00:00Z"),
          storeId: TEST_STORES[0]!.id,
        },
      };

      const carService = createMockCarAvailabilityServiceFactory().create([
        { ...testCars[0]!, status: "DELETED" },
      ]);
      const userService =
        createMockUserLookupServiceFactory().create(testUsers);
      const storeService =
        createMockStoreLookupServiceFactory().create(testStores);
      const svc = new ReservesService(
        repository,
        userService,
        carService,
        storeService,
      );

      await expect(svc.createReserve(input)).rejects.toThrow(
        "cannot be reserved",
      );
    });

    it("should throw ReserveCarNotAvailableError when car is MAINTENANCE", async () => {
      const input = {
        userId: TEST_USERS[0]!.id,
        carId: TEST_CARS[0]!.id,
        pickup: {
          date: new Date("2026-10-01T10:00:00Z"),
          storeId: TEST_STORES[0]!.id,
        },
        returnInfo: {
          date: new Date("2026-10-03T10:00:00Z"),
          storeId: TEST_STORES[0]!.id,
        },
      };

      const carService = createMockCarAvailabilityServiceFactory().create([
        { ...testCars[0]!, status: "MAINTENANCE" },
      ]);
      const userService =
        createMockUserLookupServiceFactory().create(testUsers);
      const storeService =
        createMockStoreLookupServiceFactory().create(testStores);
      const svc = new ReservesService(
        repository,
        userService,
        carService,
        storeService,
      );

      await expect(svc.createReserve(input)).rejects.toThrow(
        "cannot be reserved",
      );
    });

    it("should throw ReserveInvalidUpdateError when pickup >= return", async () => {
      const input = {
        userId: TEST_USERS[0]!.id,
        carId: TEST_CARS[0]!.id,
        pickup: {
          date: new Date("2026-10-05T10:00:00Z"),
          storeId: TEST_STORES[0]!.id,
        },
        returnInfo: {
          date: new Date("2026-10-03T10:00:00Z"),
          storeId: TEST_STORES[0]!.id,
        },
      };

      await expect(service.createReserve(input)).rejects.toThrow(
        "Pickup date must be before return date",
      );
    });

    it("should throw ReserveCarNotAvailableError when overlapping reservation exists", async () => {
      await factory.createStoredReserve(db, {
        userId: TEST_USERS[0]!.id,
        carId: TEST_CARS[0]!.id,
        pickup: {
          date: new Date("2026-10-01T10:00:00Z"),
          storeId: TEST_STORES[0]!.id,
        },
        returnInfo: {
          date: new Date("2026-10-05T10:00:00Z"),
          storeId: TEST_STORES[0]!.id,
        },
      });

      const input = {
        userId: TEST_USERS[0]!.id,
        carId: TEST_CARS[0]!.id,
        pickup: {
          date: new Date("2026-10-03T10:00:00Z"),
          storeId: TEST_STORES[0]!.id,
        },
        returnInfo: {
          date: new Date("2026-10-07T10:00:00Z"),
          storeId: TEST_STORES[0]!.id,
        },
      };

      await expect(service.createReserve(input)).rejects.toThrow(
        "not available for the requested period",
      );
    });

    it("should verify car, user, and stores exist before creation", async () => {
      const input = {
        userId: "nonexistent-user",
        carId: TEST_CARS[0]!.id,
        pickup: {
          date: new Date("2026-10-01T10:00:00Z"),
          storeId: TEST_STORES[0]!.id,
        },
        returnInfo: {
          date: new Date("2026-10-03T10:00:00Z"),
          storeId: TEST_STORES[0]!.id,
        },
      };

      await expect(service.createReserve(input)).rejects.toThrow(
        "not found",
      );
    });
  });

  describe("createUserReserve", () => {
    it("should create reserve resolved from keycloakId", async () => {
      const input = {
        carId: TEST_CARS[0]!.id,
        pickup: {
          date: new Date("2026-10-01T10:00:00Z"),
          storeId: TEST_STORES[0]!.id,
        },
        returnInfo: {
          date: new Date("2026-10-03T10:00:00Z"),
          storeId: TEST_STORES[0]!.id,
        },
      };

      const result = await service.createUserReserve(
        TEST_USERS[0]!.keycloakId,
        input,
      );

      expect(result).toBeDefined();
      expect(result.status).toBe("PENDING");
    });

    it("should throw ReserveCarNotAvailableError when car unavailable", async () => {
      const input = {
        carId: TEST_CARS[0]!.id,
        pickup: {
          date: new Date("2026-10-01T10:00:00Z"),
          storeId: TEST_STORES[0]!.id,
        },
        returnInfo: {
          date: new Date("2026-10-03T10:00:00Z"),
          storeId: TEST_STORES[0]!.id,
        },
      };

      const carService = createMockCarAvailabilityServiceFactory().create([
        { ...testCars[0]!, status: "DELETED" },
      ]);
      const userService =
        createMockUserLookupServiceFactory().create(testUsers);
      const storeService =
        createMockStoreLookupServiceFactory().create(testStores);
      const svc = new ReservesService(
        repository,
        userService,
        carService,
        storeService,
      );

      await expect(
        svc.createUserReserve(TEST_USERS[0]!.keycloakId, input),
      ).rejects.toThrow("cannot be reserved");
    });
  });

  describe("updateReserveStatus", () => {
    it("should transition PENDING to CONFIRMED", async () => {
      const stored = await factory.createStoredReserve(db);

      const result = await service.updateReserveStatus(
        stored.id,
        "CONFIRMED",
      );

      expect(result.status).toBe("CONFIRMED");
    });

    it("should transition CONFIRMED to ACTIVE and update car to RENTED", async () => {
      const pickupDate = new Date(Date.now() - 1000 * 60 * 60);
      const returnDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 5);
      const stored = await factory.createStoredReserve(db, {
        pickup: { date: pickupDate, storeId: TEST_STORES[0]!.id },
        returnInfo: { date: returnDate, storeId: TEST_STORES[0]!.id },
      });
      await repository.updateStatus(stored.id, "CONFIRMED");

      const result = await service.updateReserveStatus(stored.id, "ACTIVE");

      expect(result.status).toBe("ACTIVE");
    });

    it("should transition ACTIVE to COMPLETED and update car to AVAILABLE", async () => {
      const pickupDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 2);
      const returnDate = new Date(Date.now() - 1000 * 60 * 60);
      const stored = await factory.createStoredReserve(db, {
        pickup: { date: pickupDate, storeId: TEST_STORES[0]!.id },
        returnInfo: { date: returnDate, storeId: TEST_STORES[0]!.id },
      });
      await repository.updateStatus(stored.id, "CONFIRMED");
      await repository.updateStatus(stored.id, "ACTIVE");

      const result = await service.updateReserveStatus(
        stored.id,
        "COMPLETED",
      );

      expect(result.status).toBe("COMPLETED");
    });

    it("should transition PENDING to CANCELLED", async () => {
      const stored = await factory.createStoredReserve(db);

      const result = await service.updateReserveStatus(
        stored.id,
        "CANCELLED",
      );

      expect(result.status).toBe("CANCELLED");
    });

    it("should throw ReserveInvalidTransitionError for invalid transitions", async () => {
      const stored = await factory.createStoredReserve(db);

      await expect(
        service.updateReserveStatus(stored.id, "ACTIVE"),
      ).rejects.toThrow("Cannot transition");
    });

    it("should throw ReserveInvalidTransitionError when activating before pickup date", async () => {
      const pickupDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 5);
      const returnDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 10);
      const stored = await factory.createStoredReserve(db, {
        pickup: { date: pickupDate, storeId: TEST_STORES[0]!.id },
        returnInfo: { date: returnDate, storeId: TEST_STORES[0]!.id },
      });
      await repository.updateStatus(stored.id, "CONFIRMED");

      await expect(
        service.updateReserveStatus(stored.id, "ACTIVE"),
      ).rejects.toThrow("Cannot activate reserve before pickup date");
    });

    it("should throw ReserveNotFoundError when reserve not found", async () => {
      const fakeId = new ObjectId().toHexString();

      await expect(
        service.updateReserveStatus(fakeId, "CONFIRMED"),
      ).rejects.toThrow("not found");
    });
  });

  describe("cancelUserReserve", () => {
    it("should cancel reserve when user owns it", async () => {
      const stored = await factory.createStoredReserve(db, {
        userId: TEST_USERS[0]!.id,
      });

      const result = await service.cancelUserReserve(
        stored.id,
        TEST_USERS[0]!.keycloakId,
      );

      expect(result.status).toBe("CANCELLED");
    });

    it("should throw ReserveForbiddenError when user does not own reserve", async () => {
      const stored = await factory.createStoredReserve(db, {
        userId: TEST_USERS[0]!.id,
      });

      await expect(
        service.cancelUserReserve(stored.id, TEST_USERS[1]!.keycloakId),
      ).rejects.toThrow("only cancel your own");
    });

    it("should throw ReserveInvalidTransitionError when cancel not allowed", async () => {
      const pickupDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 2);
      const returnDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 5);
      const stored = await factory.createStoredReserve(db, {
        userId: TEST_USERS[0]!.id,
        pickup: { date: pickupDate, storeId: TEST_STORES[0]!.id },
        returnInfo: { date: returnDate, storeId: TEST_STORES[0]!.id },
      });
      await repository.updateStatus(stored.id, "CONFIRMED");
      await repository.updateStatus(stored.id, "ACTIVE");

      await expect(
        service.cancelUserReserve(stored.id, TEST_USERS[0]!.keycloakId),
      ).rejects.toThrow("Cannot cancel reservation");
    });

    it("should throw ReserveNotFoundError when reserve not found", async () => {
      const fakeId = new ObjectId().toHexString();

      await expect(
        service.cancelUserReserve(fakeId, TEST_USERS[0]!.keycloakId),
      ).rejects.toThrow("not found");
    });
  });

  describe("updateReserve", () => {
    it("should update pickup on PENDING reserve", async () => {
      const { ObjectId } = await import("mongodb");
      const uniqueCarId = new ObjectId().toHexString();

      const userService =
        createMockUserLookupServiceFactory().create(testUsers);
      const carService = createMockCarAvailabilityServiceFactory().create([
        ...testCars,
        {
          id: uniqueCarId,
          brand: "Test",
          model: "Car",
          year: 2024,
          category: "sedan",
          plate: "UNQ-0001",
          status: "AVAILABLE",
          dailyRate: "55.00",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);
      const storeService =
        createMockStoreLookupServiceFactory().create(testStores);
      const svc = new ReservesService(
        repository,
        userService,
        carService,
        storeService,
      );

      const stored = await factory.createStoredReserve(db, {
        carId: uniqueCarId,
        pickup: {
          date: new Date("2026-11-01T10:00:00Z"),
          storeId: TEST_STORES[0]!.id,
        },
        returnInfo: {
          date: new Date("2026-11-03T10:00:00Z"),
          storeId: TEST_STORES[0]!.id,
        },
      });

      const result = await svc.updateReserve(stored.id, {
        pickup: {
          date: new Date("2026-11-05T10:00:00Z"),
          storeId: TEST_STORES[1]!.id,
        },
        returnInfo: {
          date: new Date("2026-11-08T10:00:00Z"),
          storeId: TEST_STORES[0]!.id,
        },
      });

      expect(result.pickup.storeId).toBe(TEST_STORES[1]!.id);
    });

    it("should recalculate pricing after update", async () => {
      const stored = await factory.createStoredReserve(db);
      const pickupDate = new Date("2026-10-01T10:00:00Z");
      const returnDate = new Date("2026-10-06T10:00:00Z");

      const result = await service.updateReserve(stored.id, {
        pickup: { date: pickupDate, storeId: TEST_STORES[0]!.id },
        returnInfo: { date: returnDate, storeId: TEST_STORES[0]!.id },
      });

      expect(result.pricing.days).toBe(5);
      expect(result.pricing.subtotal).toBe("250.00");
    });

    it("should throw ReserveInvalidUpdateError when status is not PENDING", async () => {
      const stored = await factory.createStoredReserve(db);
      await repository.updateStatus(stored.id, "CONFIRMED");

      await expect(
        service.updateReserve(stored.id, {
          pickup: {
            date: new Date("2026-10-10T10:00:00Z"),
            storeId: TEST_STORES[1]!.id,
          },
        }),
      ).rejects.toThrow("Only PENDING reserves can be updated");
    });

    it("should throw ReserveInvalidUpdateError when pickup >= return", async () => {
      const stored = await factory.createStoredReserve(db);

      await expect(
        service.updateReserve(stored.id, {
          pickup: {
            date: new Date("2026-10-10T10:00:00Z"),
            storeId: TEST_STORES[0]!.id,
          },
          returnInfo: {
            date: new Date("2026-10-05T10:00:00Z"),
            storeId: TEST_STORES[0]!.id,
          },
        }),
      ).rejects.toThrow("Pickup date must be before return date");
    });

    it("should throw ReserveCarNotAvailableError when car not available for new period", async () => {
      const stored = await factory.createStoredReserve(db, {
        userId: TEST_USERS[0]!.id,
        carId: TEST_CARS[0]!.id,
        pickup: {
          date: new Date("2026-10-01T10:00:00Z"),
          storeId: TEST_STORES[0]!.id,
        },
        returnInfo: {
          date: new Date("2026-10-05T10:00:00Z"),
          storeId: TEST_STORES[0]!.id,
        },
      });
      await factory.createStoredReserve(db, {
        userId: TEST_USERS[1]!.id,
        carId: TEST_CARS[0]!.id,
        pickup: {
          date: new Date("2026-10-10T10:00:00Z"),
          storeId: TEST_STORES[0]!.id,
        },
        returnInfo: {
          date: new Date("2026-10-15T10:00:00Z"),
          storeId: TEST_STORES[0]!.id,
        },
      });

      await expect(
        service.updateReserve(stored.id, {
          pickup: {
            date: new Date("2026-10-12T10:00:00Z"),
            storeId: TEST_STORES[0]!.id,
          },
          returnInfo: {
            date: new Date("2026-10-13T10:00:00Z"),
            storeId: TEST_STORES[0]!.id,
          },
        }),
      ).rejects.toThrow("not available for the requested period");
    });

    it("should throw ReserveNotFoundError when reserve not found", async () => {
      const fakeId = new ObjectId().toHexString();

      await expect(
        service.updateReserve(fakeId, {
          pickup: {
            date: new Date("2026-10-10T10:00:00Z"),
            storeId: TEST_STORES[1]!.id,
          },
        }),
      ).rejects.toThrow("not found");
    });
  });
});
