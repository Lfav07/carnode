import { beforeAll, afterAll, beforeEach, expect, describe, it } from "vitest";
import {
  clearTestDatabase,
  connectTestDatabase,
  disconnectTestDatabase,
} from "../../test-database.js";
import type { Db } from "mongodb";
import { MongoReserveRepository } from "../../../../src/modules/reserves/infrastructure/mongodb/repository/MongoReserveRepository.js";
import { createReserveFixtureFactory } from "./fixtures/reserve-factory.js";
import { TEST_USERS, TEST_CARS, TEST_STORES } from "./fixtures/test-data.js";

let db!: Db;
let repository!: MongoReserveRepository;
const factory = createReserveFixtureFactory();

describe("Reserve repository integration tests", () => {
  beforeAll(async () => {
    db = await connectTestDatabase();
    repository = new MongoReserveRepository(db);
    await repository.ensureReady();
  });

  beforeEach(async () => {
    await clearTestDatabase();
  });

  afterAll(async () => {
    await disconnectTestDatabase();
  });

  describe("create", () => {
    it("should save reserve with PENDING status", async () => {
      const input = factory.createReserveCreateData();

      const created = await repository.create(input);

      expect(created).toBeDefined();
      expect(created.id).toBeDefined();
      expect(created.status).toBe("PENDING");
      expect(created.userId).toBe(input.userId);
      expect(created.carId).toBe(input.carId);
    });

    it("should persist all pickup/return/pricing fields correctly", async () => {
      const input = factory.createReserveCreateData();

      const created = await repository.create(input);

      expect(created.pickup.date).toBeInstanceOf(Date);
      expect(created.pickup.storeId).toBe(input.pickup.storeId);
      expect(created.returnInfo.date).toBeInstanceOf(Date);
      expect(created.returnInfo.storeId).toBe(input.returnInfo.storeId);
      expect(created.pricing.dailyRate).toBe(input.pricing.dailyRate);
      expect(created.pricing.days).toBe(input.pricing.days);
      expect(created.pricing.subtotal).toBe(input.pricing.subtotal);
    });

    it("should set createdAt and updatedAt to current time", async () => {
      const before = Date.now();
      const input = factory.createReserveCreateData();

      const created = await repository.create(input);

      const after = Date.now();
      expect(created.createdAt.getTime()).toBeGreaterThanOrEqual(before);
      expect(created.createdAt.getTime()).toBeLessThanOrEqual(after);
      expect(created.updatedAt.getTime()).toBeGreaterThanOrEqual(before);
      expect(created.updatedAt.getTime()).toBeLessThanOrEqual(after);
    });
  });

  describe("findById", () => {
    it("should return reserve when found", async () => {
      const stored = await factory.createStoredReserve(db);

      const found = await repository.findById(stored.id);

      expect(found).not.toBeNull();
      expect(found!.id).toBe(stored.id);
    });

    it("should return null when reserve does not exist", async () => {
      const { ObjectId } = await import("mongodb");
      const fakeId = new ObjectId().toHexString();

      const found = await repository.findById(fakeId);

      expect(found).toBeNull();
    });

    it("should correctly map all domain fields from document", async () => {
      const input = factory.createReserveCreateData();
      const stored = await repository.create(input);

      const found = await repository.findById(stored.id);

      expect(found).not.toBeNull();
      expect(found!.userId).toBe(input.userId);
      expect(found!.carId).toBe(input.carId);
      expect(found!.pickup.storeId).toBe(input.pickup.storeId);
      expect(found!.returnInfo.storeId).toBe(input.returnInfo.storeId);
      expect(found!.pricing.days).toBe(input.pricing.days);
      expect(found!.status).toBe("PENDING");
    });
  });

  describe("findByUserId", () => {
    it("should return reserves for given user sorted by createdAt desc", async () => {
      const user1Reserve = await factory.createStoredReserve(db, {
        userId: TEST_USERS[0]!.id,
        carId: TEST_CARS[0]!.id,
      });
      await factory.createStoredReserve(db, {
        userId: TEST_USERS[1]!.id,
        carId: TEST_CARS[0]!.id,
      });

      const found = await repository.findByUserId(TEST_USERS[0]!.id);

      expect(found).toHaveLength(1);
      expect(found[0]!.id).toBe(user1Reserve.id);
    });

    it("should return empty array when user has no reserves", async () => {
      const found = await repository.findByUserId(TEST_USERS[1]!.id);

      expect(found).toHaveLength(0);
    });
  });

  describe("findPaginated", () => {
    it("should return paginated results with default sort", async () => {
      await factory.createStoredReserves(db, 3);
      const query = factory.createReserveQueryData();

      const result = await repository.findPaginated(query);

      expect(result.data).toHaveLength(3);
      expect(result.totalCount).toBe(3);
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

      const result = await repository.findPaginated(query);

      expect(result.data).toHaveLength(1);
      expect(result.data[0]!.userId).toBe(TEST_USERS[0]!.id);
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

      const result = await repository.findPaginated(query);

      expect(result.data).toHaveLength(1);
      expect(result.data[0]!.carId).toBe(TEST_CARS[0]!.id);
    });

    it("should filter by status", async () => {
      const reserve = await factory.createStoredReserve(db);
      await repository.updateStatus(reserve.id, "CONFIRMED");
      await factory.createStoredReserve(db);
      const query = factory.createReserveQueryData({
        status: "CONFIRMED",
      });

      const result = await repository.findPaginated(query);

      expect(result.data).toHaveLength(1);
      expect(result.data[0]!.status).toBe("CONFIRMED");
    });

    it("should filter by pickup date range", async () => {
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

      const result = await repository.findPaginated(query);

      expect(result.data).toHaveLength(1);
    });

    it("should filter by return date range", async () => {
      const pickupDate = new Date("2026-09-15T10:00:00Z");
      const returnDate = new Date("2026-09-17T10:00:00Z");
      await factory.createStoredReserve(db, {
        pickup: { date: pickupDate, storeId: TEST_STORES[0]!.id },
        returnInfo: { date: returnDate, storeId: TEST_STORES[0]!.id },
      });
      const query = factory.createReserveQueryData({
        returnDateFrom: new Date("2026-09-01"),
        returnDateTo: new Date("2026-09-30"),
      });

      const result = await repository.findPaginated(query);

      expect(result.data).toHaveLength(1);
    });

    it("should combine multiple filters", async () => {
      await factory.createStoredReserve(db, {
        userId: TEST_USERS[0]!.id,
        carId: TEST_CARS[0]!.id,
      });
      await factory.createStoredReserve(db, {
        userId: TEST_USERS[0]!.id,
        carId: TEST_CARS[1]!.id,
      });
      const query = factory.createReserveQueryData({
        userId: TEST_USERS[0]!.id,
        carId: TEST_CARS[0]!.id,
      });

      const result = await repository.findPaginated(query);

      expect(result.data).toHaveLength(1);
      expect(result.data[0]!.carId).toBe(TEST_CARS[0]!.id);
    });

    it("should respect page and limit", async () => {
      await factory.createStoredReserves(db, 5);
      const query = factory.createReserveQueryData({ page: 2, limit: 2 });

      const result = await repository.findPaginated(query);

      expect(result.data).toHaveLength(2);
      expect(result.totalCount).toBe(5);
    });

    it("should return correct totalCount", async () => {
      await factory.createStoredReserves(db, 3);
      const query = factory.createReserveQueryData();

      const result = await repository.findPaginated(query);

      expect(result.totalCount).toBe(3);
    });
  });

  describe("update", () => {
    it("should update pickup fields", async () => {
      const stored = await factory.createStoredReserve(db);
      const newPickupDate = new Date("2026-10-01T10:00:00Z");

      const updated = await repository.update(stored.id, {
        pickup: { date: newPickupDate, storeId: TEST_STORES[1]!.id },
      });

      expect(updated.pickup.date.toISOString()).toBe(
        newPickupDate.toISOString(),
      );
      expect(updated.pickup.storeId).toBe(TEST_STORES[1]!.id);
    });

    it("should update returnInfo fields", async () => {
      const stored = await factory.createStoredReserve(db);
      const newReturnDate = new Date("2026-10-05T10:00:00Z");

      const updated = await repository.update(stored.id, {
        returnInfo: { date: newReturnDate, storeId: TEST_STORES[1]!.id },
      });

      expect(updated.returnInfo.date.toISOString()).toBe(
        newReturnDate.toISOString(),
      );
      expect(updated.returnInfo.storeId).toBe(TEST_STORES[1]!.id);
    });

    it("should update pricing fields", async () => {
      const stored = await factory.createStoredReserve(db);

      const updated = await repository.update(stored.id, {
        pricing: { dailyRate: "75.00", days: 5, subtotal: "375.00" },
      });

      expect(updated.pricing.dailyRate).toBe("75.00");
      expect(updated.pricing.days).toBe(5);
      expect(updated.pricing.subtotal).toBe("375.00");
    });

    it("should update updatedAt timestamp", async () => {
      const stored = await factory.createStoredReserve(db);
      const beforeUpdate = new Date();

      await repository.update(stored.id, {
        pricing: { dailyRate: "60.00", days: 3, subtotal: "180.00" },
      });

      const afterUpdate = await repository.findById(stored.id);
      expect(afterUpdate!.updatedAt.getTime()).toBeGreaterThanOrEqual(
        beforeUpdate.getTime(),
      );
    });

    it("should throw ReserveNotFoundError for nonexistent id", async () => {
      const { ObjectId } = await import("mongodb");
      const fakeId = new ObjectId().toHexString();

      await expect(
        repository.update(fakeId, {
          pricing: { dailyRate: "60.00", days: 3, subtotal: "180.00" },
        }),
      ).rejects.toThrow("not found");
    });
  });

  describe("updateStatus", () => {
    it("should update status field", async () => {
      const stored = await factory.createStoredReserve(db);

      const updated = await repository.updateStatus(stored.id, "CONFIRMED");

      expect(updated.status).toBe("CONFIRMED");
    });

    it("should update updatedAt timestamp", async () => {
      const stored = await factory.createStoredReserve(db);
      const beforeUpdate = new Date();

      await repository.updateStatus(stored.id, "CONFIRMED");

      const afterUpdate = await repository.findById(stored.id);
      expect(afterUpdate!.updatedAt.getTime()).toBeGreaterThanOrEqual(
        beforeUpdate.getTime(),
      );
    });

    it("should throw ReserveNotFoundError for nonexistent id", async () => {
      const { ObjectId } = await import("mongodb");
      const fakeId = new ObjectId().toHexString();

      await expect(
        repository.updateStatus(fakeId, "CONFIRMED"),
      ).rejects.toThrow("not found");
    });
  });

  describe("existsOverlappingReservation", () => {
    it("should return true when overlapping active reservation exists", async () => {
      const pickupDate = new Date("2026-09-15T10:00:00Z");
      const returnDate = new Date("2026-09-20T10:00:00Z");
      await factory.createStoredReserve(db, {
        carId: TEST_CARS[0]!.id,
        pickup: { date: pickupDate, storeId: TEST_STORES[0]!.id },
        returnInfo: { date: returnDate, storeId: TEST_STORES[0]!.id },
      });

      const exists = await repository.existsOverlappingReservation(
        TEST_CARS[0]!.id,
        new Date("2026-09-17T10:00:00Z"),
        new Date("2026-09-22T10:00:00Z"),
      );

      expect(exists).toBe(true);
    });

    it("should return false when no overlap", async () => {
      const pickupDate = new Date("2026-09-15T10:00:00Z");
      const returnDate = new Date("2026-09-20T10:00:00Z");
      await factory.createStoredReserve(db, {
        carId: TEST_CARS[0]!.id,
        pickup: { date: pickupDate, storeId: TEST_STORES[0]!.id },
        returnInfo: { date: returnDate, storeId: TEST_STORES[0]!.id },
      });

      const exists = await repository.existsOverlappingReservation(
        TEST_CARS[0]!.id,
        new Date("2026-10-01T10:00:00Z"),
        new Date("2026-10-05T10:00:00Z"),
      );

      expect(exists).toBe(false);
    });

    it("should ignore CANCELLED reservations", async () => {
      const pickupDate = new Date("2026-09-15T10:00:00Z");
      const returnDate = new Date("2026-09-20T10:00:00Z");
      const stored = await factory.createStoredReserve(db, {
        carId: TEST_CARS[0]!.id,
        pickup: { date: pickupDate, storeId: TEST_STORES[0]!.id },
        returnInfo: { date: returnDate, storeId: TEST_STORES[0]!.id },
      });
      await repository.updateStatus(stored.id, "CANCELLED");

      const exists = await repository.existsOverlappingReservation(
        TEST_CARS[0]!.id,
        new Date("2026-09-17T10:00:00Z"),
        new Date("2026-09-22T10:00:00Z"),
      );

      expect(exists).toBe(false);
    });

    it("should return true when partially overlapping", async () => {
      const pickupDate = new Date("2026-09-15T10:00:00Z");
      const returnDate = new Date("2026-09-20T10:00:00Z");
      await factory.createStoredReserve(db, {
        carId: TEST_CARS[0]!.id,
        pickup: { date: pickupDate, storeId: TEST_STORES[0]!.id },
        returnInfo: { date: returnDate, storeId: TEST_STORES[0]!.id },
      });

      const exists = await repository.existsOverlappingReservation(
        TEST_CARS[0]!.id,
        new Date("2026-09-18T10:00:00Z"),
        new Date("2026-09-25T10:00:00Z"),
      );

      expect(exists).toBe(true);
    });
  });
});
